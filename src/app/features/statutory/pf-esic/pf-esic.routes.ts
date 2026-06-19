import { Routes } from '@angular/router';

export const PF_ESIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pf-esic-list/pf-esic-list.component').then(m => m.PfEsicListComponent),
  },
];
