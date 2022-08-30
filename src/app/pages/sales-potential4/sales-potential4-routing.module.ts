import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesPotential4Page } from './sales-potential4.page';

const routes: Routes = [
  {
    path: '',
    component: SalesPotential4Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesPotential4PageRoutingModule {}
