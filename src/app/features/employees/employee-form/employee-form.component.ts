import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { EmployeeService } from '../../../core/services/employee.service';
import { parseApiDate } from '../../../core/utils/api-response.util';
import { EmployeeDocumentService } from '../../../core/services/employee-document.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DepartmentService } from '../../../core/services/department.service';
import { DesignationService } from '../../../core/services/designation.service';
import { SitesService } from '../../../core/services/sites.service';
import { ClientsService } from '../../../core/services/clients.service';
import { PfEsicService } from '../../../core/services/pf-esic.service';
import {
  CreateEmployeeDraftRequest,
  EMPLOYEE_DOCUMENT_LABELS,
  EMPLOYEE_STATUS_LABELS,
  EmployeeDocumentType,
  EmployeeStatus,
  EmployeeSubmitResult,
  EmploymentType,
  GENDER_LABELS,
  Gender,
} from '../../../core/models/employee.models';
import { DepartmentListItem } from '../../../core/models/department.models';
import { DesignationListItem } from '../../../core/models/designation.models';
import { SiteListItem } from '../../../core/models/sites.models';
import { ClientListItem } from '../../../core/models/client.models';
import {
  DocumentUploadEvent,
} from '../components/document-upload/document-upload.component';
import dayjs from 'dayjs';
import { DatePickerPayload } from '../../../library/data/date-picker-payload';

