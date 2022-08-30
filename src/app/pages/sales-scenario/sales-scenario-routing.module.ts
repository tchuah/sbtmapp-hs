import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SalesScenarioPage } from './sales-scenario.page';

const routes: Routes = [
  {
    path: '',
    component: SalesScenarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesScenarioPageRoutingModule {}
