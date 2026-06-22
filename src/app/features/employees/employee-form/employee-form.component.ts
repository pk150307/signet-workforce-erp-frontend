import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, UpperCasePipe } from '@angular/common';
import { SafeDatePipe } from '../../../shared/pipes/safe-date.pipe';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { EmployeeService } from '../../../core/services/employee.service';
import { parseApiDate } from '../../../core/utils/api-response.util';
import { EmployeeDocumentService } from '../../../core/services/employee-document.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepartmentService } from '../../../core/services/department.service';
import { DesignationService } from '../../../core/services/designation.service';
import { DesignationGradeService } from '../../../core/services/designation-grade.service';
import { SitesService } from '../../../core/services/sites.service';
import { ClientsService } from '../../../core/services/clients.service';
import { PfEsicService } from '../../../core/services/pf-esic.service';
import {
  CreateEmployeeDraftRequest,
  EMPLOYEE_DOCUMENT_LABELS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  EmployeeDocumentType,
  EmployeeStatus,
  EmployeeSubmitResult,
  EmploymentType,
  GENDER_LABELS,
  Gender,
  EmployeeListItem,
} from '../../../core/models/employee.models';
import { DepartmentListItem } from '../../../core/models/department.models';
import { DesignationListItem } from '../../../core/models/designation.models';
import { DesignationGradeListItem } from '../../../core/models/designation-grade.models';
import { SiteListItem } from '../../../core/models/sites.models';
import { ClientListItem } from '../../../core/models/client.models';
import {
  DocumentUploadComponent,
  DocumentUploadEvent,
} from '../components/document-upload/document-upload.component';
import { EmployeeStatusBadgeComponent } from '../components/employee-status-badge/employee-status-badge.component';

