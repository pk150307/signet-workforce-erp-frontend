import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientListComponent } from './client-list/client-list.component';
import { ClientFormComponent } from './client-form/client-form.component';
import { ClientDetailComponent } from './client-detail/client-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ClientListComponent,
  },
  {
    path: 'new',
    data: { breadcrumb: 'Add Client' },
    component: ClientFormComponent,
  },
  {
    path: ':id/edit',
    data: { breadcrumb: 'Edit Client' },
    component: ClientFormComponent,
  },
  {
    path: ':id',
    data: { breadcrumb: 'Client Details' },
    component: ClientDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientsModuleRoutingModule {}
