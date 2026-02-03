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
  {
    path: 'dashboard/inventory-input-list',
    loadComponent: () =>
      import('./features/inventory-input/pages/inventory-input-list/inventory-input-list').then(m => m.InventoryInputList),
  },
  {
    path: 'dashboard/inventory-output-list',
    loadComponent: () =>
      import('./features/inventory-output/pages/inventory-output-list/inventory-output-list').then(m => m.InventoryOutputList),
  },
];
