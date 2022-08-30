import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-cn-detail',
  templateUrl: './cn-detail.page.html',
  styleUrls: ['./cn-detail.page.scss'],
})
export class CnDetail implements OnInit, OnDestroy {

  // UI Control
  noData = true;

  // Data
  paramId;
  paramStatus;
  make;
  model;
  dataJson = [];
  focusSelected = 0;
  agingDays = 180;
  pageNumData = 0;
  pageShowNumData = 15;
  searchValue = '';

  // OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    public blobService: AzureBlobStorageService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private loadingController: LoadingController,
    private api: ApiService,
    private fb: FormBuilder,
    public util: UtilService,
    public global: GlobalService) {
    this.translationLoaderService.loadTranslations(en, cn, my);
  }

  ngOnInit() {
    this.route.params.subscribe(param => {
      if (param) {
        this.paramId = param['id'];
        this.make = this.paramId.split('~')[0];
        this.model = this.paramId.split('~')[1];
        this.paramStatus = param['status'];
        console.log(this.paramStatus)
      }
      this.apiCall(false);
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  doRefresh(e) {
    this.apiCall(false);
    e.target.complete();
  }

  reset() {
    this.pageNumData = 0;
    this.dataJson = [];
  }

  async apiCall(isFirstLoad, e?) {
    this.reset();
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    let keyAction = 'ChassisNumber';

    this.api.httpSp(`Main/ACT_LookupMasterStock?KeyAction=${keyAction}&offset=${this.pageNumData * this.pageShowNumData}&fetch=${this.pageShowNumData}`, {Make: this.make, Model: this.model, FocusStatus: this.paramStatus, SearchValue: this.searchValue})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.dataJson.push(...data)
          this.pageNumData++;

          if (data.length > 0) {
            this.noData = false;
          }
          else {
            this.noData = true
          }

          if (isFirstLoad) {
            setTimeout(() => {
              e.target.complete();
            });
          }

        }
      ), async (error) => {
        if (error instanceof TimeoutError) {
          this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
        } else {
          this.api.handleApiError(error);
        }
      };
    loading.dismiss();
    return true;
  }

  onEnterChange(e) {
    this.searchValue = e.detail.value;
  }

  search() {
    this.apiCall(false);
  }

  // Lazy Loading
  infiniteLoad(e) {
    this.apiCall(true, e);
  }
}
