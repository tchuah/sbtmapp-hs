import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path        : 'sales',
        loadChildren: () => import('src/app/pages/sales/sales.module').then(m => m.SalesPageModule),
      },
      {
        path        : 'home',
        component: HomePage,
      },
      {
        path: '',
        component: HomePage,
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
