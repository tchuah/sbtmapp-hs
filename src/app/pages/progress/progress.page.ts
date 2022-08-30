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
import { LoadingController, NavController, Platform } from '@ionic/angular';

import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.page.html',
  styleUrls: ['./progress.page.scss'],
})
export class ProgressPage implements OnInit, OnDestroy {

  // UI Control
  page = 'progress'
  showInfo: boolean = true; 
  noData = false;

  // Data
  paramId;
  progressJson;
  saleTask;
  saleTaskJson;

  // OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private loadingController: LoadingController,
    private route: ActivatedRoute,
    private navController: NavController,
    private api: ApiService,
    public util: UtilService,
    public global: GlobalService) {
    this.translationLoaderService.loadTranslations(en, cn, my);

    this.sbtForm = new FormGroup({
      'IsLoan': new FormControl(null, Validators.compose([Validators.required])),
    });

    route.params.subscribe(param => {
      if (param) {
        this.paramId = param['id'];
      }
    });
  }

  async ngOnInit() { 
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpAction(`Main/ACT_LookupProgress?Id=${this.paramId}`, {})
    .pipe(takeUntil(this.destroy$))
    .subscribe(async data => {
      this.progressJson = data;
      
      if (this.progressJson.length < 1) {
        this.noData = true;
      } 
      else {
        this.noData = false;
      }

      loading.dismiss();
    }, async (error) => {
      if (error instanceof TimeoutError) {
        this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
      } else {
        this.api.handleApiError(error);
      }
      loading.dismiss();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  selectProgress(id) {
    this.saleTaskJson = this.saleTask.filter(f => f.SalesStage === id);
    this.page = 'list';
  }

  getUserInfo(Id, Type) {
    
    if(!Id || !Type) {
      return '-';
    }

    if (Type === 'SALES') {
      if (this.global.userListJson.filter(f => f.Id === Id).length > 0) {
        return this.global.userListJson.filter(f => f.Id === Id)[0].Info
      }
      return '-'
    }
    else if(Type === 'GROUP'){
      if (this.global.groupListJson.filter(f => f.Id === Id).length > 0) {
        return this.global.groupListJson.filter(f => f.Id === Id)[0].Info
      }
      return '-'
    }
    
  }
}
