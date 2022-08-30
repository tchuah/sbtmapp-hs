import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CountdownModule } from 'ngx-countdown';

import { newSalesPageRoutingModule } from './new-sales-routing.module';
import { newSalesPage } from './new-sales.page';
import { TranslateModule } from '@ngx-translate/core';
import { WebcamModule } from 'ngx-webcam';
import { IonicSelectableModule } from 'ionic-selectable';
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
    newSalesPageRoutingModule,
    CurrencyMaskModule,
    IonicSelectableModule, //https://github.com/ionic-selectable/ionic-selectable
  ],
  declarations: [newSalesPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class newSalesPageModule {}
