import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MonthScenarioPage } from './month-scenario.page';

const routes: Routes = [
  {
    path: '',
    component: MonthScenarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MonthScenarioPageRoutingModule {}
