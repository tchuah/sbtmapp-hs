import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RetailAnalyticsPage } from './retail-analytics.page';

const routes: Routes = [
  {
    path: '',
    component: RetailAnalyticsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RetailAnalyticsPageRoutingModule {}
