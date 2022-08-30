import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesAmend2Page } from './sales-amend2.page';

const routes: Routes = [
  {
    path: '',
    component: SalesAmend2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesAmend2PageRoutingModule {}
