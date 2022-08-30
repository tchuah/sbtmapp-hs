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
  selector: 'app-sales-amend',
  templateUrl: './sales-amend.page.html',
  styleUrls: ['./sales-amend.page.scss'],
})
export class SalesAmendPage implements OnInit, OnDestroy {

  // UI Control
  showSales = false;
  expandIsLoan = false;
  expandIsBodyWork = false;
  containerName = 'hs-attachment'
  sas = this.global.sas;
  paramId;
  list: any = [];
  extensionJson: any = [];
  showImage = false;
  pageNumData = 0;
  pageShowNumData = 20;
  isReadOnly = true;

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
  searchValue = '';
  searchRawValue = '';
  currentStatus: number = 1;
  currentRawStatus: number = 1;
  status: number;
  vehicleModelDataFilter: any;
  salesCollected: number = 0;
  attachmentJson: any;
  selectedImage;
  noData = true;


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

    this.sbtForm = this.fb.group({
      Branch: new FormControl(null, Validators.compose([Validators.required])),
      BranchName: new FormControl(null, Validators.compose([Validators.required])),
      Customer: new FormControl(null, Validators.compose([Validators.required])),
      CustomerName: new FormControl(null),
      Date: new FormControl(null),
      Make: new FormControl(null, Validators.compose([Validators.required])),
      Model: new FormControl({ value: null, disabled: false }, Validators.compose([Validators.required])),
      Application: new FormControl(null, Validators.compose([Validators.required])),
      Sales: new FormControl(null, Validators.compose([Validators.required])),
      SalesCollected: new FormControl(null, Validators.compose([Validators.required])),
      Deposit: new FormControl(null, Validators.compose([Validators.required])),
      DepositCollected: new FormControl(null, Validators.compose([Validators.required])),
      Balance: new FormControl(null, Validators.compose([Validators.required])),
      BalanceCollected: new FormControl(null, Validators.compose([Validators.required])),
      IsLoan: new FormControl({value: null, disabled: true}, Validators.compose([Validators.required])),
      Loan: new FormControl(null, Validators.compose([Validators.required])),
      Loan1: new FormControl(null),
      LoanCollected: new FormControl(null),
      Outstanding: new FormControl(null),
      OutstandingCollected: new FormControl(null),
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
    this.apiCall(false, '');
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

  deleteSales(i: number) {
    this.salesForms.removeAt(i);
  }

  back() {
    this.apiCallSearch(false, '');
    this.salesForms.clear();
    this.status = null;
    this.showSales = false;
    this.salesCollected = null;
    this.isReadOnly = true;
  }

  edit(item, action) {
    switch (item) {
      case 'ChassisNumber':
        if (action === 'Revert') {
          this.sbtForm.get('ChassisNumber').setValue(null);
        }
        return;
    }
  }

  onEnterChange(e) {
    this.searchRawValue = e.detail.value;
  }

  selectSales(Id) {
    this.selectedSales = this.dataJson.filter(f => f.Id === Id);
    this.paramId = Id;
    this.status = this.selectedSales[0].Status;

    if (this.status !== 8 && this.status !== 9) {
      this.isReadOnly = false;
      this.sbtForm.get('IsLoan').enable();
      this.sbtForm.get('IsBodyWork').enable();
    }
    else {
      this.isReadOnly = true;
      this.sbtForm.get('IsLoan').disable();
      this.sbtForm.get('IsBodyWork').disable();
    }

    this.sbtForm.patchValue(this.selectedSales[0]);
    this.salesForms.patchValue(this.selectedSales[0].SalesOffer);

    this.sbtForm.get('Loan1').setValue(this.selectedSales[0].Loan)
    this.sbtForm.get('Make').setValue({ Id: this.selectedSales[0].Make, Info: this.selectedSales[0].MakeName })
    this.sbtForm.get('Model').setValue({ Id: this.selectedSales[0].Model, Info: this.selectedSales[0].ModelName })
    this.sbtForm.get('Application').setValue({ Id: this.selectedSales[0].Application, Info: this.selectedSales[0].ApplicationName })
    this.sbtForm.get('Bank').setValue({ Id: this.selectedSales[0].Bank, Info: this.selectedSales[0].BankName })
    this.sbtForm.get('IsLoan').value ? this.LoanExpand() : this.sbtForm.get('Loan').setValue(null); this.sbtForm.get('Bank').setValue(null); this.sbtForm.get('BankName').setValue(null);
    this.vehicleModelDataFilter = this.vehicleModelData.filter(f => f.VehicleMake === this.selectedSales[0].Make);

    
    this.list = [];
    this.extensionJson = [];
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

  lookupUser(Id) {
    return this.global.userListJson.filter(f => f.Id === Id)[0].Info
  }

  async apiCall(isFirstLoad, e?) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.api.httpSp(`Main/ACT_LookupAppSales?KeyAction=GetAllSales&offset=${this.pageNumData * this.pageShowNumData}&fetch=${this.pageShowNumData}`,  {SearchValue: this.searchValue, FilterStatus: this.currentStatus})
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
    this.api.httpSp(`Main/ACT_LookupAppSales?KeyAction=GetAllSales&offset=${this.pageNumData * this.pageShowNumData}&fetch=${this.pageShowNumData}`,  {SearchValue: this.searchValue, FilterStatus: this.currentStatus})
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

  search() {
    this.searchValue = this.searchRawValue;
    this.currentStatus = this.currentRawStatus;
    this.apiCallSearch(false, '')
  }

  async doRefresh(e) {
    this.pageNumData = 0;
    this.pageShowNumData = 20;
    this.dataJson = [];
    this.apiCall(false, '')
    e.target.complete();
  }

  uploadFile() {
    document.getElementById('upload').click();
  }

  @ViewChild('upload')
  fileInput: ElementRef;
  file: any;
  async onFileChange(e) {
    this.file = e.target.files[0];
    this.fileInput.nativeElement.value = '';
    let extension = this.file.type.split('/')[1];
    let body = [
      {
        FileName: this.file.name,
        Fk: this.paramId,
        Container: this.containerName,
        TableName: 'AppSalesTask',
        Extension: extension
      }
    ]

    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpAction(`Main/ACT_UploadAttachment?KeyAction=UPLOAD`, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        this.blobService.uploadFile(this.file, data[0].ReturnCode + '.' + extension, this.containerName, this.sas);
        this.uploadFileName = this.file.name

        setTimeout(() => {
          this.apiCall(false, '');
          loading.dismiss();
          this.util.msgPop('Uploaded Successfully!', 'success', 1000, 'bottom');
        }, 1000);
      });
  }

  onMakeChange(e) {
    this.vehicleModelDataFilter = [];
    this.sbtForm.get('Model').setValue(null);
    this.sbtForm.get('Model').enable();
    this.vehicleModelDataFilter = this.vehicleModelData.filter(f => f.VehicleMake === e.value.Id);
  }

  LoanChange(e) {
    this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${this.paramId}&KeyAction=LoanUpdate`, { IsLoan: (e.detail.checked) ? 1 : 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        
        if (data[0].ReturnCode === 'OK') {
          this.util.msgPop('Loan Changed Successfully', 'success');
        }
        else {
          this.api.handleApiError2(data[0].ReturnCode);
        }
      });
  }

  BodyWorkChange(e) {
    this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${this.paramId}&KeyAction=BodyWorkUpdate`, { IsBodyWork: (e.detail.checked) ? 1 : 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          this.util.msgPop('Body Work Changed Successfully', 'success');
        }
        else {
          this.api.handleApiError2(data[0].ReturnCode);
        }
      });
  }

