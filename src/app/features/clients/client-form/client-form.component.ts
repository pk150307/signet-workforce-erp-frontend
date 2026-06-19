import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.less',
})
export class ClientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);

  readonly saving = signal(false);
  readonly isEdit = signal(false);
  private clientId: string | null = null;

  readonly form = this.fb.group({
    companyName:   ['', Validators.required],
    contactPerson: ['', Validators.required],
    email:         ['', [Validators.required, Validators.email]],
    phone:         ['', Validators.required],
    gstNumber:     [''],
    address:       ['', Validators.required],
    city:          ['', Validators.required],
    state:         ['', Validators.required],
    pinCode:       [''],
  });

  ngOnInit() {
    this.clientId = this.route.snapshot.params['id'];
    if (this.clientId) this.isEdit.set(true);
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const url = this.isEdit()
      ? `${environment.apiUrl}/clients/${this.clientId}`
      : `${environment.apiUrl}/clients`;
    const req$ = this.isEdit()
      ? this.http.put(url, this.form.value)
      : this.http.post<{ id: string }>(url, this.form.value);
    req$.subscribe({
      next: () => { this.notification.success('Client saved.'); this.router.navigate(['/clients']); },
      error: () => { this.notification.error('Failed to save client.'); this.saving.set(false); }
    });
  }
}