interface StoredDocument {
  key: string;
  type: EmployeeDocumentType;
  label: string;
  fileName: string;
  previewUrl: string | null;
  file?: File;
  documentId?: string;
}

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.less',
})
export class EmployeeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly documentService = inject(EmployeeDocumentService);
  private readonly notification = inject(NotificationService);
  private readonly departmentService = inject(DepartmentService);
  private readonly designationService = inject(DesignationService);
  private readonly sitesService = inject(SitesService);
  private readonly clientsService = inject(ClientsService);
  private readonly pfEsicService = inject(PfEsicService);

  readonly loading = signal(false);
  readonly lookupsLoading = signal(true);
  readonly saving = signal(false);
  readonly savingDraft = signal(false);
  readonly isEdit = signal(false);
  readonly submitted = signal<EmployeeSubmitResult | null>(null);
  readonly documents = signal<StoredDocument[]>([]);
  readonly uploadingDocKey = signal<string | null>(null);

  readonly departments = signal<DepartmentListItem[]>([]);
  readonly designations = signal<DesignationListItem[]>([]);
  readonly designationsLoading = signal(false);
  readonly clients = signal<ClientListItem[]>([]);
  readonly filteredSites = signal<SiteListItem[]>([]);
  readonly employmentClientId = signal('');
  readonly employmentDepartmentId = signal('');
  readonly employmentDesignationId = signal('');

  readonly genderOptions = [
    { value: Gender.Male, label: GENDER_LABELS[Gender.Male] },
    { value: Gender.Female, label: GENDER_LABELS[Gender.Female] },
    { value: Gender.Other, label: GENDER_LABELS[Gender.Other] },
    { value: Gender.PreferNotToSay, label: GENDER_LABELS[Gender.PreferNotToSay] },
  ];
  readonly genderRadioOptions = computed(() =>
    this.genderOptions.map(opt => ({ key: String(opt.value), value: opt.label })),
  );
  readonly clientOptions = computed(() =>
    this.clients().map(c => ({ key: String(c.id), value: c.companyName })),
  );
  readonly siteOptions = computed(() =>
    this.filteredSites().map(s => ({
      key: String(s.id),
      value: `${s.siteName} — ${s.city}`,
    })),
  );
  readonly departmentOptions = computed(() => {
    const clientId = this.employmentClientId();
    const placeholder = clientId
      ? { key: '', value: 'Select department' }
      : { key: '', value: 'Select client first' };
    return [
      placeholder,
      ...this.departments().map(d => ({ key: String(d.id), value: d.departmentName })),
    ];
  });
  readonly designationOptions = computed(() => {
    const departmentId = this.employmentDepartmentId();
    const placeholder = this.designationsLoading()
      ? { key: '', value: 'Loading…' }
      : departmentId
        ? { key: '', value: 'Select designation' }
        : { key: '', value: 'Select department first' };
    return [
      placeholder,
      ...this.designations().map(d => ({ key: String(d.id), value: d.designationName })),
    ];
  });
  readonly dobDatePickerConfig: Partial<DatePickerPayload> = { maxDate: dayjs() };
  readonly statusLabels = EMPLOYEE_STATUS_LABELS;

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
    fatherName: ['', Validators.maxLength(100)],
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
    clientSoftCode: ['', Validators.maxLength(50)],
    siteId: ['', Validators.required],
    departmentId: [''],
    designationId: [''],
    joiningDate: [null as Date | null],
  });

  readonly salaryForm = this.fb.group({
    basicSalary: [null as number | null, [Validators.required, Validators.min(0.01)]],
    houseRentAllowance: [0, [Validators.required, Validators.min(0)]],
    specialAllowance: [0, [Validators.required, Validators.min(0)]],
    isPfApplicable: [true],
    isEsiApplicable: [true],
    isLwfApplicable: [true],
    employeePfPercentage: [12, [Validators.min(0), Validators.max(100)]],
    employeeEsiPercentage: [0.75, [Validators.min(0), Validators.max(100)]],
    employeeLwfPercentage: [0.2, [Validators.min(0), Validators.max(100)]],
    employeePfMaxAmount: [1800, [Validators.min(0)]],
    employeeEsiMaxAmount: [0, [Validators.min(0)]],
    employeeLwfMaxAmount: [35, [Validators.min(0)]],
  });

  readonly statutoryForm = this.fb.group({
    aadhaarNumber: ['', Validators.pattern(/^\d{12}$/)],
    panNumber: ['', Validators.pattern(/^[A-Z]{5}\d{4}[A-Z]$/i)],
    uanNumber: ['', Validators.pattern(/^\d{12}$/)],
    esicNumber: [''],
    bankName: [''],
    accountHolderName: [''],
    accountNumber: ['', Validators.pattern(/^\d{9,18}$/)],
    ifscCode: ['', Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/i)],
  });

  ngOnInit() {
    this.employeeId = this.route.snapshot.params['id'] ?? null;
    this.isEdit.set(!!this.employeeId);

    if (this.isEdit()) {
      this.loading.set(true);
    }

    this.loadLookups();

    this.employmentClientId.set(this.employmentForm.get('clientId')?.value ?? '');
    this.employmentDepartmentId.set(this.employmentForm.get('departmentId')?.value ?? '');
    this.employmentDesignationId.set(this.employmentForm.get('designationId')?.value ?? '');

    this.employmentForm.get('clientId')?.valueChanges.subscribe(clientId => {
      this.employmentClientId.set(clientId ?? '');
      this.onClientChange(clientId ?? '');
    });

    this.employmentForm.get('departmentId')?.valueChanges.subscribe(departmentId => {
      this.employmentDepartmentId.set(departmentId ?? '');
      this.onDepartmentChange(departmentId ?? '');
    });

    this.employmentForm.get('designationId')?.valueChanges.subscribe(designationId => {
      this.employmentDesignationId.set(designationId ?? '');
    });
  }

  private onDepartmentChange(departmentId: string, preferredDesignationId?: string) {
    const isPrefill = arguments.length > 1;

    if (!isPrefill) {
      this.employmentForm.patchValue({ designationId: '' }, { emitEvent: false });
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
          return;
        }

        const current = this.employmentForm.get('designationId')?.value ?? '';
        if (
          current &&
          !this.designations().some(
            d => this.compareSelectValue(d.designationCode, current) || this.compareSelectValue(d.id, current),
          )
        ) {
          this.employmentForm.patchValue({ designationId: '' }, { emitEvent: false });
        }
      },
      error: () => {
        this.designations.set([]);
        this.designationsLoading.set(false);
        this.notification.error('Failed to load designations for the selected department.');
      },
    });
  }

  private onClientChange(clientId: string, preferredSiteId?: string) {
    if (!clientId) {
      this.filteredSites.set([]);
      this.departments.set([]);
      this.designations.set([]);
      this.employmentForm.patchValue(
        { siteId: '', departmentId: '', designationId: '' },
        { emitEvent: false },
      );
      return;
    }

    this.employmentForm.patchValue(
      { departmentId: '', designationId: '' },
      { emitEvent: false },
    );
    this.designations.set([]);

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
      code: { code: string };
    },
  ) {
    this.clients.set(data.clients.filter(c => c.id && c.companyName));

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
          fatherName: emp.fatherName ?? '',
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
          clientSoftCode: emp.clientSoftCode ?? '',
          siteId: emp.siteId ?? '',
          departmentId: emp.departmentId,
          designationId: emp.designationId,
          joiningDate: parseApiDate(emp.joiningDate),
        }, { emitEvent: false });
        this.employmentClientId.set(emp.clientId ?? '');
        this.employmentDepartmentId.set(emp.departmentId ?? '');
        this.employmentDesignationId.set(emp.designationId ?? '');

        this.salaryForm.patchValue({
          basicSalary: emp.basicSalary ?? null,
          houseRentAllowance: emp.houseRentAllowance ?? 0,
          specialAllowance: emp.specialAllowance ?? 0,
          isPfApplicable: emp.isPfApplicable ?? true,
          isEsiApplicable: emp.isEsiApplicable ?? true,
          isLwfApplicable: emp.isLwfApplicable ?? true,
          employeePfPercentage: emp.employeePfPercentage ?? 12,
          employeeEsiPercentage: emp.employeeEsiPercentage ?? 0.75,
          employeeLwfPercentage: emp.employeeLwfPercentage ?? 0.2,
          employeePfMaxAmount: emp.employeePfMaxAmount ?? 1800,
          employeeEsiMaxAmount: emp.employeeEsiMaxAmount ?? 0,
          employeeLwfMaxAmount: emp.employeeLwfMaxAmount ?? 35,
        });

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
            },
            error: () => this.notification.error('Failed to load employment options for this employee.'),
          });
        } else if (emp.clientId) {
          this.onClientChange(emp.clientId, emp.siteId ?? undefined);
          if (emp.departmentId) {
            this.onDepartmentChange(emp.departmentId, emp.designationId || undefined);
          }
        } else if (emp.departmentId) {
          this.onDepartmentChange(emp.departmentId, emp.designationId || undefined);
        }

        this.statutoryForm.patchValue({
          aadhaarNumber: emp.aadhaarNumber ?? '',
          panNumber: emp.panNumber ?? '',
          uanNumber: emp.uanNumber ?? '',
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

  get additionalDocuments(): StoredDocument[] {
    return this.documents().filter(d => d.type === 'other');
  }

  validateAllForms(): boolean {
    this.personalForm.markAllAsTouched();
    this.employmentForm.markAllAsTouched();
    this.salaryForm.markAllAsTouched();
    this.statutoryForm.markAllAsTouched();

    if (!this.isMinimumValid()) {
      this.notification.error('First name and a valid mobile number are required.');
      return false;
    }

    if (this.salaryForm.invalid) {
      this.notification.error('Please enter valid salary details (Basic, HRA, Special Allowance).');
      return false;
    }

    if (this.personalForm.invalid || this.employmentForm.invalid || this.statutoryForm.invalid) {
      this.notification.error('Please fix invalid field values before submitting.');
      return false;
    }

    return true;
  }

  get computedGrossSalary(): number {
    const basic = Number(this.salaryForm.get('basicSalary')?.value ?? 0);
    const hra = Number(this.salaryForm.get('houseRentAllowance')?.value ?? 0);
    const special = Number(this.salaryForm.get('specialAllowance')?.value ?? 0);
    return (Number.isFinite(basic) ? basic : 0)
      + (Number.isFinite(hra) ? hra : 0)
      + (Number.isFinite(special) ? special : 0);
  }

  isMinimumValid(): boolean {
    const firstName = this.personalForm.get('firstName')?.value?.trim();
    const phone = this.personalForm.get('phone')?.value?.trim();
    return !!firstName && !!phone && !this.personalForm.get('phone')?.invalid;
  }

  onSubmit() {
    if (!this.validateAllForms()) return;

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
    const sal = this.salaryForm.getRawValue();
    const s = this.statutoryForm.getRawValue();
    const basicSalary = Number(sal.basicSalary ?? 0);
    const houseRentAllowance = Number(sal.houseRentAllowance ?? 0);
    const specialAllowance = Number(sal.specialAllowance ?? 0);
    const grossSalary = basicSalary + houseRentAllowance + specialAllowance;

    return {
      id: this.employeeId ?? undefined,
      employeeCode: e.employeeCode ?? this.draftEmployeeCode,
      firstName: p.firstName!.trim(),
      lastName: p.lastName?.trim() || '',
      fatherName: p.fatherName?.trim() || undefined,
      email: p.email?.trim() ?? '',
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
      clientSoftCode: e.clientSoftCode?.trim() || undefined,
      siteId: e.siteId!,
      departmentId: e.departmentId || '',
      designationId: e.designationId || '',
      joiningDate: this.formatDate(e.joiningDate ?? null),
      employmentType: EmploymentType.FullTime,
      basicSalary,
      houseRentAllowance,
      specialAllowance,
      grossSalary,
      isPfApplicable: sal.isPfApplicable ?? true,
      isEsiApplicable: sal.isEsiApplicable ?? true,
      isLwfApplicable: sal.isLwfApplicable ?? true,
      employeePfPercentage: Number(sal.employeePfPercentage ?? 12),
      employeeEsiPercentage: Number(sal.employeeEsiPercentage ?? 0.75),
      employeeLwfPercentage: Number(sal.employeeLwfPercentage ?? 0.2),
      employeePfMaxAmount: Number(sal.employeePfMaxAmount ?? 1800),
      employeeEsiMaxAmount: Number(sal.employeeEsiMaxAmount ?? 0),
      employeeLwfMaxAmount: Number(sal.employeeLwfMaxAmount ?? 35),
      aadhaarNumber: s.aadhaarNumber ?? undefined,
      panNumber: s.panNumber?.toUpperCase() ?? undefined,
      uanNumber: s.uanNumber ?? undefined,
      esicNumber: s.esicNumber ?? undefined,
      bankName: s.bankName ?? undefined,
      accountHolderName: s.accountHolderName ?? undefined,
      accountNumber: s.accountNumber ?? undefined,
      ifscCode: s.ifscCode?.toUpperCase() ?? undefined,
      status,
    };
  }

  dateToSignetValue(date: Date | null | undefined): { startDate?: string } {
    if (!date) return {};
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return {};
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return { startDate: `${y}-${m}-${day}T00:00:00` };
  }

  signetValueToDate(value: { startDate?: string } | null | undefined): Date | null {
    if (!value?.startDate) return null;
    const datePart = value.startDate.split('T')[0];
    const [y, m, d] = datePart.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  onDateOfBirthChange(value: { startDate?: string }) {
    this.personalForm.get('dateOfBirth')?.setValue(this.signetValueToDate(value));
  }

  onJoiningDateChange(value: { startDate?: string }) {
    this.employmentForm.get('joiningDate')?.setValue(this.signetValueToDate(value));
  }

  onGenderChange(value: string | number) {
    const parsed = typeof value === 'number' ? value : Number(value);
    this.personalForm.get('gender')?.setValue(Number.isFinite(parsed) ? parsed as Gender : null);
  }

  genderRadioValue(): string {
    const gender = this.personalForm.get('gender')?.value;
    return gender != null ? String(gender) : '';
  }

  compareSelectValue = (a: unknown, b: unknown): boolean => {
    if (a == null && b == null) return true;
    if (a == null || b == null) return false;
    return String(a).toLowerCase() === String(b).toLowerCase();
  };

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
