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
  selector: 'app-stock',
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit, OnDestroy {

  // UI Control
  noData = true;

  // Data
  dataJson = [];
  focusSelected = 0;
  focusSelectedString = '0';
  agingDays = 180;
  pageNumData = 0;
  pageShowNumData = 10;
  searchValue = '';

  // OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    public blobService: AzureBlobStorageService,
    private translate: TranslateService,
    private loadingController: LoadingController,
    private api: ApiService,
    private fb: FormBuilder,
    public util: UtilService,
    public global: GlobalService) {
    this.translationLoaderService.loadTranslations(en, cn, my);
  }

  ngOnInit() {
    this.apiCallNoChassis(false);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  doRefresh(e) {
    this.reset();
    if (this.focusSelected === 0) {
      this.apiCallNoChassis(false);
    }
    else if (this.focusSelected === 1) {
      this.apiCallAging(false);
    }
    else if (this.focusSelected === 2) {
      this.apiCallAllStock(false);
    }
    e.target.complete();
  }

  reset() {
    this.pageNumData = 0;
    this.dataJson = [];
  }

  onEnterChange(e) {
    this.searchValue = e.detail.value;
  }

  // Stock No Chassis
  async apiCallNoChassis(isFirstLoad, e?) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpSp(`Main/ACT_LookupMasterStock?KeyAction=StockNoChassis&offset=${this.pageNumData * this.pageShowNumData}&fetch=${this.pageShowNumData}`, {SearchValue: this.searchValue})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.dataJson.push(...data)
          this.pageNumData++;

          if (this.dataJson.length > 0) {
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

  // Stock Aging
  async apiCallAging(isFirstLoad, e?) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpSp(`Main/ACT_LookupMasterStock?KeyAction=StockAging&offset=${this.pageNumData * this.pageShowNumData}&fetch=${this.pageShowNumData}`, {AgingDay: this.agingDays, SearchValue: this.searchValue})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.dataJson.push(...data)
          this.pageNumData++;

          if (this.dataJson.length > 0) {
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

  async apiCallAllStock(isFirstLoad, e?) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpSp(`Main/ACT_LookupMasterStock?KeyAction=AllStock&offset=${this.pageNumData * this.pageShowNumData}&fetch=${this.pageShowNumData}`, {SearchValue: this.searchValue, BranchId: ''})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.dataJson.push(...data)
          this.pageNumData++;

          if (this.dataJson.length > 0) {
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

        }, async (error) => {
        if (error instanceof TimeoutError) {
          this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
        } else {
          this.api.handleApiError(error);
        }
      });
    loading.dismiss();
    return true;
  }

  search() {
    this.reset();
    if (this.focusSelected === 0) {
      this.apiCallNoChassis(false);
    }
    else if (this.focusSelected === 1) {
      this.apiCallAging(false);
    }
    else if (this.focusSelected === 2) {
      this.apiCallAllStock(false);
    }
  }


  // Lazy Loading
  infiniteLoad(e) {
    if (this.focusSelected === 0) {
      this.apiCallNoChassis(true,e);
    }
    else if (this.focusSelected === 1) {
      this.apiCallAging(true,e);
    }
    else if (this.focusSelected === 2) {
      this.apiCallAllStock(true, e);
    }
  }
}
