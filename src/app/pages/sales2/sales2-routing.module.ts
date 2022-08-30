import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Sales2 } from './sales2.page';

const routes: Routes = [
  {
    path: '',
    component: Sales2
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Sales2RoutingModule {}
