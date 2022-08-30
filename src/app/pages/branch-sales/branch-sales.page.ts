import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-branch-sales',
  templateUrl: './branch-sales.page.html',
  styleUrls: ['./branch-sales.page.scss'],
})
export class BranchSalesPage implements OnInit, OnDestroy {

  // UI Control
  pageNumData = 0;
  pageShowNumData = 20;
  from = '';

  // Data
  param;
  branch;
  searchValue = '';
  searchRawValue = '';
  currentStatus: number = 0;
  currentRawStatus: number = 0;
  currentVerifyStatus: number = 0;
  currentRawVerifyStatus: number = 0;
  noData = true;
  dataJson = []; 
  chartLabel = []; 
  chartJson = []; 
  selectedStatus = '';
  branchStats;

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

  ngOnInit() {
    this.route.params.subscribe(param => {
      if (param) {
        this.branch = param['branch'];
        this.currentRawStatus = parseInt(param['status']);       
        this.currentStatus = this.currentRawStatus; 
      }
    });  
    this.apiCall();
  }

  ngAfterViewInit() {
    
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


  async apiCall() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.api.httpSp(`Main/ACT_LookupAppSalesBoss?KeyAction=SalesByStatus`,  {BranchId: this.branch, Status: this.currentStatus})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.dataJson = data[0].Sales;
          this.branchStats = data[0].BranchStats[0];
          if (this.dataJson.length < 1) {
            this.noData = false;
          } 
          else {
            this.noData = true;
          }
        }, async (error) => {
        if (error instanceof TimeoutError) {
          this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
        } else {
          this.api.handleApiError(error);
        }
      });

    loading.dismiss();
  }

  selectStatus(e) {
    this.currentRawStatus = e.detail.value;
  }

  search(){
    this.currentStatus = this.currentRawStatus;
    this.apiCall();
  }

  // ion refresh
  doRefresh(e) {
    setTimeout(() => {
      this.apiCall();
    });
    e.target.complete();
  }
}
