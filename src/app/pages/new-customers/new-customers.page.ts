import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, TimeoutError } from 'rxjs';

import { locale as en } from './i18n/en';
import { locale as cn } from './i18n/cn'
import { locale as my } from './i18n/my'

import { ApiService } from 'src/@sbt/services/api.service';
import { UtilService } from 'src/@sbt/utils/util.service';
import { GlobalService } from 'src/app/app-config/global.service';
import { TranslationLoaderService } from 'src/@sbt/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { LoadingController, NavController, Platform } from '@ionic/angular';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-new-customers',
  templateUrl: './new-customers.page.html',
  styleUrls: ['./new-customers.page.scss'],
})
export class newCustomersPage implements OnInit, OnDestroy {

  // UI Control
  showText = false;
  showIcon = false;

  //
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    private loadingController: LoadingController,
    private api: ApiService,
    public util: UtilService,
    public global: GlobalService) {
    this.translationLoaderService.loadTranslations(en, cn, my);

    this.sbtForm = new FormGroup({
      CompanyNumber: new FormControl(null, Validators.compose([Validators.required])),
      CompanyName: new FormControl(null, Validators.compose([Validators.required])),
      ContactPerson: new FormControl(null, Validators.compose([Validators.required])),
      ContactNumber: new FormControl(null, Validators.compose([Validators.required])),
      Email1: new FormControl(null, Validators.compose([Validators.email])),
      Address: new FormControl(null, Validators.compose([Validators.required])),
      Postcode: new FormControl(null, Validators.compose([Validators.required])),
      State: new FormControl(null, Validators.compose([Validators.required])),
    });
  }

  ngOnInit() { 

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  toUpper(item, e) {
    this.sbtForm.get(item).setValue(e.detail.value.toUpperCase())
  }

  async checkExists(e){
    this.api.httpAction(`NewCustomer/ACT_AppCustomerCreate?Id=${this.sbtForm.get('CompanyNumber').value}&KeyAction=CHECK-EXIST`, {})
    .pipe(takeUntil(this.destroy$))
    .subscribe((data) => {
      if(data[0].ReturnCode === 'AlreadyRegister'){
        this.showText = true;
        return;
      }
      else if(data[0].ReturnCode === 'OK'){
        this.showText = false;
        return;
      }
    }), async error => {
      if (error instanceof TimeoutError) {
        this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
      }
      else {
        this.api.handleApiError(error);
      }
    };
  }

  async register() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });

    if (isNaN(this.sbtForm.get('CompanyNumber').value)){
      this.util.genericMessageBoxXTranslate('Alert!', 'The new company number should only consist of numbers!')
      return;
    }

    if (isNaN(parseInt(this.sbtForm.get('Postcode').value))) {
      this.util.msgboxConfirmXTranslate('Client Alert!', 'The postcode is enter incorrectly!');
      return;
    }
    
    this.api.httpAction(`NewCustomer/ACT_AppCustomerCreate?KeyAction=CREATE`, this.sbtForm.value)
    .pipe(takeUntil(this.destroy$))
    .subscribe((data) => {
      if(data[0].ReturnCode === 'OK') {
        this.util.genericMessageBoxXTranslate('Success!', 'New customer has been added. Please contact the system admin to approved.')
        this.sbtForm.reset();
        this.showText = false;
        return;
      }
      else if(data[0].ReturnCode === 'AlreadyRegister'){
        this.util.genericMessageBoxXTranslate('Alert !',' This company already register!');
        return;
      }
    }), async error => {
      if (error instanceof TimeoutError) {
        this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
      }
      else {
        this.api.handleApiError(error);
      }
    };
    loading.dismiss();
  }
}
