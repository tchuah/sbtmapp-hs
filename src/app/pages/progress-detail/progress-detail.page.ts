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
import { NavController, Platform } from '@ionic/angular';

import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-progress-detail',
  templateUrl: './progress-detail.page.html',
  styleUrls: ['./progress-detail.page.scss'],
})
export class ProgressDetailPage implements OnInit, OnDestroy {

  // UI Control
  page = 'progress'

  // Data
  paramId;
  progressJson;
  saleTask;
  saleTaskJson;
  groupJson
  noData = true;

  // OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  constructor(
    private translationLoaderService: TranslationLoaderService,
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

  ngOnInit() { 
    this.api.httpAction(`NewSales/ACT_TestFunction?Id=${this.paramId}&KeyAction=TEST1`, {})
    .pipe(takeUntil(this.destroy$))
    .subscribe((data) => {
      this.saleTaskJson = data;

      console.log(this.saleTaskJson)
      if (this.saleTaskJson.length < 1) {
        this.noData = false;
      } 
      else {
        this.noData = true;
      }

    }), error => {
      this.api.handleApiError(error);
    };
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getUserInfo(Id, Type) {
    
    if(!Id || !Type) {
      return '-';
    }

    if (Type === 'SALES') {
      return this.global.userListJson.filter(f => f.Id === Id)[0].Info
    }
    else if(Type === 'GROUP'){
      return this.global.groupListJson.filter(f => f.Id === Id)[0].Info
    }
    
  }

  selectProgress(id) {
    this.saleTaskJson = this.saleTask.filter(f => f.SalesStage === id);
    this.page = 'list';
  }
}
