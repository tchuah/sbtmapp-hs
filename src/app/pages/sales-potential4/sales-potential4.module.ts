import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CountdownModule } from 'ngx-countdown';

import { SalesPotential4PageRoutingModule } from './sales-potential4-routing.module';
import { SalesPotential4Page } from './sales-potential4.page';
import { TranslateModule } from '@ngx-translate/core';
import { WebcamModule } from 'ngx-webcam';
import { IonicSelectableModule } from 'ionic-selectable';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
import { CurrencyMaskModule } from 'ng2-currency-mask';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CountdownModule,
    WebcamModule,
    IonicModule,
    SalesPotential4PageRoutingModule,
    NgxIonicImageViewerModule,
    CurrencyMaskModule,
    IonicSelectableModule, //https://github.com/ionic-selectable/ionic-selectable
  ],
  declarations: [SalesPotential4Page],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SalesPotential4PageModule {}
