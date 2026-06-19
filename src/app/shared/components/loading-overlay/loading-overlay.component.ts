import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-overlay" role="status" aria-label="Loading">
        <mat-spinner diameter="48" />
      </div>
    }
  `,
  styleUrl: './loading-overlay.component.less',
})
export class LoadingOverlayComponent {
  readonly loadingService = inject(LoadingService);
}
