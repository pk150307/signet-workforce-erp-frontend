import { Component, OnInit, signal, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { map } from 'rxjs/operators';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { FooterComponent } from '../footer/footer.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { LoadingOverlayComponent } from '../../shared/components/loading-overlay/loading-overlay.component';
import { SessionService } from '../../core/services/session.service';

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

  readonly sidebarCollapsed = signal(false);
  readonly isMobile$ = this.breakpoint.observe(Breakpoints.Handset).pipe(map(r => r.matches));

  ngOnInit() {
    this.sessionService.init();
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }
}
