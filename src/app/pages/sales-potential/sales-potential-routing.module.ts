import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesPotentialPage } from './sales-potential.page';

const routes: Routes = [
  {
    path: '',
    component: SalesPotentialPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesPotentialPageRoutingModule {}
