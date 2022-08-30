import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BranchSalesPage } from './branch-sales.page';

const routes: Routes = [
  {
    path: '',
    component: BranchSalesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BranchSalesPageRoutingModule {}
