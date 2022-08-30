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

@Component({
  selector: 'app-sales-detail',
  templateUrl: './sales-detail.page.html',
  styleUrls: ['./sales-detail.page.scss'],
})
export class SalesDetailPage implements OnInit, OnDestroy {
  // UI Control
  showSales = false;
  expandIsLoan = false;
  expandIsBodyWork = false;
  containerName = 'hs-attachment'
  sas = '?sp=racwdli&st=2022-05-27T03:18:52Z&se=2026-08-01T11:18:52Z&spr=https&sv=2020-08-04&sr=c&sig=mWOQdCw0p3JhH%2Bu8MC89y4nl6qxiNvu2ipgmIcv1XDk%3D'
  paramId;
  list: any = [];
  extensionJson: any = [];
  showImage = false;

  // Data
  param;
  dataJson: any = [];
  dataJsonRaw: any = [];
  selectedSales: any = [];
  branchData: any;
  bodyTypeData: any;
  OfferItemData: any;
  vehicleMakeData: any;
  vehicleModelData: any;
  uploadFileName: any;
  bankData: any;
  currentStatus: number = 1;
  status: number;
  vehicleModelDataFilter: any;
  salesCollected: number = 0;
  attachmentJson: any = [];
  selectedImage;


  // OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
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

    this.sbtForm = this.fb.group({
      Branch: new FormControl(null, Validators.compose([Validators.required])),
      BranchName: new FormControl(null, Validators.compose([Validators.required])),
      Customer: new FormControl(null, Validators.compose([Validators.required])),
      CustomerName: new FormControl(null),
      Date: new FormControl(null),
      MakeName: new FormControl(null, Validators.compose([Validators.required])),
      ModelName: new FormControl({ value: null, disabled: false }, Validators.compose([Validators.required])),
      Application: new FormControl(null, Validators.compose([Validators.required])),
      ApplicationName: new FormControl(null, Validators.compose([Validators.required])),
      SalesPersonName: new FormControl(null, Validators.compose([Validators.required])),
      Sales: new FormControl(null, Validators.compose([Validators.required])),
      SalesCollected: new FormControl(null, Validators.compose([Validators.required])),
      Deposit: new FormControl(null, Validators.compose([Validators.required])),
      DepositCollected: new FormControl(null, Validators.compose([Validators.required])),
      Balance: new FormControl(null, Validators.compose([Validators.required])),
      BalanceCollected: new FormControl(null, Validators.compose([Validators.required])),
      Outstanding: new FormControl(null, Validators.compose([Validators.required])),
      OutstandingCollected: new FormControl(null, Validators.compose([Validators.required])),
      IsLoan: new FormControl({value: null, disabled: true}, Validators.compose([Validators.required])),
      Loan: new FormControl(null, Validators.compose([Validators.required])),
      Loan1: new FormControl(null),
      LoanCollected: new FormControl(null),
      Bank: new FormControl(null),
      BankName: new FormControl(null),
      IsBodyWork: new FormControl({value: null, disabled: true}, Validators.compose([Validators.required])),
      BodyWorkSubcon: new FormControl(null, Validators.compose([Validators.required])),
      Reimburse: new FormControl(null, Validators.compose([Validators.required])),
      ReimbursePaid: new FormControl(null, Validators.compose([Validators.required])),
      Quotation: new FormControl(null, Validators.compose([Validators.required])),
      ChassisNumber: new FormControl(null, Validators.compose([Validators.required])),
      Quantity: new FormControl(null, Validators.compose([Validators.required])),
      Remarks: new FormControl(null),
      SalesOffer: this.fb.array([])
    })
  }

  ngOnInit() {
    this.route.params.subscribe(param => {
      if (param) {
        this.paramId = param['id'];
        this.apiCall();

        //Fetch AppVehicleMake
        this.param = "?offset=0&fetch=9999&order=Id&where=" + "IsActive" + ',=,' + "true";
        this.api.httpGet(`NewSales/AppVehicleMake${this.param}`).pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.vehicleMakeData = data;
          });
        //Fetch AppVehicleModel
        this.param = "?offset=0&fetch=9999&order=Id&where=" + "IsActive" + ',=,' + "true";
        this.api.httpGet(`NewSales/AppVehicleModel${this.param}`).pipe(takeUntil(this.destroy$))
          .subscribe(data => {
            this.vehicleModelData = data;
          });
      }
    });
  }

  // Getter 
  get salesForms() {
    return this.sbtForm.get('SalesOffer') as FormArray;
  }

  addSales() {
    const sales = this.fb.group({
      OfferItem: new FormControl(null, Validators.compose([Validators.required])),
      OfferItemName: new FormControl(null),
      OfferQty: new FormControl(null, Validators.compose([Validators.required])),
      OfferRemarks: new FormControl(null)
    })

    this.salesForms.push(sales);
  }

  lookupUser(Id) {
    return this.global.userListJson.filter(f => f.Id === Id)[0].Info
  }

  async apiCall() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpSp(`Main/ACT_LookupAppSales?KeyAction=GetAllSalesById`, { Id: this.paramId })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.selectedSales = data;
          this.status = this.selectedSales[0].Status;
          this.sbtForm.patchValue(this.selectedSales[0]);
          this.salesForms.patchValue(this.selectedSales[0].SalesOffer);

          this.sbtForm.get('Loan1').setValue(this.selectedSales[0].Loan);

          this.attachmentJson = this.selectedSales[0].Attachment;
          this.attachmentJson.forEach((f, i) => {
            this.list.push(f.Info);
            if (f.Path.split('/')[4].split('.')[1] === 'pdf' || f.Path.split('/')[4].split('.')[1] === 'xlsx') {
              this.extensionJson.push('docs')
            }
            else {
              this.extensionJson.push('Image')
            }
          });
          this.autoCalculate();

          this.selectedSales[0].SalesOffer.forEach(f => {
            const sales = this.fb.group({
              OfferItem: new FormControl(f.OfferItem, Validators.compose([Validators.required])),
              OfferItemName: new FormControl(f.OfferItemName, Validators.compose([Validators.required])),
              OfferQty: new FormControl(f.OfferQuantity, Validators.compose([Validators.required])),
              OfferRemarks: new FormControl(f.OfferRemarks)
            })
            this.salesForms.push(sales);
          });
          this.showSales = true;
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


  LoanChange(e) {

  }

  BodyWorkChange(e) {

  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  autoCalculate() {
    this.sbtForm.get('SalesCollected').setValue(this.sbtForm.get('DepositCollected').value + this.sbtForm.get('LoanCollected').value + this.sbtForm.get('BalanceCollected').value - this.sbtForm.get('ReimbursePaid').value);
    this.sbtForm.get('Outstanding').setValue(this.sbtForm.get('Sales').value - this.sbtForm.get('Deposit').value - this.sbtForm.get('Loan').value - this.sbtForm.get('Balance').value + this.sbtForm.get('Reimburse').value);
    this.sbtForm.get('OutstandingCollected').setValue(this.sbtForm.get('Sales').value - this.sbtForm.get('DepositCollected').value - this.sbtForm.get('LoanCollected').value - this.sbtForm.get('BalanceCollected').value + this.sbtForm.get('ReimbursePaid').value);
  }

  salesFunction(action) {
    let keyAction = '';
    let actionWord = '';
    let completeWord = '';
    let tempStatus;

    if (action === 'CANCEL') {
      keyAction = 'CANCEL-SALES';
      actionWord = 'Are you sure to cancel this sales?';
      completeWord = 'Cancel Sales Successfully!';
      tempStatus = 9;
    }
    else if (action === 'CLOSE') {
      keyAction = 'CLOSE-SALES';
      actionWord = 'Are you sure to close this sales?';
      completeWord = 'Close Sales Successfully!';
      tempStatus = 8;
    }
    else if (action === 'REOPEN') {
      keyAction = 'REOPEN-SALES';
      actionWord = 'Are you sure to reopen this sales?';
      completeWord = 'Reopen Sales Successfully!';
      tempStatus = 1;
    }

    this.util.msgboxConfirmXTranslate('Client Alert!', actionWord, () => {
      this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${this.paramId}&KeyAction=${keyAction}`, {})
        .pipe(takeUntil(this.destroy$))
        .subscribe(async data => {
          if (data[0].ReturnCode === 'OK') {
            this.util.msgPop(completeWord, 'success', 1000, 'bottom');
            this.apiCall();

            setTimeout(() => {
              this.status = tempStatus;
              this.sbtForm.patchValue(this.selectedSales[0]);
              this.salesForms.patchValue(this.selectedSales[0].SalesOffer);
            });

          }
          else {
            this.api.handleApiError2(data[0].ReturnCode);
          }
        });
    });
  }


  closeImg() {
    this.showImage = false;
  }

  expandImg(src) {
    this.selectedImage = src + this.sas;
    this.showImage = true;
  }
}
