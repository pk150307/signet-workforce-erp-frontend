import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SitesModuleRoutingModule } from './sites-routing.module';
import { SiteDashboardComponent } from './site-dashboard/site-dashboard.component';
import { SiteDetailComponent } from './site-detail/site-detail.component';
import { SiteFormComponent } from './site-form/site-form.component';
import { SiteListComponent } from './site-list/site-list.component';

@NgModule({
  declarations: [
    SiteDashboardComponent,
    SiteDetailComponent,
    SiteFormComponent,
    SiteListComponent,
  ],
  imports: [
    SharedModule,
    SitesModuleRoutingModule,
  ],
})
export class SitesModule {}
