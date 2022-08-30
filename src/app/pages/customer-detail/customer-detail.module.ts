import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CountdownModule } from 'ngx-countdown';

import { CustomerDetailRoutingModule } from './customer-detail-routing.module';
import { CustomerDetail } from './customer-detail.page';
import { TranslateModule } from '@ngx-translate/core';
import { WebcamModule } from 'ngx-webcam';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CountdownModule,
    WebcamModule,
    IonicModule,
    CustomerDetailRoutingModule
  ],
  declarations: [CustomerDetail],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CustomerDetailPageModule {}
