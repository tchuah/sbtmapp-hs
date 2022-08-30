import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/@sbt/services/auth-guard.service';
import { HomePage } from './pages/home/home.page';

const routes: Routes = [
  {
    path        : 'home',
    loadChildren: () => import('src/app/pages/home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'new-customers',
    loadChildren: () => import('src/app/pages/new-customers/new-customers.module').then(m => m.newCustomersPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'new-sales',
    loadChildren: () => import('src/app/pages/new-sales/new-sales.module').then(m => m.newSalesPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'sales-potential/:id',
    loadChildren: () => import('src/app/pages/sales-potential/sales-potential.module').then(m => m.SalesPotentialPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'sales-potential2/:id',
    loadChildren: () => import('src/app/pages/sales-potential2/sales-potential2.module').then(m => m.SalesPotential2PageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'sales-potential3/:id',
    loadChildren: () => import('src/app/pages/sales-potential3/sales-potential3.module').then(m => m.SalesPotential3PageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'sales-potential4/:id',
    loadChildren: () => import('src/app/pages/sales-potential4/sales-potential4.module').then(m => m.SalesPotential4PageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'sales-master',
    loadChildren: () => import('src/app/pages/sales-master/sales-master.module').then(m => m.SalesMasterPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'sales-master2',
    loadChildren: () => import('src/app/pages/sales-master2/sales-master2.module').then(m => m.SalesMaster2PageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'sales-master3',
    loadChildren: () => import('src/app/pages/sales-master3/sales-master3.module').then(m => m.SalesMaster3PageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'sales-master4',
    loadChildren: () => import('src/app/pages/sales-master4/sales-master4.module').then(m => m.SalesMaster4PageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'sales-unapproved',
    loadChildren: () => import('src/app/pages/sales-unapproved/sales-unapproved.module').then(m => m.SalesUnapprovedPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'qrcode-modal',
    loadChildren: () => import('src/app/pages/qrcode-modal/qrcode-modal.module').then(m => m.QrcodeModalPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'stock',
    loadChildren: () => import('src/app/pages/stock/stock.module').then(m => m.StockPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'stock-history/:id',
    loadChildren: () => import('src/app/pages/stock-history/stock-history.module').then(m => m.StockHistoryPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'cn-detail/:id/:status',
    loadChildren: () => import('src/app/pages/cn-detail/cn-detail.module').then(m => m.CnDetailPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'progress/:id',
    loadChildren: () => import('src/app/pages/progress/progress.module').then(m => m.ProgressPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'progress-detail/:id',
    loadChildren: () => import('src/app/pages/progress-detail/progress-detail.module').then(m => m.ProgressDetailPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'customer-detail/:id',
    loadChildren: () => import('src/app/pages/customer-detail/customer-detail.module').then(m => m.CustomerDetailPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'task-detail/:id',
    loadChildren: () => import('src/app/pages/task-detail/task-detail.module').then(m => m.TaskDetailPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'sales-detail/:id',
    loadChildren: () => import('src/app/pages/salesman-detail/sales-detail.module').then(m => m.SalesDetailPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'sales-scenario',
    loadChildren: () => import('src/app/pages/sales-scenario/sales-scenario.module').then(m => m.SalesScenarioPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'month-scenario',
    loadChildren: () => import('src/app/pages/month-scenario/month-scenario.module').then(m => m.MonthScenarioPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'branch-sales/:branch/:status',
    loadChildren: () => import('src/app/pages/branch-sales/branch-sales.module').then(m => m.BranchSalesPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'branch-month/:branch',
    loadChildren: () => import('src/app/pages/branch-month/branch-month.module').then(m => m.BranchMonthPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'retail-analytics',
    loadChildren: () => import('src/app/pages/retail-analytics/retail-analytics.module').then(m => m.RetailAnalyticsPageModule),
    canActivate: [AuthGuardService]
  },
  {
    path        : 'login',
    loadChildren: () => import('src/app/pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path        : '',
    loadChildren: () => import('src/app/pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then( m => m.MainPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
