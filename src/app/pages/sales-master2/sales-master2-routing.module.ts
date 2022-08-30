import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesMaster2Page } from './sales-master2.page';

const routes: Routes = [
  {
    path: '',
    component: SalesMaster2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesMaster2PageRoutingModule {}
