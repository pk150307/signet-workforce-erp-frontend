import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteListComponent } from './site-list/site-list.component';
import { SiteFormComponent } from './site-form/site-form.component';
import { SiteDashboardComponent } from './site-dashboard/site-dashboard.component';
import { SiteDetailComponent } from './site-detail/site-detail.component';

const routes: Routes = [
  {
    path: '',
    component: SiteListComponent,
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Site' },
    component: SiteFormComponent,
  },
  {
    path: 'dashboard',
    data: { breadcrumb: 'Dashboard' },
    component: SiteDashboardComponent,
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Site' },
    component: SiteFormComponent,
  },
  {
    path: ':id',
    data: { breadcrumb: 'Site Details' },
    component: SiteDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SitesModuleRoutingModule {}
