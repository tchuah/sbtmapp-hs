import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { IonInput, LoadingController, NavController, Platform } from '@ionic/angular';

import { Md5 } from 'ts-md5/dist/md5';
import { ActivatedRoute } from '@angular/router';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { AzureBlobStorageService } from 'src/@sbt/services/azure-blob-storage.service';
import { base64StringToBlob } from 'blob-util';
import { takeUntil, timeout } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DataService } from 'src/@sbt/services/data.service';

@Component({
  selector: 'app-sales2',
  templateUrl: './sales2.page.html',
  styleUrls: ['./sales2.page.scss'],
})
export class Sales2 implements OnInit, OnDestroy {

  // UI Control
  @ViewChild('focusItem', { static: false })
  focusItem: IonInput;
  showImage: boolean = false;

  isReadOnly: boolean = false;
  PageFrom: string = '';
  buttonControl: string = 'COMPLETE';
  customizeSales = false;

  // Data
  paramId;
  salesJson2;
  searchValue: string = '';

  // OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  fieldForm: FormGroup;
  sbtForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    private data: DataService,
    private httpClient: HttpClient,
    public blobService: AzureBlobStorageService,
    private api: ApiService,
    public util: UtilService,
    private loadingController: LoadingController,
    private fb: FormBuilder,
    public global: GlobalService) {
    this.translationLoaderService.loadTranslations(en, cn, my);
  }

  ngOnInit() {
    this.route.params.subscribe(param => {
      if (param) {
        this.paramId = param['id'];
        this.apiCallSales();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  public trackItem (index: number, item) {
    return item.trackId;
  }

  // General Api call and refresh
  async apiCallSales() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpSp(`Main/ACT_LookupAppSales?KeyAction=GetSalesByUser`, { SearchValue: this.searchValue })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          setTimeout(() => {
            this.salesJson2 = data.filter(f => f.Branch === this.paramId);
            console.log(this.salesJson2)
          }, 200);
          loading.dismiss();
        }
      ), async (error) => {
        if (error instanceof TimeoutError) {
          this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
        } else {
          this.api.handleApiError(error);
        }
        loading.dismiss();
      };
  }
}
