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
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-sales-potential',
  templateUrl: './sales-potential.page.html',
  styleUrls: ['./sales-potential.page.scss'],
})
export class SalesPotentialPage implements OnInit, OnDestroy {

   // UI Control
   branchData;
   bodyTypeData;
   vehicleMakeData;
   vehicleModelData;
   bankData;
   currentlyOpen;
   segmentValue = 'Vehicle';
   showEdit = false;
   showAllocate = false;
 
   // Data
   containerName = 'hs-attachment'
   sas = this.global.sas;
   paramId;
   dataJson;
   dataSalesJson;
   attachmentJson;
   list;
   extensionJson;
   currentValue;
   currentField;
   newValue = 0;
   currentAllocated = 0;
   currentRemaining = 0;
   IsVerified = false;
   tempLoan = 0;
   batchData = {
     IsLoan: false,
     IsBodyWork: false,
     Sales: 0,
     SalesCollected: 0,
     Deposit: 0,
     DepositCollected: 0,
     Loan: 0,
     LoanTemp: 0,
     LoanCollected: 0,
     Balance: 0,
     BalanceCollected: 0,
     Reimburse: 0,
     ReimbursePaid: 0,
     Outstanding: 0,
     OutstandingCollected: 0,
     ApplicationTemp: {Id: '', Info: ''},
     Application: ''
   }
 
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
  }

  ngOnInit() {
    this.initApi();
    this.route.params.subscribe(param => {
      this.paramId = param['id'];
      this.apiCall();
    });
    
  }
  
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  initApi() {
    this.api.httpAction(`Main/ACT_LookupGeneral?KeyAction=NewSales&JsonParam=AppSalesMaster`, {})
    .pipe(takeUntil(this.destroy$))
    .subscribe(async data => {
      this.branchData = data[0].BranchJson;
      this.bodyTypeData = data[0].ApplicationJson;
      this.vehicleMakeData = data[0].MakeJson;
      this.vehicleModelData = data[0].ModelJson;
      this.bankData = data[0].BankJson;
    });
  }

  async apiCall() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpSp(`Main/ACT_LookupAppSalesMaster?KeyAction=MASTER`,  {Id: this.paramId})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.dataJson = data[0];
          this.dataSalesJson = this.dataJson.AppSales;
          this.IsVerified = this.dataJson.IsVerified
          this.dataSalesJson.forEach((f,i) => {
            f.tempLoan = f.Loan;
            f.setOpen = false;
            if(i === 0) {
              f.setOpen = true;
            }
            
            f.Application = {Id: f.Application, Info: f.ApplicationName}
          });

          this.attachmentJson = this.dataJson.Attachment;
          this.list = [];
          this.extensionJson = [];
          this.attachmentJson.forEach((f, i) => {
            this.list.push(f.Info);
            if (f.Path.split('/')[4].split('.')[1] === 'pdf' || f.Path.split('/')[4].split('.')[1] === 'xlsx') {
              this.extensionJson.push('docs')
            }
            else {
              this.extensionJson.push('Image')
            }
          });
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

  release(item) {
    this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to release this sales?', () => {
      this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${item.Id}&KeyAction=SalesRelease`, item)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          this.util.msgPop('Successfully Approved!', 'success', 1000, 'bottom');
          this.apiCall();
          return;
        }
        else if (data[0].ReturnCode !== 'OK') {
          this.api.handleApiError2(data[0].ReturnCode);
        }
      });
    })
  }

  revertCN(item) {
    this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to unassign this Chassis Number?', () => {
      this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${item.Id}&KeyAction=UnassignChassisNo`, {RowVersion: item.RowVersion})
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          this.util.msgPop('Unassign chassis Successfully!', 'success', 1000, 'bottom');
          this.apiCall();
        }
        else {
          this.api.handleApiError2(data[0].ReturnCode);
        }
      });
    });
  }

  async verify() {
    this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to verify this Quotation?', async()=> {
      this.uploadFile();
    });
  }

  async unverify() {
    this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to unverify this Quotation?', async()=> {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();
  
      this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${this.paramId}&KeyAction=UNVERIFY`, {})
        .pipe(takeUntil(this.destroy$))
        .subscribe(async data => {
          if (data[0].ReturnCode === 'OK') {
            this.util.msgPop('Successfully Unverify!', 'success');
            loading.dismiss();
            this.apiCall();
          }
          else {
            this.api.handleApiError2(data[0].ReturnCode);
            loading.dismiss();
          }
        }, async (error) => {
          loading.dismiss();
          if (error instanceof TimeoutError) {
            this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
          } else {
            this.api.handleApiError(error);
          }
        });
    });
  }

  revertCancel(item) {
    this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to revert this sales?', async()=> {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();
  
      this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${item.Id}&KeyAction=REVERT-CANCEL-SALES`, {RowVersion: item.RowVersion})
        .pipe(takeUntil(this.destroy$))
        .subscribe(async data => {
          if (data[0].ReturnCode === 'OK') {
            this.util.msgPop('Successfully Revert Sales!', 'success');
            loading.dismiss();
            this.apiCall();
          }
          else {
            this.api.handleApiError2(data[0].ReturnCode);
            loading.dismiss();
          }
        }, async (error) => {
          loading.dismiss();
          if (error instanceof TimeoutError) {
            this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
          } else {
            this.api.handleApiError(error);
          }
        });
    });
  }

  batchEdit() {
    this.showEdit = true;
    this.batchData = {
      IsLoan: this.dataSalesJson[0].IsLoan,
      IsBodyWork: this.dataSalesJson[0].IsBodyWork,
      Sales: this.dataSalesJson[0].Sales,
      SalesCollected: this.dataSalesJson[0].SalesCollected,
      Deposit: this.dataSalesJson[0].Deposit,
      DepositCollected: this.dataSalesJson[0].DepositCollected,
      Loan: this.dataSalesJson[0].Loan,
      LoanTemp: this.dataSalesJson[0].Loan,
      LoanCollected: this.dataSalesJson[0].LoanCollected,
      Balance: this.dataSalesJson[0].Balance,
      BalanceCollected: this.dataSalesJson[0].BalanceCollected,
      Reimburse: this.dataSalesJson[0].Reimburse,
      ReimbursePaid: this.dataSalesJson[0].ReimbursePaid,
      Outstanding: this.dataSalesJson[0].Outstanding,
      OutstandingCollected: this.dataSalesJson[0].OutstandingCollected,
      ApplicationTemp: {Id: this.dataSalesJson[0].Application.Id, Info: this.dataSalesJson[0].Application.Info},
      Application: this.dataSalesJson[0].Application.Id
    }
  }

  async batchSave() {
    if(this.batchData.Outstanding !== 0) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'Outstanding must be 0 before proceed!');
      return;
    }

    if(this.batchData.IsLoan && this.batchData.Loan <= 0) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'You must key in the loan figure if Loan is required!');
      return;
    }
    this.util.msgboxConfirmXTranslate('Client Alert!', 'This function will overwrite all sales figure under this quotation. Are you sure to continue?', async ()=> {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();
      this.batchData.Application = this.batchData.ApplicationTemp.Id;
      this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${this.paramId}&KeyAction=BATCH-UPDATE`, this.batchData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(async data => {
          if (data[0].ReturnCode === 'OK') {
            loading.dismiss();
            this.util.msgPop('Successfully Updated!', 'success');
            this.apiCall();
          }
          else {
            this.api.handleApiError2(data[0].ReturnCode);
            loading.dismiss();
          }
        }, async (error) => {
          loading.dismiss();
          if (error instanceof TimeoutError) {
            this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
          } else {
            this.api.handleApiError(error);
          }
        });
    });
  }

  indieSave(item) {
    if(item.IsLoan && !item.Loan) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'You must key in the loan figure if Loan is required!');
      return;
    }

    else if(item.Outstanding !== 0) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'Outstanding must be 0 before proceed!');
      return;
    }

    else {
      this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to update this sales?', async ()=> {
        const loading = await this.loadingController.create({
          message: 'Please wait...'
        });
        await loading.present();
    
        let temp = item.Application;
        item.Application = item.Application.Id;
        this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${item.Id}&KeyAction=SalesCreateUpdate`, item)
          .pipe(takeUntil(this.destroy$))
          .subscribe(async data => {
            if (data[0].ReturnCode === 'OK') {
              loading.dismiss();
              this.util.msgPop('Successfully Updated!', 'success');
              item.Application = temp;
              this.apiCall();
            }
            else {
              item.Application = temp;
              this.api.handleApiError2(data[0].ReturnCode);
              loading.dismiss();
            }
          }, async (error) => {
            item.Application = temp;
            loading.dismiss();
            if (error instanceof TimeoutError) {
              this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
            } else {
              this.api.handleApiError(error);
            }
          });
      });
    }
  }

  LoanUpdate(salesId, checked){
    this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${salesId}&KeyAction=LoanUpdate`, { IsLoan: (checked) ? 1 : 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        
        if (data[0].ReturnCode === 'OK') {
          // this.util.msgPop('Loan Changed Successfully', 'success');
        }
        else {
          this.api.handleApiError2(data[0].ReturnCode);
        }
      });
  }

  BodyWorkUpdate(salesId, checked){
    this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${salesId}&KeyAction=BodyWorkUpdate`, { IsBodyWork: (checked) ? 1 : 0 })
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          // this.util.msgPop('Body Work Changed Successfully', 'success');
        }
        else {
          this.api.handleApiError2(data[0].ReturnCode);
        }
      });
  }

  cancel() {
    this.showEdit = false;
    this.showAllocate = false;
    this.apiCall();
  }

  proceed(){
    this.uploadFile();
  }

  edit(field, value) {
    this.newValue = 0;
    this.showEdit = true;
    this.currentValue = value;
    this.currentField = field;
  }

  allocate(field, value1, value2) {
    this.showAllocate = true;
    this.currentField = field;
    this.currentAllocated = value1;
    this.currentRemaining = value2;
  }

  public trackItem (index: number, item) {
    return item.trackId;
  }

  async allocateProceed(field) {
    let body = {};
    if (field === 'DepositCollected') {
      if (this.dataJson.RemainingDeposit < 0) {
        this.util.genericMessageBoxXTranslate('Client Alert!', 'The Deposit Remaining cannot be negative value!');
        return;
      }
    }
    else if (field === 'LoanCollected') {
      if (this.dataJson.RemainingLoan < 0) {
        this.util.genericMessageBoxXTranslate('Client Alert!', 'The Loan Remaining cannot be negative value!');
        return;
      }
    }
    else if (field === 'BalanceCollected') {
      if (this.dataJson.RemainingBalance < 0) {
        this.util.genericMessageBoxXTranslate('Client Alert!', 'The Balance Remaining cannot be negative value!');
        return;
      }
    }
    else if (field === 'ReimbursePaid') {
      if (this.dataJson.RemainingReimburse < 0) {
        this.util.genericMessageBoxXTranslate('Client Alert!', 'The Reimburse Remaining cannot be negative value!');
        return;
      }
    }

    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    body = this.dataSalesJson.map(f => {
      let retVal = {
        SalesId: f.Id,
        Collected: f.tempField
      }
      return retVal;
    });
    this.api.httpAction(`Main/ACT_FunctionAmendSales?KeyAction=ALLOCATION&JsonParam=${field}`, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          loading.dismiss();
          this.apiCall();
          // this.cancel();
        }
        else {
          this.api.handleApiError2(data[0].ReturnCode);
          loading.dismiss();
        }
      }, async (error) => {
        loading.dismiss();
        if (error instanceof TimeoutError) {
          this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
        } else {
          this.api.handleApiError(error);
        }
      });
  }

  deleteImage(id) {
    this.util.msgboxConfirmXTranslate('Alert', 'Are you sure to delete this image?', async () => {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();

      this.api.httpAction(`Main/ACT_UploadAttachment?Id=${id}&KeyAction=DELETE&JsonParam=ADMIN`, {})
        .pipe(takeUntil(this.destroy$))
        .subscribe(async data => {
          if (data[0].ReturnCode === 'NoFileFound') {
              this.util.genericMessageBoxXTranslate('Client Alert!', 'This file is no longer in our system.')
          }
          this.blobService.deleteFile(data[0].ReturnCode.split('/')[4], this.containerName, this.sas)
          this.apiCall();
          setTimeout(() => {
            this.attachmentJson = this.attachmentJson.filter(f => f.id !== id);
            loading.dismiss();
            this.util.msgPop('Delete Successfully!', 'success', 1000, 'bottom');
          }, 1000);
        });
    })
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

    let description = `Proof of Quotation for ${this.dataJson.Quotation}`
    description = await this.util.promptDescription2(description);

    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    let body = 
      {
        FileName: description,
        Fk: this.paramId,
        Container: this.containerName,
        TableName: 'AppSalesMaster',
        Extension: this.extension,
        Field: this.currentField,
        FieldValue: this.newValue
      }
    
    this.api.httpAction(`Main/ACT_UploadAttachment?KeyAction=UPLOAD&JsonParam=ADMIN`, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          this.blobService.uploadFile(this.file, data[0].FileId + '.' + this.extension, this.containerName, this.sas);        
          setTimeout(async () => {
        
            this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${this.paramId}&KeyAction=VERIFY`, {})
              .pipe(takeUntil(this.destroy$))
              .subscribe(async data => {
                if (data[0].ReturnCode === 'OK') {
                  loading.dismiss();
                }
                else {
                  this.api.handleApiError2(data[0].ReturnCode);
                  loading.dismiss();
                }
              }, async (error) => {
                loading.dismiss();
                if (error instanceof TimeoutError) {
                  this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
                } else {
                  this.api.handleApiError(error);
                }
              });
              this.cancel();
            loading.dismiss();
            this.util.genericMessageBoxXTranslate('Success!', 'Upload and Verified Successfully!');
          }, 1000);
        }
        else {
          this.api.handleApiError2(data[0].ReturnCode);
          loading.dismiss();
        }
      }, async (error) => {
        if (error instanceof TimeoutError) {
          this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
        } else {
          this.api.handleApiError(error);
        }
      });
  }

  LoanChange(item, e) {
    item.IsLoan = e.detail.checked;
    if (e.detail.checked) {
      item.Loan = item.tempLoan;
    }
    else {
      item.Loan = 0;
    }
    this.autoCalculate('Loan',item);
  }

  LoanChangeBatch(e) {
    this.batchData.IsLoan = e.detail.checked;
    if (e.detail.checked) {
      this.batchData.Loan = this.batchData.LoanTemp;
    }
    else {
      this.batchData.Loan = 0;
    }
  }

  autoCalculate(field, item) {
    if (item) {
      if (item[field] === null){
        item[field] = 0;
      }
      item.Outstanding = item.Sales - item.Deposit - item.Loan - item.Balance + item.Reimburse;
      item.OutstandingCollected = item.Sales - (item.DepositCollected + item.LoanCollected + item.BalanceCollected - item.ReimbursePaid);
    }

    else {
      if (this.batchData[field] === null){
        this.batchData[field] = 0;
      }
      this.batchData.Outstanding = this.batchData.Sales - this.batchData.Deposit - this.batchData.Loan  - this.batchData.Balance + this.batchData.Reimburse;
    }
  }

  expand(item) {
    this.dataSalesJson.filter(f => {
      if (f.Id === item) {
        f.setOpen = !f.setOpen;
        this.currentlyOpen = f.Id;
      }
      else {
        f.setOpen = false;
      }
    });
  }

  colorController(status) {
    switch(status) {
      case 0: //Pending
        return 'rgba(255,235,156,255)';
      case 1: //RELEASE
        return 'rgba(198,239,206,255)';
      case 8: //Close
        return 'rgba(238,238,238,1)';
      case 9: //Cancel
        return 'rgba(255,199,206,255)';
      default:
        return 'rgba(0,0,0,0)';
    }
  }

  colorController2(readonly) {
    if (readonly) {
      return 'rgba(238,238,238,1)'
    }

    return 'rgba(198,239,206,255)'
  }

  cancelQuote() {
    if(this.dataJson.Status === 9) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'This quotation has already been canceled!');
    }
    else {
      this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to cancel this quotation and sales?', async () => {
        const loading = await this.loadingController.create({
          message: 'Please wait...'
        });
        await loading.present();
    
        this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${this.dataJson.Id}&KeyAction=CANCEL-QUOTE`, {})
          .pipe(takeUntil(this.destroy$))
          .subscribe(async data => {
            if (data[0].ReturnCode === 'OK') {
              loading.dismiss();
              this.apiCall();
              this.util.msgPop('Cancel Quotation Successfully!');
            }
            else {
              this.api.handleApiError2(data[0].ReturnCode);
              loading.dismiss();
            }
          }, async (error) => {
            loading.dismiss();
            if (error instanceof TimeoutError) {
              this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
            } else {
              this.api.handleApiError(error);
            }
          });
      });
    }
  }
}
