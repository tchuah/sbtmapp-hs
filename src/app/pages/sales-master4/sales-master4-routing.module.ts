import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesMaster4Page } from './sales-master4.page';

const routes: Routes = [
  {
    path: '',
    component: SalesMaster4Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesMaster4PageRoutingModule {}
