import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { Subject, TimeoutError } from 'rxjs';

import { locale as en } from './i18n/en';
import { locale as cn } from './i18n/cn'
import { locale as my } from './i18n/my'

import { ApiService } from 'src/@sbt/services/api.service';
import { UtilService } from 'src/@sbt/utils/util.service';
import { GlobalService } from 'src/app/app-config/global.service';
import { TranslationLoaderService } from 'src/@sbt/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingController, NavController} from '@ionic/angular';
import { AzureBlobStorageService } from 'src/@sbt/services/azure-blob-storage.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sales-master',
  templateUrl: './sales-master.page.html',
  styleUrls: ['./sales-master.page.scss'],
})
export class SalesMasterPage implements OnInit, OnDestroy {

  // UI Control
  containerName = 'hs-attachment'
  sas = this.global.sas;
  pageNumData = 0;
  pageShowNumData = 20;

  // Data
  searchValue = '';
  searchRawValue = '';
  currentStatus: number = 0;
  currentRawStatus: number = 0;
  currentVerifyStatus: number = 0;
  currentRawVerifyStatus: number = 0;
  noData = true;
  dataJson = []; 

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
    // this.apiCall(false, '');
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async apiCall(isFirstLoad, e) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.api.httpSp(`Main/ACT_LookupAppSalesMaster?KeyAction=ADMIN&offset=${this.pageNumData * this.pageShowNumData}&fetch=${this.pageShowNumData}`,  {SearchValue: this.searchValue, FilterVerifyStatus: this.currentVerifyStatus})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.pageNumData++;
          this.dataJson.push(...data)

          if (isFirstLoad) {
            e.target.complete();
          }

          if (this.dataJson.length < 1) {
            this.noData = false;
          } 
          else {
            this.noData = true;
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
  }

  async apiCallSearch(isFirstLoad, e?) {
    this.pageNumData = 0;
    this.pageShowNumData = 20;
    this.dataJson = [];
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.api.httpSp(`Main/ACT_LookupAppSalesMaster?KeyAction=ADMIN&offset=${this.pageNumData * this.pageShowNumData}&fetch=${this.pageShowNumData}`,  {SearchValue: this.searchValue, FilterVerifyStatus: this.currentVerifyStatus})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.pageNumData++;
          this.dataJson.push(...data)

          if (isFirstLoad) {
            e.target.complete();
          }

          if (this.dataJson.length < 1) {
            this.noData = false;
          } 
          else {
            this.noData = true;
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
  }

  selectStatus(e) {
    this.currentRawStatus = e.detail.value;
    if (this.currentRawStatus === 1) {
      this.currentRawVerifyStatus = 1;
    }
  }

  selectVerifyStatus(e) {
    this.currentRawVerifyStatus = e.detail.value;
  }

  onEnterChange(e) {
    this.searchRawValue = e.detail.value;
  }

  search() {
    this.searchValue = this.searchRawValue;
    this.currentVerifyStatus = this.currentRawVerifyStatus;
    this.apiCallSearch(false, '')
  }

  async doRefresh(e) {
    this.pageNumData = 0;
    this.pageShowNumData = 20;
    this.dataJson = [];
    this.apiCall(false, '')
    e.target.complete();
  }

  // Lazy Loading
  infiniteLoad(e){
    this.apiCall(true, e);
  }

  ionViewWillEnter(e) {
    this.pageNumData = 0;
    this.pageShowNumData = 20;
    this.dataJson = [];
    this.apiCall(false, '');
  }
}
