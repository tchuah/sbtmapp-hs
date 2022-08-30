import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesMasterPage } from './sales-master.page';

const routes: Routes = [
  {
    path: '',
    component: SalesMasterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesMasterPageRoutingModule {}
