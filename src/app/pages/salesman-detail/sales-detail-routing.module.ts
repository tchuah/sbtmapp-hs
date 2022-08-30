import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesDetailPage } from './sales-detail.page';

const routes: Routes = [
  {
    path: '',
    component: SalesDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesDetailPageRoutingModule {}
