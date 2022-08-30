import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesPotential3Page } from './sales-potential3.page';

const routes: Routes = [
  {
    path: '',
    component: SalesPotential3Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesPotential3PageRoutingModule {}
