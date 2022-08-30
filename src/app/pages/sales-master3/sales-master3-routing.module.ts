import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesMaster3Page } from './sales-master3.page';

const routes: Routes = [
  {
    path: '',
    component: SalesMaster3Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesMaster3PageRoutingModule {}
