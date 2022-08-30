import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

import { locale as en } from './i18n/en';
import { locale as cn } from './i18n/cn'
import { locale as my } from './i18n/my'

import { ApiService } from 'src/@sbt/services/api.service';
import { UtilService } from 'src/@sbt/utils/util.service';
import { GlobalService } from 'src/app/app-config/global.service';
import { TranslationLoaderService } from 'src/@sbt/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { NavController, Platform } from '@ionic/angular';

import { Md5 } from 'ts-md5/dist/md5';
import { ActivatedRoute } from '@angular/router';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { AzureBlobStorageService } from 'src/@sbt/services/azure-blob-storage.service';
import { base64StringToBlob } from 'blob-util';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.page.html',
  styleUrls: ['./customer-detail.page.scss'],
})
export class CustomerDetail implements OnInit, OnDestroy {

  // UI Control

  // Data
  paramId;
  dataJson;

  // OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    private translate: TranslateService,
    private api: ApiService,
    public util: UtilService,
    public global: GlobalService) {
    this.translationLoaderService.loadTranslations(en, cn, my);

    route.params.subscribe(param => {
      if (param) {
        this.paramId = param['id'];        

        this.sbtForm = new FormGroup({
          CompanyNumber: new FormControl(null, Validators.compose([Validators.required])),
          CompanyName: new FormControl(null, Validators.compose([Validators.required])),
          ContactPerson: new FormControl(null, Validators.compose([Validators.required])),
          ContactNumber: new FormControl(null, Validators.compose([Validators.required])),
          Email1: new FormControl(null, Validators.compose([Validators.email, Validators.required])),
          Address: new FormControl(null, Validators.compose([Validators.required])),
          Postcode: new FormControl(null, Validators.compose([Validators.required])),
          State: new FormControl(null, Validators.compose([Validators.required])),
        });

        this.sbtForm.get('CompanyNumber').setValue(this.dataJson.Customer)
        this.sbtForm.get('CompanyName').setValue(this.dataJson.CustomerName)
        this.sbtForm.get('ContactPerson').setValue(this.dataJson.ContactPerson)
        this.sbtForm.get('ContactNumber').setValue(this.dataJson.ContactNumber)
        this.sbtForm.get('Email1').setValue(this.dataJson.Email1)
        this.sbtForm.get('Address').setValue(this.dataJson.Address)
        this.sbtForm.get('Postcode').setValue(this.dataJson.Postcode)
        this.sbtForm.get('State').setValue(this.dataJson.State)
      }
    });
  }

  ngOnInit() { 
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
