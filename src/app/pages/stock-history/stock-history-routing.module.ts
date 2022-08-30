import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StockHistoryPage } from './stock-history.page';

const routes: Routes = [
  {
    path: '',
    component: StockHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockHistoryPageRoutingModule {}
