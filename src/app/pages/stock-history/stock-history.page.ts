import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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

import { Md5 } from 'ts-md5/dist/md5';
import { ActivatedRoute } from '@angular/router';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { AzureBlobStorageService } from 'src/@sbt/services/azure-blob-storage.service';
import { base64StringToBlob } from 'blob-util';
import { takeUntil } from 'rxjs/operators';
import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';

@Component({
  selector: 'app-stock-history',
  templateUrl: './stock-history.page.html',
  styleUrls: ['./stock-history.page.scss'],
})
export class StockHistoryPage implements OnInit, OnDestroy {

  // UI Control
  showSummary: boolean = true;
  noData: boolean = true;

  // Data
  paramId;
  stockHistoryJson;
  stockJson;
  
  // OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    private route: ActivatedRoute,
    public blobService: AzureBlobStorageService,
    private translate: TranslateService,
    private loadingController: LoadingController,
    private api: ApiService,
    private fb: FormBuilder,
    public util: UtilService,
    public global: GlobalService) {
    this.translationLoaderService.loadTranslations(en, cn, my);
  }

  ngOnInit () {
    this.route.params.subscribe(param => {
      if (param) {
        this.paramId = param['id'];
        this.apiCall();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  doRefresh(e) {
    this.apiCall();
    e.target.complete();
  }

  apiCall() {
    this.api.httpAction(`Main/ACT_LookupGeneral?KeyAction=StockHistory&Id=${this.paramId}`, {})
    .pipe(takeUntil(this.destroy$))
    .subscribe(async data => {
      this.stockHistoryJson = data[0].StockHistoryJson;
      this.stockJson = data[0].StockInfo;

      if(this.stockHistoryJson.length > 0) {
        this.noData = false;
      }
      else {
        this.noData = true;
      }
    });
  }
}