interface StoredDocument {
  key: string;
  type: EmployeeDocumentType;
  label: string;
  fileName: string;
  previewUrl: string | null;
  file?: File;
  documentId?: string;
}

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    SkeletonLoaderComponent,
    NgIf,
    NgFor,
    SafeDatePipe,
    DecimalPipe,
    UpperCasePipe,
    RouterLink,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatRadioModule,
    MatTooltipModule,
    DocumentUploadComponent,
    EmployeeStatusBadgeComponent,
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.less',
})
export class EmployeeFormComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly documentService = inject(EmployeeDocumentService);
  private readonly notification = inject(NotificationService);
  private readonly departmentService = inject(DepartmentService);
  private readonly designationService = inject(DesignationService);
  private readonly designationGradeService = inject(DesignationGradeService);
  private readonly sitesService = inject(SitesService);
  private readonly clientsService = inject(ClientsService);
  private readonly pfEsicService = inject(PfEsicService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly loading = signal(false);
  readonly lookupsLoading = signal(true);
  readonly saving = signal(false);
  readonly savingDraft = signal(false);
  readonly isEdit = signal(false);
  readonly submitted = signal<EmployeeSubmitResult | null>(null);
  readonly stepperOrientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly documents = signal<StoredDocument[]>([]);
  readonly uploadingDocKey = signal<string | null>(null);

  readonly departments = signal<DepartmentListItem[]>([]);
  readonly designations = signal<DesignationListItem[]>([]);
  readonly designationsLoading = signal(false);
  readonly gradesLoading = signal(false);
  readonly designationGrades = signal<DesignationGradeListItem[]>([]);
  readonly selectedGrade = signal<DesignationGradeListItem | null>(null);
  readonly selectedGradeGross = signal<number | null>(null);
  readonly clients = signal<ClientListItem[]>([]);
  readonly filteredSites = signal<SiteListItem[]>([]);
  readonly managers = signal<EmployeeListItem[]>([]);

  readonly genderOptions = [
    { value: Gender.Male, label: GENDER_LABELS[Gender.Male] },
    { value: Gender.Female, label: GENDER_LABELS[Gender.Female] },
    { value: Gender.Other, label: GENDER_LABELS[Gender.Other] },
    { value: Gender.PreferNotToSay, label: GENDER_LABELS[Gender.PreferNotToSay] },
  ];
  readonly employmentTypeOptions = [
    { value: EmploymentType.FullTime, label: EMPLOYMENT_TYPE_LABELS[EmploymentType.FullTime] },
    { value: EmploymentType.PartTime, label: EMPLOYMENT_TYPE_LABELS[EmploymentType.PartTime] },
    { value: EmploymentType.Contract, label: EMPLOYMENT_TYPE_LABELS[EmploymentType.Contract] },
    { value: EmploymentType.Freelance, label: EMPLOYMENT_TYPE_LABELS[EmploymentType.Freelance] },
    { value: EmploymentType.Internship, label: EMPLOYMENT_TYPE_LABELS[EmploymentType.Internship] },
    { value: EmploymentType.Temporary, label: EMPLOYMENT_TYPE_LABELS[EmploymentType.Temporary] },
  ];
  readonly maxDateOfBirth = new Date();
  readonly statusLabels = EMPLOYEE_STATUS_LABELS;
  readonly genderLabels = GENDER_LABELS;
  readonly employmentLabels = EMPLOYMENT_TYPE_LABELS;

  readonly requiredDocTypes: EmployeeDocumentType[] = [];
  readonly optionalDocTypes: EmployeeDocumentType[] = [
    'profile_photo', 'aadhaar', 'pan', 'offer_letter',
    'education_certificate', 'relieving_letter', 'cancelled_cheque',
  ];
  readonly docLabels = EMPLOYEE_DOCUMENT_LABELS;

  private employeeId: string | null = null;
  private draftEmployeeCode = '';

  readonly personalForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', Validators.maxLength(100)],
    email: ['', Validators.email],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    dateOfBirth: [null as Date | null],
    gender: [null as Gender | null],
    presentAddress: [''],
    permanentAddress: [''],
    city: [''],
    state: [''],
    pinCode: ['', Validators.pattern(/^\d{6}$/)],
    emergencyContactName: [''],
    emergencyContactRelationship: [''],
    emergencyContactPhone: ['', Validators.pattern(/^[6-9]\d{9}$/)],
  });

  readonly employmentForm = this.fb.group({
    employeeCode: [''],
    clientId: ['', Validators.required],
    siteId: ['', Validators.required],
    departmentId: [''],
    designationId: [''],
    designationGradeId: [''],
    reportingManagerId: [''],
    joiningDate: [null as Date | null],
    employmentType: [null as EmploymentType | null],
  });

  readonly statutoryForm = this.fb.group({
    aadhaarNumber: ['', Validators.pattern(/^\d{12}$/)],
    panNumber: ['', Validators.pattern(/^[A-Z]{5}\d{4}[A-Z]$/i)],
    uanNumber: ['', Validators.pattern(/^\d{12}$/)],
    pfNumber: [''],
    esicNumber: [''],
    bankName: [''],
    accountHolderName: [''],
    accountNumber: ['', Validators.pattern(/^\d{9,18}$/)],
    ifscCode: ['', Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/i)],
  });

  ngOnInit() {
    this.employeeId = this.route.snapshot.params['id'] ?? null;
    this.isEdit.set(!!this.employeeId);

    this.breakpointObserver.observe('(max-width: 768px)').subscribe(result => {
      this.stepperOrientation.set(result.matches ? 'vertical' : 'horizontal');
    });

    if (this.isEdit()) {
      this.loading.set(true);
    }

    this.loadLookups();

    this.employmentForm.get('clientId')?.valueChanges.subscribe(clientId => {
      this.onClientChange(clientId ?? '');
    });

    this.employmentForm.get('departmentId')?.valueChanges.subscribe(departmentId => {
      this.onDepartmentChange(departmentId ?? '');
    });

    this.employmentForm.get('designationId')?.valueChanges.subscribe(designationId => {
      this.onDesignationChange(designationId ?? '');
    });

    this.employmentForm.get('designationGradeId')?.valueChanges.subscribe(gradeId => {
      this.onGradeChange(gradeId ?? '');
    });
  }

  private onDepartmentChange(
    departmentId: string,
    preferredDesignationId?: string,
    preferredGradeId?: string,
  ) {
    const isPrefill = arguments.length > 1;

    if (!isPrefill) {
      this.employmentForm.patchValue({ designationId: '', designationGradeId: '' }, { emitEvent: false });
      this.designationGrades.set([]);
      this.selectedGrade.set(null);
      this.selectedGradeGross.set(null);
    }

    if (!departmentId?.trim()) {
      this.designations.set([]);
      return;
    }

    const clientId = this.employmentForm.get('clientId')?.value ?? '';
    this.designationsLoading.set(true);
    this.designationService.getAllForSelect({
      clientId: clientId || undefined,
      departmentId,
      isActive: true,
    }).subscribe({
      next: items => {
        this.designations.set(items.filter(d => d.designationCode && d.designationName));
        this.designationsLoading.set(false);

        if (preferredDesignationId) {
          this.employmentForm.patchValue({ designationId: preferredDesignationId }, { emitEvent: false });
          this.onDesignationChange(preferredDesignationId, preferredGradeId);
          return;
        }

        const current = this.employmentForm.get('designationId')?.value ?? '';
        if (
          current &&
          !this.designations().some(
            d => this.compareSelectValue(d.designationCode, current) || this.compareSelectValue(d.id, current),
          )
        ) {
          this.employmentForm.patchValue({ designationId: '', designationGradeId: '' }, { emitEvent: false });
          this.designationGrades.set([]);
        }
      },
      error: () => {
        this.designations.set([]);
        this.designationsLoading.set(false);
        this.notification.error('Failed to load designations for the selected department.');
      },
    });
  }

  private onDesignationChange(designationId: string, preferredGradeId?: string) {
    const isPrefill = arguments.length > 1;

    if (!isPrefill) {
      this.employmentForm.patchValue({ designationGradeId: '' }, { emitEvent: false });
      this.selectedGrade.set(null);
      this.selectedGradeGross.set(null);
    }

    if (!designationId?.trim()) {
      this.designationGrades.set([]);
      return;
    }

    this.gradesLoading.set(true);
    this.designationGradeService.getByDesignation(designationId).subscribe({
      next: grades => {
        this.designationGrades.set(grades.filter(g => g.isActive));
        this.gradesLoading.set(false);
        const gradeId = preferredGradeId ?? this.employmentForm.get('designationGradeId')?.value ?? '';
        if (
          gradeId &&
          grades.some(
            g => this.compareSelectValue(g.gradeCode, gradeId) || this.compareSelectValue(g.id, gradeId),
          )
        ) {
          this.employmentForm.patchValue({ designationGradeId: gradeId }, { emitEvent: false });
          this.onGradeChange(gradeId);
        } else if (!isPrefill) {
          this.employmentForm.patchValue({ designationGradeId: '' }, { emitEvent: false });
        }
      },
      error: () => {
        this.designationGrades.set([]);
        this.gradesLoading.set(false);
        this.notification.error('Failed to load pay grades for the selected designation.');
      },
    });
  }

  private onGradeChange(gradeId: string) {
    if (!gradeId) {
      this.selectedGrade.set(null);
      this.selectedGradeGross.set(null);
      return;
    }
    const grade = this.designationGrades().find(
      g => this.compareSelectValue(g.id, gradeId) || this.compareSelectValue(g.gradeCode, gradeId),
    ) ?? null;
    this.selectedGrade.set(grade);
    this.selectedGradeGross.set(grade?.grossSalary ?? null);
  }

  private onClientChange(clientId: string, preferredSiteId?: string) {
    if (!clientId) {
      this.filteredSites.set([]);
      this.departments.set([]);
      this.designations.set([]);
      this.designationGrades.set([]);
      this.employmentForm.patchValue(
        { siteId: '', departmentId: '', designationId: '', designationGradeId: '' },
        { emitEvent: false },
      );
      return;
    }

    this.employmentForm.patchValue(
      { departmentId: '', designationId: '', designationGradeId: '' },
      { emitEvent: false },
    );
    this.designations.set([]);
    this.designationGrades.set([]);
    this.selectedGrade.set(null);
    this.selectedGradeGross.set(null);

    this.departmentService.getAllForSelect({ clientId, isActive: true }).subscribe({
      next: departments => {
        this.departments.set(departments.filter(d => d.departmentCode && d.departmentName));
      },
      error: () => this.notification.error('Failed to load departments for the selected client.'),
    });

    this.sitesService.getAllForSelect({ clientId }).subscribe({
      next: sites => {
        this.filteredSites.set(sites.filter(s => s.id && s.siteName));
        const siteId = preferredSiteId ?? this.employmentForm.get('siteId')?.value ?? '';
        if (siteId && sites.some(s => this.compareSelectValue(s.id, siteId))) {
          this.employmentForm.patchValue({ siteId }, { emitEvent: false });
        } else if (siteId) {
          this.employmentForm.patchValue({ siteId: '' }, { emitEvent: false });
        }
      },
      error: () => {
        this.filteredSites.set([]);
        this.notification.error('Failed to load sites for the selected client.');
      },
    });
  }

  private loadLookups() {
    this.lookupsLoading.set(true);

    forkJoin({
      clients: this.clientsService.getAllForSelect(),
      managers: this.employeeService.getAllForSelect({ status: EmployeeStatus.Active }),
      code: this.isEdit()
        ? of({ code: '' })
        : this.employeeService.generateEmployeeCode(),
    }).pipe(
      finalize(() => this.lookupsLoading.set(false))
    ).subscribe({
      next: (data) => this.applyLookups(data),
      error: () => {
        this.notification.error('Failed to load form options. Please refresh and try again.');
      },
    });
  }

  private applyLookups(
    data: {
      clients: ClientListItem[];
      managers: EmployeeListItem[];
      code: { code: string };
    },
  ) {
    this.clients.set(data.clients.filter(c => c.id && c.companyName));
    this.managers.set(
      data.managers.filter(m => m.id && m.fullName && m.id !== this.employeeId)
    );

    if (!this.isEdit()) {
      this.draftEmployeeCode = data.code.code;
      this.employmentForm.patchValue({
        employeeCode: data.code.code,
      });
    }

    if (this.employeeId) {
      this.loadEmployee(this.employeeId);
    }
  }

  loadEmployee(id: string) {
    this.employeeService.getById(id).subscribe({
      next: (emp) => {
        this.draftEmployeeCode = emp.employeeCode;
        this.personalForm.patchValue({
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone,
          dateOfBirth: parseApiDate(emp.dateOfBirth),
          gender: emp.gender,
          presentAddress: emp.presentAddress ?? '',
          permanentAddress: emp.permanentAddress ?? '',
          city: emp.city ?? '',
          state: emp.state ?? '',
          pinCode: emp.pinCode ?? '',
          emergencyContactName: '',
          emergencyContactRelationship: '',
          emergencyContactPhone: '',
        });
        this.employmentForm.patchValue({
          employeeCode: emp.employeeCode,
          clientId: emp.clientId ?? '',
          siteId: emp.siteId ?? '',
          departmentId: emp.departmentId,
          designationId: emp.designationId,
          designationGradeId: emp.designationGradeId ?? '',
          reportingManagerId: emp.reportingManagerId ?? '',
          joiningDate: parseApiDate(emp.joiningDate),
          employmentType: emp.employmentType,
        }, { emitEvent: false });

        if (emp.clientId && emp.departmentId) {
          forkJoin({
            sites: this.sitesService.getAllForSelect({ clientId: emp.clientId }),
            departments: this.departmentService.getAllForSelect({ clientId: emp.clientId, isActive: true }),
            designations: this.designationService.getAllForSelect({
              clientId: emp.clientId,
              departmentId: emp.departmentId,
              isActive: true,
            }),
          }).subscribe({
            next: ({ sites, departments, designations }) => {
              this.filteredSites.set(sites.filter(s => s.id && s.siteName));
              this.departments.set(departments.filter(d => d.departmentCode && d.departmentName));
              const siteId = emp.siteId ?? '';
              if (siteId && sites.some(s => this.compareSelectValue(s.id, siteId))) {
                this.employmentForm.patchValue({ siteId }, { emitEvent: false });
              }
              this.designations.set(designations.filter(d => d.designationCode && d.designationName));
              if (emp.designationId) {
                this.onDesignationChange(emp.designationId, emp.designationGradeId ?? undefined);
              }
            },
            error: () => this.notification.error('Failed to load employment options for this employee.'),
          });
        } else if (emp.clientId) {
          this.onClientChange(emp.clientId, emp.siteId ?? undefined);
          if (emp.departmentId) {
            this.onDepartmentChange(
              emp.departmentId,
              emp.designationId || undefined,
              emp.designationGradeId || undefined,
            );
          }
        } else if (emp.departmentId) {
          this.onDepartmentChange(
            emp.departmentId,
            emp.designationId || undefined,
            emp.designationGradeId || undefined,
          );
        }

        this.statutoryForm.patchValue({
          aadhaarNumber: emp.aadhaarNumber ?? '',
          panNumber: emp.panNumber ?? '',
          uanNumber: emp.uanNumber ?? '',
          pfNumber: emp.pfNumber ?? '',
          esicNumber: emp.esiNumber ?? '',
          bankName: emp.bankName ?? '',
          accountHolderName: emp.accountHolderName ?? '',
          accountNumber: emp.accountNumber ?? '',
          ifscCode: emp.ifscCode ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Could not load employee from server.');
        this.loading.set(false);
        this.router.navigate(['/employees']);
      },
    });
  }

  copyPresentToPermanent() {
    const present = this.personalForm.get('presentAddress')?.value ?? '';
    this.personalForm.patchValue({ permanentAddress: present });
  }

  saveDraft(showNotification = true) {
    const payload = this.buildPayload(EmployeeStatus.Draft);
    if (!this.isMinimumValid()) {
      this.personalForm.markAllAsTouched();
      this.notification.warning('Enter first name and a valid mobile number to save.');
      return;
    }

    this.savingDraft.set(true);
    this.employeeService.saveDraft(payload).subscribe({
      next: (result) => {
        this.employeeId = result.id;
        this.draftEmployeeCode = result.employeeCode;
        this.employmentForm.patchValue({ employeeCode: result.employeeCode });
        this.savingDraft.set(false);
        if (showNotification) {
          this.notification.success('Draft saved. You can resume later from the employee list.');
        }
      },
      error: () => {
        this.savingDraft.set(false);
        if (showNotification) {
          this.notification.error('Failed to save draft.');
        }
      },
    });
  }

  onDocumentSelected(event: DocumentUploadEvent, key?: string) {
    const docKey = key ?? event.type;
    const previewUrl = event.file.type.startsWith('image/')
      ? URL.createObjectURL(event.file)
      : null;

    const stored: StoredDocument = {
      key: docKey,
      type: event.type,
      label: event.label ?? EMPLOYEE_DOCUMENT_LABELS[event.type],
      fileName: event.file.name,
      previewUrl,
      file: event.file,
    };

    this.documents.update(docs => {
      const filtered = docs.filter(d => d.key !== docKey);
      return [...filtered, stored];
    });

    if (this.employeeId) {
      this.uploadDocument(stored);
    }
  }

  onDocumentRemove(key: string) {
    const doc = this.documents().find(d => d.key === key);
    if (doc?.documentId && this.employeeId) {
      this.documentService.delete(this.employeeId, doc.documentId).subscribe();
    }
    this.documents.update(docs => docs.filter(d => d.key !== key));
  }

  addAdditionalDocument() {
    const key = `other_${crypto.randomUUID()}`;
    this.documents.update(docs => [...docs, {
      key,
      type: 'other',
      label: 'Additional Document',
      fileName: '',
      previewUrl: null,
    }]);
  }

  getDocument(key: string): StoredDocument | undefined {
    return this.documents().find(d => d.key === key);
  }

  get uploadedDocuments(): StoredDocument[] {
    return this.documents().filter(d => d.fileName);
  }

  get additionalDocuments(): StoredDocument[] {
    return this.documents().filter(d => d.type === 'other');
  }

  goToStep(index: number) {
    this.stepper.selectedIndex = index;
  }

  validateAllSteps(): boolean {
    this.personalForm.markAllAsTouched();

    if (!this.isMinimumValid()) {
      this.notification.error('First name and a valid mobile number are required.');
      return false;
    }

    if (this.personalForm.invalid || this.employmentForm.invalid || this.statutoryForm.invalid) {
      this.employmentForm.markAllAsTouched();
      this.notification.error('Please fix invalid field values before submitting.');
      return false;
    }

    return true;
  }

  isMinimumValid(): boolean {
    const firstName = this.personalForm.get('firstName')?.value?.trim();
    const phone = this.personalForm.get('phone')?.value?.trim();
    return !!firstName && !!phone && !this.personalForm.get('phone')?.invalid;
  }

  onSubmit() {
    if (!this.validateAllSteps()) return;

    this.saving.set(true);
    const payload = this.buildPayload(this.isEdit() ? EmployeeStatus.Active : EmployeeStatus.Active);

    if (this.isEdit() && this.employeeId) {
      this.employeeService.update(this.employeeId, { ...payload, id: this.employeeId }).subscribe({
        next: () => {
          this.syncStatutory(this.employeeId!);
          this.uploadPendingDocuments(this.employeeId!).subscribe({
            next: () => {
              this.saving.set(false);
              this.notification.success('Employee updated successfully.');
              this.router.navigate(['/employees', this.employeeId]);
            },
            error: () => {
              this.saving.set(false);
              this.router.navigate(['/employees', this.employeeId]);
            },
          });
        },
        error: () => {
          this.saving.set(false);
          this.notification.error('Failed to update employee.');
        },
      });
      return;
    }

    const save$ = this.employeeId
      ? this.employeeService.saveDraft({ ...payload, id: this.employeeId })
      : this.employeeService.saveDraft(payload);

    save$.subscribe({
      next: (result) => {
        this.employeeId = result.id;
        this.syncStatutory(result.id);
        this.uploadPendingDocuments(result.id).subscribe({
          next: () => this.finalizeSubmit(result.id, result.employeeCode),
          error: () => this.finalizeSubmit(result.id, result.employeeCode),
        });
      },
      error: () => {
        const localId = this.employeeId ?? crypto.randomUUID();
        this.finalizeSubmit(localId, payload.employeeCode ?? this.draftEmployeeCode, true);
      },
    });
  }

  private finalizeSubmit(id: string, code: string, offline = false) {
    if (offline) {
      this.submitted.set({
        id,
        employeeCode: code,
        status: EmployeeStatus.Active,
        fullName: `${this.personalForm.value.firstName} ${this.personalForm.value.lastName}`,
      });
      this.saving.set(false);
      this.notification.success('Employee created successfully.');
      return;
    }

    this.employeeService.submit(id).subscribe({
      next: (result) => {
        this.submitted.set(result);
        this.saving.set(false);
        this.notification.success('Employee onboarded successfully.');
      },
      error: () => {
        this.submitted.set({
          id,
          employeeCode: code,
          status: EmployeeStatus.Active,
          fullName: `${this.personalForm.value.firstName} ${this.personalForm.value.lastName}`,
        });
        this.saving.set(false);
        this.notification.success('Employee created successfully.');
      },
    });
  }

  private syncStatutory(employeeId: string) {
    const s = this.statutoryForm.getRawValue();
    this.pfEsicService.update(employeeId, {
      uanNumber: s.uanNumber || undefined,
      pfNumber: s.pfNumber || undefined,
      esicNumber: s.esicNumber || undefined,
      effectiveDate: this.formatDate(this.employmentForm.value.joiningDate ?? null),
      status: 'Active',
    }).subscribe({ error: () => undefined });
  }

  private uploadPendingDocuments(employeeId: string): Observable<void> {
    const pending = this.documents().filter(d => d.file && !d.documentId);
    if (pending.length === 0) return of(undefined);

    return forkJoin(
      pending.map(doc =>
        this.documentService.upload(employeeId, doc.type, doc.file!, doc.label).pipe(
          catchError(() => of(null))
        )
      )
    ).pipe(map(() => undefined));
  }

  private uploadDocument(doc: StoredDocument) {
    if (!this.employeeId || !doc.file) return;
    this.uploadingDocKey.set(doc.key);
    this.documentService.upload(this.employeeId, doc.type, doc.file, doc.label).subscribe({
      next: (uploaded) => {
        this.documents.update(docs =>
          docs.map(d => d.key === doc.key ? { ...d, documentId: uploaded.id, fileName: uploaded.fileName } : d)
        );
        this.uploadingDocKey.set(null);
      },
      error: () => this.uploadingDocKey.set(null),
    });
  }

  private buildPayload(status: EmployeeStatus): CreateEmployeeDraftRequest {
    const p = this.personalForm.getRawValue();
    const e = this.employmentForm.getRawValue();
    const s = this.statutoryForm.getRawValue();

    return {
      id: this.employeeId ?? undefined,
      employeeCode: e.employeeCode ?? this.draftEmployeeCode,
      firstName: p.firstName!.trim(),
      lastName: p.lastName?.trim() || '',
      email: p.email?.trim() || '',
      phone: p.phone!.trim(),
      dateOfBirth: this.formatDate(p.dateOfBirth ?? null),
      gender: p.gender ?? Gender.PreferNotToSay,
      presentAddress: p.presentAddress?.trim() || undefined,
      permanentAddress: p.permanentAddress?.trim() || p.presentAddress?.trim() || undefined,
      city: p.city?.trim() || undefined,
      state: p.state?.trim() || undefined,
      pinCode: p.pinCode?.trim() || undefined,
      emergencyContactName: p.emergencyContactName?.trim() || undefined,
      emergencyContactRelationship: p.emergencyContactRelationship?.trim() || undefined,
      emergencyContactPhone: p.emergencyContactPhone?.trim() || undefined,
      clientId: e.clientId!,
      siteId: e.siteId!,
      departmentId: e.departmentId || '',
      designationId: e.designationId || '',
      designationGradeId: e.designationGradeId || undefined,
      reportingManagerId: e.reportingManagerId || undefined,
      joiningDate: this.formatDate(e.joiningDate ?? null),
      employmentType: e.employmentType ?? EmploymentType.FullTime,
      basicSalary: this.selectedGrade()?.basicSalary ?? 0,
      grossSalary: this.selectedGrade()?.grossSalary ?? this.selectedGradeGross() ?? 0,
      aadhaarNumber: s.aadhaarNumber ?? undefined,
      panNumber: s.panNumber?.toUpperCase() ?? undefined,
      uanNumber: s.uanNumber ?? undefined,
      pfNumber: s.pfNumber ?? undefined,
      esicNumber: s.esicNumber ?? undefined,
      bankName: s.bankName ?? undefined,
      accountHolderName: s.accountHolderName ?? undefined,
      accountNumber: s.accountNumber ?? undefined,
      ifscCode: s.ifscCode?.toUpperCase() ?? undefined,
      status,
    };
  }

  compareSelectValue = (a: unknown, b: unknown): boolean => {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return String(a).toLowerCase() === String(b).toLowerCase();
  };

  getDepartmentName(ref: string): string {
    return this.departments().find(
      d => this.compareSelectValue(d.departmentCode, ref) || this.compareSelectValue(d.id, ref),
    )?.departmentName ?? '—';
  }

  getDesignationName(ref: string): string {
    return this.designations().find(
      d => this.compareSelectValue(d.designationCode, ref) || this.compareSelectValue(d.id, ref),
    )?.designationName ?? '—';
  }

  getGradeLabel(id: string): string {
    const grade = this.designationGrades().find(
      g => this.compareSelectValue(g.id, id) || this.compareSelectValue(g.gradeCode, id),
    );
    return grade ? `${grade.gradeCode} — ${grade.gradeName}` : '—';
  }

  getClientName(id: string): string {
    return this.clients().find(c => this.compareSelectValue(c.id, id))?.companyName ?? '—';
  }

  getSiteName(id: string): string {
    return this.filteredSites().find(s => this.compareSelectValue(s.id, id))?.siteName
      ?? '—';
  }

  getManagerName(id: string): string {
    return this.managers().find(m => this.compareSelectValue(m.id, id))?.fullName ?? '—';
  }

  isStepValid(stepIndex: number): boolean {
    if (stepIndex === 0) {
      return this.isMinimumValid();
    }
    return true;
  }

  addAnother() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/employees/new']);
    });
  }

  cancel() {
    this.router.navigate(['/employees']);
  }

  private formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }
}