  LoanExpand() {
    this.expandIsLoan = !this.expandIsLoan;
  }

  BodyworkExpand() {
    this.expandIsBodyWork = !this.expandIsBodyWork;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  autoCalculate() {
    this.sbtForm.get('SalesCollected').setValue(this.sbtForm.get('DepositCollected').value + this.sbtForm.get('LoanCollected').value + this.sbtForm.get('BalanceCollected').value - this.sbtForm.get('ReimbursePaid').value);
    this.sbtForm.get('Outstanding').setValue(this.sbtForm.get('Sales').value - this.sbtForm.get('Deposit').value - this.sbtForm.get('Loan1').value - this.sbtForm.get('Balance').value + this.sbtForm.get('Reimburse').value);
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
      this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${this.paramId}&KeyAction=${keyAction}`,{})
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          this.util.msgPop(completeWord, 'success', 1000, 'bottom');
          this.apiCall(false, '');

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

  selectStatus(e) {
    this.currentRawStatus = e.detail.value;
  }

  unassignChassis() {
    this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to unassign this Chassis Number?', () => {
      this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${this.paramId}&KeyAction=UnassignChassisNo`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          this.util.msgPop('Unassign chassis Successfully!', 'success', 1000, 'bottom');
          this.apiCall(false, '');
          this.selectSales(this.paramId)
          this.sbtForm.get('ChassisNumber').setValue(null);
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
  
  UpdateSales() {
    this.sbtForm.get('Loan').setValue(this.sbtForm.get('Loan1').value)
    this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to update these figure?', () => {
      this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${this.paramId}&KeyAction=UpdateSalesFigure`, this.sbtForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          this.util.msgPop('Update Successfully!', 'success', 1000, 'bottom');
        }
        else {
          this.api.handleApiError2(data[0].ReturnCode);
        }
      });
    });
  }

  // Lazy Loading
  infiniteLoad(e){
    this.apiCall(true, e);
  }
}
