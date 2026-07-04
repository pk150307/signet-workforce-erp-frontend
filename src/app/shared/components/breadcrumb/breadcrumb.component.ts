import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
    templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.less',
})
export class BreadcrumbComponent {
  readonly breadcrumbService = inject(BreadcrumbService);
}
