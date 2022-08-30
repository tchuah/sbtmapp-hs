import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CountdownModule } from 'ngx-countdown';

import { newCustomersPageRoutingModule } from './new-customers-routing.module';
import { newCustomersPage } from './new-customers.page';
import { TranslateModule } from '@ngx-translate/core';
import { WebcamModule } from 'ngx-webcam';
import { SimpleMaskModule } from 'ngx-ion-simple-mask';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CountdownModule,
    WebcamModule,
    IonicModule,
    SimpleMaskModule,
    newCustomersPageRoutingModule
  ],
  declarations: [newCustomersPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class newCustomersPageModule {}
