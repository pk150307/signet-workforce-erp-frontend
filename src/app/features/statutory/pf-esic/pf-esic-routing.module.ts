import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PfEsicListComponent } from './pf-esic-list/pf-esic-list.component';

const routes: Routes = [
  {
    path: '',
    component: PfEsicListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PfEsicModuleRoutingModule {}
