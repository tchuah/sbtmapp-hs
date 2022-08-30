import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CountdownModule } from 'ngx-countdown';

import {SalesDetailPageRoutingModule } from './sales-detail-routing.module';
import {SalesDetailPage } from './sales-detail.page';
import { TranslateModule } from '@ngx-translate/core';
import { WebcamModule } from 'ngx-webcam';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CountdownModule,
    WebcamModule,
    IonicModule,
    CurrencyMaskModule,
    NgxIonicImageViewerModule,
   SalesDetailPageRoutingModule
  ],
  declarations: [SalesDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SalesDetailPageModule {}
