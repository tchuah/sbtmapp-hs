import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, TimeoutError } from 'rxjs';

import { locale as en } from './i18n/en';
import { locale as cn } from './i18n/cn'
import { locale as my } from './i18n/my'

import { ApiService } from 'src/@sbt/services/api.service';
import { UtilService } from 'src/@sbt/utils/util.service';
import { GlobalService } from 'src/app/app-config/global.service';
import { TranslationLoaderService } from 'src/@sbt/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingController, NavController, Platform } from '@ionic/angular';

import { ActivatedRoute } from '@angular/router';
import { AzureBlobStorageService } from 'src/@sbt/services/azure-blob-storage.service';
import { takeUntil } from 'rxjs/operators';
import { release } from 'os';

@Component({
  selector: 'app-sales-potential4',
  templateUrl: './sales-potential4.page.html',
  styleUrls: ['./sales-potential4.page.scss'],
})
export class SalesPotential4Page implements OnInit, OnDestroy {

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
    ApplicationTemp: { Id: '', Info: '' },
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

    this.api.httpSp(`Main/ACT_LookupAppSalesMaster?KeyAction=MASTER`, { Id: this.paramId })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.dataJson = data[0];
          this.dataSalesJson = this.dataJson.AppSales;
          this.IsVerified = this.dataJson.IsVerified
          this.dataSalesJson.forEach((f, i) => {
            f.tempLoan = f.Loan;
            f.setOpen = false;
            if (i === 0) {
              f.setOpen = true;
            }

            f.Application = { Id: f.Application, Info: f.ApplicationName }
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

  LoanChange(item, e) {
    item.IsLoan = e.detail.checked;
    if (e.detail.checked) {
      item.Loan = item.tempLoan;
    }
    else {
      item.Loan = 0;
    }

    this.autoCalculate('Loan', item)
  }

  /* Button Function */
  // Save
  indieSave(item) {
    if (item.IsLoan && !item.Loan) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'You must key in the loan figure if Loan is required!');
      return;
    }

    else if (item.Outstanding !== 0) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'Outstanding must be 0 before proceed!');
      return;
    }

    else {
      this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to update this sales?', async () => {
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

  // Release
  salesItem;
  percentage = this.global.DepositPercentage / 100;
  prerelease(item) {
    this.salesItem = item;
    let afterDepositPercentage = item.Sales * this.percentage;
    if ((item.Deposit < afterDepositPercentage) && (item.Deposit !== item.DepositCollected || item.Outstanding !== 0)) {
      this.util.msgboxConfirmXTranslate('Client Alert!', `The deposit is less than ${this.global.DepositPercentage}% of the sales and the forecast and the collected deposit amount is not tally. Please submit proof of sales authorization to proceed.`, async () => {
        this.uploadFile2();
      });
    }
    else if (item.Deposit < afterDepositPercentage) {
      this.util.msgboxConfirmXTranslate('Client Alert!', `The deposit is less than ${this.global.DepositPercentage}% of the sales. Please submit proof of sales authorization to proceed.`, async () => {
        this.uploadFile2();
      });
    }
    else if (item.Deposit !== item.DepositCollected || item.Outstanding !== 0) {
      item.setOpen = true;
      this.util.msgboxConfirmXTranslate('Client Alert!', `The forecast and the collected deposit amount is not tally. Please submit proof of sales authorization to proceed.`, async () => {
        this.uploadFile2();
      });
    }
    else {
      this.util.msgboxConfirmXTranslate('Client Alert!', `Are you sure to release this sales?`, async () => {
        this.release(item);
      });
    }
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

  uploadFile2() {
    document.getElementById('upload2').click();
  }

  @ViewChild('upload2')
  fileInput2: ElementRef;
  file: any;
  extension = '';
  allowedExtension = ['jpeg', 'jpg', 'png', 'pdf', 'xlsx'];
  async onFileChange2(e) {
    this.file = e.target.files[0];
    this.fileInput2.nativeElement.value = '';

    this.extension = this.file.name.split('.')[1];
    if (!this.allowedExtension.includes(this.extension)) {
      this.util.genericMessageBoxXTranslate('Client Alert', `We only accept ${this.allowedExtension} files only`);
      return;
    }
    let description = `Proof for sales release for ${this.dataJson.Quotation}`;
    description = await this.util.promptDescription2(description);

    let body =
    {
      FileName: description,
      Fk: this.salesItem.Id,
      Container: this.containerName,
      TableName: 'AppSales',
      Extension: this.extension,
      Field: 0,
      FieldValue: 0
    }
    this.api.httpAction(`Main/ACT_UploadAttachment?KeyAction=UPLOAD`, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          this.blobService.uploadFile(this.file, data[0].FileId + '.' + this.extension, this.containerName, this.sas);
          setTimeout(() => {
            this.release(this.salesItem);
          }, 1000);
        }
        else {
          this.api.handleApiError2(data[0].ReturnCode);
        }
      }, async (error) => {
        if (error instanceof TimeoutError) {
          this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
        } else {
          this.api.handleApiError(error);
        }
      });
  }

  // Cancel
  cancelSales(item) {
    if ((item.SalesCollected + item.DepositCollected + item.LoanCollected + item.BalanceCollected) !== item.Reimburse) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'You can only cancel a sales when all the collected figure is equal to reimburse.');
      return;
    }

    this.util.msgboxConfirmXTranslate('Client Alert!', `Are you sure you want to cancel this sales?`, async () => {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();

      this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${item.Id}&KeyAction=CANCEL-SALES`, { RowVersion: item.RowVersion })
        .pipe(takeUntil(this.destroy$))
        .subscribe(async data => {
          if (data[0].ReturnCode === 'OK') {
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

  // Close
  async close(item) {
    this.util.msgboxConfirmXTranslate('Client Alert!', `Are you sure you want to close this sales?`, async () => {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });

      await loading.present();

      this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${item.Id}&KeyAction=CLOSE-SALES`, {})
        .pipe(takeUntil(this.destroy$))
        .subscribe(async data => {
          if (data[0].ReturnCode === 'OK') {
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

  // Revert Close
  revertClose(item) {
    this.util.msgboxConfirmXTranslate('Client Alert!', `Are you sure you revert this sales?`, async () => {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();

      this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${item.Id}&KeyAction=REVERT-CLOSE-SALES`, { RowVersion: item.RowVersion })
        .pipe(takeUntil(this.destroy$))
        .subscribe(async data => {
          if (data[0].ReturnCode === 'OK') {
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

  // Revert Cancel
  revertCancel(item) {
    this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to revert this sales?', async () => {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();

      this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${item.Id}&KeyAction=REVERT-CANCEL-SALES`, { RowVersion: item.RowVersion })
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

  // Revert Chassis Number
  revertCN(item) {
    this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to unassign this Chassis Number?', () => {
      this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${item.Id}&KeyAction=UnassignChassisNo`, { RowVersion: item.RowVersion })
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

  // Cancel Quotation
  cancelQuote() {
    let totalCollected = this.dataJson.DepositCollected + this.dataJson.LoanCollected + this.dataJson.BalanceCollected;

    if ((totalCollected - this.dataJson.ReimbursePaid) !== 0) {
      this.api.handleApiError2('HS-QUOTE-001');
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
              this.util.goto('sales-potential2', 'sales-master');
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

  cancel() {
    this.showEdit = false;
    this.showAllocate = false;
    this.apiCall();
  }

  /* Image */
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
  /* Others */
  // Color
  colorController(status) {
    switch (status) {
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

  autoCalculate(field, item) {
    if (item) {
      if (item[field] === null) {
        item[field] = 0;
      }
      item.Outstanding = item.Sales - item.Deposit - item.Loan - item.Balance + item.Reimburse;
      item.OutstandingCollected = item.Sales - (item.DepositCollected + item.LoanCollected + item.BalanceCollected - item.ReimbursePaid);
    }

    else {
      if (this.batchData[field] === null) {
        this.batchData[field] = 0;
      }
      this.batchData.Outstanding = this.batchData.Sales - this.batchData.Deposit - this.batchData.Loan - this.batchData.Balance + this.batchData.Reimburse;
    }
  }

  async batchSave() {
    if (this.batchData.Outstanding !== 0) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'Outstanding must be 0 before proceed!');
      return;
    }

    if (this.batchData.IsLoan && this.batchData.Loan <= 0) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'You must key in the loan figure if Loan is required!');
      return;
    }
    this.util.msgboxConfirmXTranslate('Client Alert!', 'This function will overwrite all sales figure under this quotation. Are you sure to continue?', async () => {
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

  LoanChangeBatch(e) {
    this.batchData.IsLoan = e.detail.checked;
    if (e.detail.checked) {
      this.batchData.Loan = this.batchData.LoanTemp;
    }
    else {
      this.batchData.Loan = 0;
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

  public trackItem(index: number, item) {
    return item.trackId;
  }
}
