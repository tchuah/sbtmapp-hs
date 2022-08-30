import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomerDetail } from './customer-detail.page';

const routes: Routes = [
  {
    path: '',
    component: CustomerDetail
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerDetailRoutingModule {}
