import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { newSalesPage } from './new-sales.page';

const routes: Routes = [
  {
    path: '',
    component: newSalesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class newSalesPageRoutingModule {}
