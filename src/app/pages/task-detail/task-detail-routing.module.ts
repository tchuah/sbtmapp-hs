import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TaskDetail } from './task-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TaskDetail
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskDetailRoutingModule {}
