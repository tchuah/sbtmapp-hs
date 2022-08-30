import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesPotential2Page } from './sales-potential2.page';

const routes: Routes = [
  {
    path: '',
    component: SalesPotential2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesPotential2PageRoutingModule {}
