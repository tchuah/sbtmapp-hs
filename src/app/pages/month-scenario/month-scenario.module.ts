import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CountdownModule } from 'ngx-countdown';

import { MonthScenarioPageRoutingModule } from './month-scenario-routing.module';
import { MonthScenarioPage } from './month-scenario.page';
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
    MonthScenarioPageRoutingModule,
    NgxIonicImageViewerModule,
    CurrencyMaskModule,
    IonicSelectableModule, //https://github.com/ionic-selectable/ionic-selectable
  ],
  declarations: [MonthScenarioPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MonthScenarioPageModule {}
