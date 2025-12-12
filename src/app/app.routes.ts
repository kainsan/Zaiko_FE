import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard-home').then(m => m.DashboardHome),
  },
  {
    path: 'dashboard/master-product',
    loadComponent: () =>
      import('./features/master-product/pages/master-product').then(m => m.MasterProduct),
  },
];
