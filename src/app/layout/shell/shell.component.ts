import { Component, OnInit, signal, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MEDIA_QUERIES } from '../../core/constants/breakpoints';
import { MatSidenavModule } from '@angular/material/sidenav';
import { map } from 'rxjs/operators';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { FooterComponent } from '../footer/footer.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { LoadingOverlayComponent } from '../../shared/components/loading-overlay/loading-overlay.component';
import { SessionService } from '../../core/services/session.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    MatSidenavModule,
    SidebarComponent,
    TopbarComponent,
    FooterComponent,
    BreadcrumbComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.less',
})
export class ShellComponent implements OnInit {
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly sessionService = inject(SessionService);
  private readonly breadcrumbService = inject(BreadcrumbService);

  readonly sidebarCollapsed = signal(false);
  readonly isMobile$ = this.breakpoint.observe(MEDIA_QUERIES.mobileDown).pipe(map(r => r.matches));
  readonly isTablet$ = this.breakpoint.observe(MEDIA_QUERIES.tablet).pipe(map(r => r.matches));

  ngOnInit() {
    this.breadcrumbService.connect();
    this.sessionService.init();
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }
}
