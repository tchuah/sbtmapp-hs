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
import { DataService } from 'src/@sbt/services/data.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.page.html',
  styleUrls: ['./sales.page.scss'],
})
export class SalesPage implements OnInit, OnDestroy {

  // UI Control
  showSales = false;
  expandIsLoan = false;
  expandIsBodyWork = false;
  containerName = 'hs-attachment'
  sas = this.global.sas;
  paramId;
  list: any = [];
  extensionJson: any = [];
  showImage: boolean = false;
  showButton: boolean = false;
  status = 'new';
  noData = true;
  pageNumData = 0;
  pageShowNumData = 20;
  pageFrom;

  // Data
  param;
  dataJson: any = [];
  selectedSales: any = [];
  branchData: any;
  bodyTypeData: any;
  OfferItemData: any;
  vehicleMakeData: any;
  vehicleModelData: any;
  uploadFileName: any;
  bankData: any;
  vehicleModelDataFilter: any;
  attachmentJson: any;
  salesCollected;
  selectedImage;
  searchValue = '';
  searchRawValue = '';

  // OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    public blobService: AzureBlobStorageService,
    private translate: TranslateService,
    private data: DataService,
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
      MakeName: new FormControl(null, Validators.compose([Validators.required])),
      Model: new FormControl({ value: null, disabled: false }, Validators.compose([Validators.required])),
      ModelName: new FormControl({ value: null, disabled: false }, Validators.compose([Validators.required])),
      Application: new FormControl(null, Validators.compose([Validators.required])),
      ApplicationName: new FormControl(null, Validators.compose([Validators.required])),
      Sales: new FormControl(0, Validators.compose([Validators.required])),
      SalesCollected: new FormControl(0, Validators.compose([Validators.required])),
      SalesPerson: new FormControl(0, Validators.compose([Validators.required])),
      SalesPersonName: new FormControl(0, Validators.compose([Validators.required])),
      Deposit: new FormControl(0),
      DepositCollected: new FormControl(0),
      Balance: new FormControl(0),
      BalanceCollected: new FormControl(0),
      Loan: new FormControl(0),
      Loan1: new FormControl(0),
      LoanCollected: new FormControl(0),
      Outstanding: new FormControl(0),
      OutstandingCollected: new FormControl(0),
      Reimburse: new FormControl(0),
      ReimbursePaid: new FormControl(0),
      IsLoan: new FormControl(null, Validators.compose([Validators.required])),
      Bank: new FormControl(null),
      BankName: new FormControl(null),
      IsBodyWork: new FormControl(null, Validators.compose([Validators.required])),
      Quotation: new FormControl(null, Validators.compose([Validators.required])),
      Remarks: new FormControl(null),
      SalesOffer: this.fb.array([])
    })
  }

  ngOnInit() {
    this.route.params.subscribe(param => {
      if (param) {
        this.paramId = param['id'];
        this.apiCall();
        this.initApi();
      }
    });
    this.pageFrom = this.data.getData();

    if (this.pageFrom === 'sales-potential'){
      this.sbtForm.get('IsLoan').disable();
      this.sbtForm.get('IsBodyWork').disable();
    }
  }

  // Getter 
  get salesForms() {
    return this.sbtForm.get('SalesOffer') as FormArray;
  }

  initApi() {
    this.api.httpAction(`Main/ACT_LookupGeneral?KeyAction=NewSales`, {})
    .pipe(takeUntil(this.destroy$))
    .subscribe(async data => {
      this.sbtForm.get('Branch').setValue(data[0].BranchJson.filter(f => f.Id === this.global.branch)[0]);
      this.branchData = data[0].BranchJson;
      this.bodyTypeData = data[0].ApplicationJson;
      this.vehicleMakeData = data[0].MakeJson;
      this.vehicleModelData = data[0].ModelJson;
      this.bankData = data[0].BankJson;
      this.OfferItemData = data[0].OfferItemJson;
    });
  }

  addSales() {
    const sales = this.fb.group({
      Id: new FormControl(null),
      OfferItem: new FormControl(null, Validators.compose([Validators.required])),
      OfferQty: new FormControl(null, Validators.compose([Validators.required])),
      OfferRemarks: new FormControl(null)
    })

    this.salesForms.push(sales);
  }

  autoCalculate() {
    this.sbtForm.get('SalesCollected').setValue(this.sbtForm.get('DepositCollected').value + this.sbtForm.get('LoanCollected').value + this.sbtForm.get('BalanceCollected').value - this.sbtForm.get('ReimbursePaid').value);
    this.sbtForm.get('Outstanding').setValue(this.sbtForm.get('Sales').value - this.sbtForm.get('Deposit').value - this.sbtForm.get('Loan1').value - this.sbtForm.get('Balance').value + this.sbtForm.get('Reimburse').value);
    this.sbtForm.get('OutstandingCollected').setValue(this.sbtForm.get('Sales').value - this.sbtForm.get('DepositCollected').value - this.sbtForm.get('LoanCollected').value - this.sbtForm.get('BalanceCollected').value + this.sbtForm.get('ReimbursePaid').value);
  }

  back() {
    this.showSales = false
    this.showButton = false
    this.salesForms.clear();
    this.status = 'new'
  }

  deleteSales(i: number) {
    this.salesForms.removeAt(i);
  }

  lookupUser(Id) {
    return this.global.userListJson.filter(f => f.Id === Id)[0].Info
  }

  save(id, data) {
    this.util.msgboxConfirmXTranslate('Alert', 'Are you sure to update this remark?', async () => {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();

      this.api.httpAction(`Main/ACT_UploadAttachment?Id=${id}&JsonParam=${data}&KeyAction=SAVE`, {})
        .pipe(takeUntil(this.destroy$))
        .subscribe(async data => {
          this.apiCall();

          setTimeout(() => {
            this.selectedSales = this.dataJson.filter(f => f.Id === this.paramId);
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
            loading.dismiss();
            this.util.msgPop('Update Successfully!', 'success', 1000, 'bottom');
          }, 1000);
        });
    })
  }

  deleteImage(id) {
    this.util.msgboxConfirmXTranslate('Alert', 'Are you sure to delete this image?', async () => {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();

      this.api.httpAction(`Main/ACT_UploadAttachment?Id=${id}&KeyAction=DELETE`, {})
        .pipe(takeUntil(this.destroy$))
        .subscribe(async data => {
          this.blobService.deleteFile(data[0].ReturnCode.split('/')[4], this.containerName, this.sas)
          this.apiCall();

          setTimeout(() => {
            this.selectedSales = this.dataJson.filter(f => f.Id === this.paramId);
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
            loading.dismiss();
            this.util.msgPop('Delete Successfully!', 'success', 1000, 'bottom');
          }, 1000);
        });
    })
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

          console.log(this.selectedSales);
          this.sbtForm.get('Loan1').setValue(this.selectedSales[0].Loan);
          console.log(this.attachmentJson);
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

  uploadFile() {
    document.getElementById('upload').click();
  }

  @ViewChild('upload')
  fileInput: ElementRef;
  file: any;
  extension = '';
  allowedExtension = ['jpeg','jpg','png', 'pdf','xlsx'];
  async onFileChange(e) {
    this.file = e.target.files[0];
    this.fileInput.nativeElement.value = '';

    this.extension = this.file.name.split('.')[1];
    if (!this.allowedExtension.includes(this.extension)) {
      this.util.genericMessageBoxXTranslate('Client Alert', `We only accept ${this.allowedExtension} files only`);
      return;
    } 

    let description = await this.util.promptDescription();
    if (!description){
      description = this.file.name;
    }

    let body = [
      {
        FileName: description,
        Fk: this.paramId,
        Container: this.containerName,
        TableName: 'AppSales',
        Extension: this.extension
      }
    ] 

    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpAction(`Main/ACT_UploadAttachment?KeyAction=UPLOAD`, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        this.blobService.uploadFile(this.file, data[0].ReturnCode + '.' + this.extension, this.containerName, this.sas);
        this.uploadFileName = this.file.name
        this.apiCall();
        
        setTimeout(() => {
          this.selectedSales = this.dataJson.filter(f => f.Id === this.paramId);
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  onEnterChange(e) {
    this.searchRawValue = e.detail.value;
  }

  salesFunction(action) {
    if (action === 'COMPLETE') {

      let branch = this.sbtForm.get('Branch').value;
      let Application = this.sbtForm.get('Application').value;
      let Make = this.sbtForm.get('Make').value;
      let Model = this.sbtForm.get('Model').value;

      this.sbtForm.get('Branch').setValue(this.sbtForm.get('Branch').value.Id);
      this.sbtForm.get('Application').setValue(this.sbtForm.get('Application').value.Id);
      this.sbtForm.get('Make').setValue(this.sbtForm.get('Make').value.Id);
      this.sbtForm.get('Model').setValue(this.sbtForm.get('Model').value.Id);
      this.sbtForm.get('Loan').setValue(this.sbtForm.get('Loan1').value)

      let data = this.sbtForm.value;

      this.sbtForm.get('Branch').setValue(branch);
      this.sbtForm.get('Application').setValue(Application);
      this.sbtForm.get('Make').setValue(Make);
      this.sbtForm.get('Model').setValue(Model);

      this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${this.paramId}&KeyAction=SalesCreateUpdate`, data)
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            if (data[0].ReturnCode === 'OK') {
              this.util.msgPop('Successful!', 'success');
            }
          }), error => {
            if (error instanceof TimeoutError) {
              this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
            } else {
              this.api.handleApiError(error);
            }
          };
    }
  }

  approve() {
    this.sbtForm.get('Loan').setValue(this.sbtForm.get('Loan1').value);

    if (this.sbtForm.invalid) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'Please make sure everything in Asterisk (*) is filled in!')
      return;
    }

    this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${this.paramId}&KeyAction=SalesRelease`, this.sbtForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          this.util.msgPop('Successfully Approved!', 'success', 1000, 'bottom');
          this.apiCall();
          this.showButton = false;
          this.status = 'approved'
          return;
        }
        else if (data[0].ReturnCode !== 'OK') {
          this.api.handleApiError2(data[0].ReturnCode);
        }
      });
  }

  reject() {
    this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${this.paramId}&KeyAction=SalesReject`, {})
    .pipe(takeUntil(this.destroy$))
    .subscribe(async data => {
      if (data[0].ReturnCode === 'OK') {
        this.util.msgPop('Successfully Rejected!', 'success', 1000, 'bottom');
        this.apiCall();
        this.showButton = false;
        this.status = 'reject'
        return;
      }
      else if (data[0].ReturnCode !== 'OK') {
        this.api.handleApiError2(data[0].ReturnCode);
      }
    });
  }
}
