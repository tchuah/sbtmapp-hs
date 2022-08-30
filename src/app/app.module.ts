import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';


import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { Camera } from '@ionic-native/Camera/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';

import { AuthGuardService } from 'src/@sbt/services/auth-guard.service';
import { JwtInterceptor } from 'src/@sbt/services/jwt.interceptor';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'md'
    }),
    TranslateModule.forRoot(),
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AuthGuardService,
    NativeStorage,
    LaunchNavigator,
    InAppBrowser,
    CallNumber,
    Camera,
    BarcodeScanner,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
