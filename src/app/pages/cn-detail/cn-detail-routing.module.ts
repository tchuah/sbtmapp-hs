import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CnDetail } from './cn-detail.page';

const routes: Routes = [
  {
    path: '',
    component: CnDetail
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CnDetailRoutingModule {}
