import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyProfileComponent } from './company-profile/company-profile.component';
import { BranchesListComponent } from './branches-list/branches-list.component';
import { OfficesListComponent } from './offices-list/offices-list.component';

const routes: Routes = [
  {
    path: '',
    data: { breadcrumb: 'Profile' },
    component: CompanyProfileComponent,
  },
  {
    path: 'branches',
    data: { breadcrumb: 'Branches' },
    component: BranchesListComponent,
  },
  {
    path: 'offices',
    data: { breadcrumb: 'Offices' },
    component: OfficesListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyModuleRoutingModule {}
