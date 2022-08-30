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
  selector: 'app-sales-potential3',
  templateUrl: './sales-potential3.page.html',
  styleUrls: ['./sales-potential3.page.scss'],
})
export class SalesPotential3Page implements OnInit, OnDestroy {

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
  requiredValue = 0;
  currentValue = 0;
  salesItem;
  mustValue = 0;
  currentField = '';
  newValue = 0;
  currentAllocated = 0;
  currentRemaining = 0;
  percentage = this.global.DepositPercentage / 100;

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

  ApiRefresh() {
    switch (this.currentField) {
      case 'Deposit':
        this.currentAllocated = this.dataJson.AllocatedDeposit;
        break;
      case 'Balance':
        this.currentAllocated = this.dataJson.AllocatedBalance;
        break;
      case 'Loan':
        this.currentAllocated = this.dataJson.AllocatedLoan;
        break;
      case 'Reimburse':
        this.currentAllocated = this.dataJson.AllocatedReimburse;
        break;
    }
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
          this.dataSalesJson.forEach(f => {
            f.setOpen = false;
            f.isChecked = false;
            f.tempField = 0;
            f.isError = false;
          });

          this.ApiRefresh();

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

  async release(item) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${item.Id}&KeyAction=SalesRelease`, item)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        loading.dismiss();
        if (data[0].ReturnCode === 'OK') {
          this.util.msgPop('Successfully Released!', 'success', 1000, 'bottom');
          this.apiCall();
          return;
        }
        else if (data[0].ReturnCode !== 'OK') {
          this.api.handleApiError2(data[0].ReturnCode);
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

  cancelSales(item) {
    this.util.msgboxConfirmXTranslate('Client Alert!', `Are you sure you want to cancel this sales?`, async () => {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();

      this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${item.Id}&KeyAction=CANCEL-SALES`, {RowVersion: item.RowVersion})
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

  revertClose(item) {
    this.util.msgboxConfirmXTranslate('Client Alert!', `Are you sure you revert this sales?`, async () => {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();

      this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${item.Id}&KeyAction=REVERT-CLOSE-SALES`, {RowVersion: item.RowVersion})
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

  cancel() {
    this.showEdit = false;
    this.showAllocate = false;
    this.apiCall();
  }

  proceed() {
    if (this.newValue === null || this.newValue === undefined) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'Please make sure you entered a valid figure!')
      return;
    }
    else if ((this.newValue + this.currentValue) > this.requiredValue) {
      this.util.genericMessageBoxXTranslate('Client Alert!', 'The sum of the new figure and collected cannot be larger that the required figure!')
      return;
    }
    this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to proceed?', () => {
      this.uploadFile();
    })
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

  edit(field) {
    switch (field) {
      case 'Deposit':
        this.requiredValue = this.dataJson.ForecastDeposit;
        this.currentValue = this.dataJson.CollectedDeposit;
        this.mustValue = this.dataJson.ReleasedDeposit;
        break;
      case 'Loan':
        this.requiredValue = this.dataJson.ForecastLoan;
        this.currentValue = this.dataJson.CollectedLoan;
        this.mustValue = this.dataJson.ReleasedLoan;
        break;
      case 'Balance':
        this.requiredValue = this.dataJson.ForecastBalance;
        this.currentValue = this.dataJson.CollectedBalance;
        this.mustValue = this.dataJson.ReleasedBalance;
        break;
      case 'Reimburse':
        this.requiredValue = this.dataJson.ForecastReimburse;
        this.currentValue = this.dataJson.PaidReimburse;
        this.mustValue = this.dataJson.ReleasedReimburse;
        break;
    }
    this.newValue = 0;
    this.showEdit = true;
    this.currentField = field;
  }
  
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

  allocate(field, value1, value2) {
    this.showAllocate = true;
    this.currentField = field;
    this.currentAllocated = value1;
    this.currentRemaining = value2;
  }

  flag = false;
  autoAllocate(field) {
    this.flag = !this.flag;
    console.log(this.flag)
    if (this.flag) {
      switch (field) {
        case 'Deposit':
          this.dataSalesJson.forEach(item => {
            item.isError = false;
            item.tempField = 0;
            item.tempField = item.Deposit - item.DepositCollected;
            if (item.tempField > this.dataJson.RemainingDeposit) {
              item.tempField = this.dataJson.RemainingDeposit;
            }
            this.autoCalculate('DepositCollected', item);
          });      
        break;

        case 'Loan':
          this.dataSalesJson.forEach(item => {
            item.isError = false;
            item.tempField = 0;
            item.tempField = item.Loan - item.LoanCollected;
            if (item.tempField > this.dataJson.RemainingLoan) {
              item.tempField = this.dataJson.RemainingLoan;
            }
            this.autoCalculate('LoanCollected', item);
          }); 
          break;

        case 'Balance':
          this.dataSalesJson.forEach(item => {
            item.isError = false;
            item.tempField = 0;
            item.tempField = item.Balance - item.BalanceCollected;
            if (item.tempField > this.dataJson.RemainingBalance) {
              item.tempField = this.dataJson.RemainingBalance;
            }
            this.autoCalculate('BalanceCollected', item);
          }); 
          break;

        case 'Reimburse':
          this.dataSalesJson.forEach(item => {
            item.isError = false;
            item.tempField = 0;
            item.tempField = item.Reimburse - item.ReimbursePaid;
            if (item.tempField > this.dataJson.RemainingReimburse) {
              item.tempField = this.dataJson.RemainingReimburse;
            }
            this.autoCalculate('PaidReimburse', item);
          }); 
          break;
      }
    }
    else {
      this.dataSalesJson.forEach(item => {
        item.isError = false;
        item.tempField = 0;
        switch (field) {
          case 'Deposit':
            this.autoCalculate('PaidReimburse', item);
            break;
          case 'Loan':
            this.autoCalculate('PaidReimburse', item);
            break;
  
          case 'Balance':
            this.autoCalculate('PaidReimburse', item);
            break;
  
          case 'Reimburse':
            this.autoCalculate('PaidReimburse', item);
            break;
        }
      });
    }
  }

  checkboxChange(item, field, e) {
    if (![0, 1].includes(item.Status)) {
      return;
    }

    if (e.detail.checked) {
      this.dataSalesJson.forEach(f => {
        if (f.isError) {
          f.isError = false;
          f.tempField = 0;
        }
      });

      switch (field) {
        case 'Deposit':
          item.tempField = 0;
          this.autoCalculate('DepositCollected', item);

          item.tempField = item.Deposit - item.DepositCollected;
          if (item.tempField > this.dataJson.RemainingDeposit) {
            item.tempField = this.dataJson.RemainingDeposit;
          }
          this.autoCalculate('DepositCollected', item);
          break;
        case 'Loan':
          item.tempField = 0;
          this.autoCalculate('LoanCollected', item);

          item.tempField = item.Loan - item.LoanCollected;
          if (item.tempField > this.dataJson.RemainingLoan) {
            item.tempField = this.dataJson.RemainingLoan;
          }
          this.autoCalculate('LoanCollected', item);
          break;
        case 'Balance':
          item.tempField = 0;
          this.autoCalculate('BalanceCollected', item);

          item.tempField = item.Balance - item.BalanceCollected;
          if (item.tempField > this.dataJson.RemainingBalance) {
            item.tempField = this.dataJson.RemainingBalance;
          }
          this.autoCalculate('BalanceCollected', item);
          break;
        case 'Reimburse':
          item.tempField = 0;
          this.autoCalculate('PaidReimburse', item);

          item.tempField = item.Reimburse - item.ReimbursePaid;
          if (item.tempField > this.dataJson.RemainingReimburse) {
            item.tempField = this.dataJson.RemainingReimburse;
          }
          this.autoCalculate('PaidReimburse', item);
          break;
      }
    }
    else {
      switch (field) {
        case 'Deposit':
          item.tempField = 0;
          item.isError = false;
          this.autoCalculate('DepositCollected', item);
          break;
        case 'Loan':
          item.tempField = 0;
          item.isError = false;
          this.autoCalculate('LoanCollected', item);
          break;

        case 'Balance':
          item.tempField = 0;
          item.isError = false;
          this.autoCalculate('BalanceCollected', item);
          break;

        case 'Reimburse':
          item.tempField = 0;
          item.isError = false;
          this.autoCalculate('PaidReimburse', item);
          break;
      }
    }
  }

  fromInput = false;
  inputChange(field, item, e) {
    switch (field) {
      case 'DepositCollected':
        if ((e + item.DepositCollected) === item.Deposit) {
          item.isChecked = true;
        }
        else {
          item.isChecked = false;
        }
        if ((e + item.DepositCollected) > item.Deposit) {
          item.isError = true;
        }
        else if (e === null || e === '' || e === undefined) {
          item.isError = true;
        }
        else if(e < 0) {
          item.isError = true;
        }
        else {
          item.isError = false;
        }
        break;
      case 'LoanCollected':
        if ((e + item.LoanCollected) === item.Loan) {
          item.isChecked = true;
        }
        else {
          item.isChecked = false;
        }
        if ((e + item.LoanCollected) > item.Loan) {
          item.isError = true;
        }
        else if (e === null || e === '' || e === undefined) {
          item.isError = true;
        }
        else if(e < 0) {
          item.isError = true;
        }
        else {
          item.isError = false;
        }
        break;
      case 'BalanceCollected':
        if ((e + item.BalanceCollected) === item.Balance) {
          item.isChecked = true;
        }
        else {
          item.isChecked = false;
        }
        if ((e + item.BalanceCollected) > item.Balance) {
          item.isError = true;
        }
        else if (e === null || e === '' || e === undefined) {
          item.isError = true;
        }
        else if(e < 0) {
          item.isError = true;
        }
        else {
          item.isError = false;
        }
        break;
      case 'ReimbursePaid':
        if ((e + item.ReimbursePaid) === item.Reimburse) {
          item.isChecked = true;
        }
        else {
          item.isChecked = false;
        }
        if ((e + item.ReimbursePaid) > item.Reimburse) {
          item.isError = true;
        }
        else if (e === null || e === '' || e === undefined) {
          item.isError = true;
        }
        else if(e < 0) {
          item.isError = true;
        }
        else {
          item.isError = false;
        }
        break;
    }
    this.fromInput = true
    this.autoCalculate(field, item);
  }

  sumVal = 0;
  tempVal = 0;
  autoCalculate(field, item) {
    this.sumVal = 0;
    this.tempVal = 0;

    this.dataSalesJson.forEach(f => {
      this.sumVal += parseFloat(f.tempField);
    });

    if (field === 'DepositCollected') {
      this.dataJson.AllocatedDeposit = this.currentAllocated + this.sumVal;
      this.dataJson.RemainingDeposit = this.dataJson.CollectedDeposit - this.dataJson.AllocatedDeposit;
    }
    else if (field === 'LoanCollected') {
      this.dataJson.AllocatedLoan = this.currentAllocated + this.sumVal;
      this.dataJson.RemainingLoan = this.dataJson.CollectedLoan - this.dataJson.AllocatedLoan;
    }
    else if (field === 'BalanceCollected') {
      this.dataJson.AllocatedBalance = this.currentAllocated + this.sumVal;
      this.dataJson.RemainingBalance = this.dataJson.CollectedBalance - this.dataJson.AllocatedBalance;
    }
    else if (field === 'ReimbursePaid') {
      this.dataJson.AllocatedReimburse = this.currentAllocated + this.sumVal;
      this.dataJson.RemainingReimburse = this.dataJson.ReimbursePaid - this.dataJson.AllocatedReimburse;
    }
    this.tempVal = this.sumVal;

    if (!item.isError) {
      this.fromInput = false;
    }
  }

  async resetAllocation(field, item) {
    this.util.msgboxConfirmXTranslate('Client Alert!', 'Are you sure to revert this allocated figures?', async () => {
      const loading = await this.loadingController.create({
        message: 'Please wait...'
      });
      await loading.present();

      this.api.httpAction(`Main/ACT_FunctionAmendSales?Id=${item.Id}&KeyAction=RESET-ALLOCATION&JsonParam=${field}`, {})
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

  async allocateValidate(field) {
    let isError = false;
    let errorMsg = [];
    var promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (field === 'DepositCollected') {
          this.dataSalesJson.forEach(f => {
            if (f.tempField === null || f.tempField === undefined) {
              errorMsg.push('Please make sure you entered a valid figure!') 
              isError = true;
            }
            else if (f.Deposit < (f.DepositCollected + f.tempField)) {
              errorMsg.push('The sum of allocated and allocated now cannot be larger than required!') 
              isError = true;
            }
          });

          if (isError) {
            this.util.genericMessageBoxXTranslate('Client Alert!', errorMsg[0]);
            resolve(null)
            return;
          }
          else if (this.dataJson.RemainingDeposit < 0) {
            this.util.genericMessageBoxXTranslate('Client Alert!', 'The Deposit Remaining cannot be negative value!');
            resolve(null);
            return;
          }
          else {
            resolve(field);
          }
        }
        else if (field === 'LoanCollected') {
          this.dataSalesJson.forEach(f => {
            if (f.tempField === null || f.tempField === undefined) {
              this.util.genericMessageBoxXTranslate('Client Alert!', 'Please make sure you entered a valid figure!');
              isError = true;
            }
            else if (f.Loan < (f.LoanCollected + f.tempField)) {
              this.util.genericMessageBoxXTranslate('Client Alert!', 'The sum of allocated and allocated now cannot be larger than required!');
              isError = true;
            }
          });
          if (isError) {
            resolve(null)
            return;
          }
          else if (this.dataJson.RemainingLoan < 0) {
            this.util.genericMessageBoxXTranslate('Client Alert!', 'The Loan Remaining cannot be negative value!');
            resolve(null);
            return;
          }
          else {
            resolve(field);
          }
        }
        else if (field === 'BalanceCollected') {
          this.dataSalesJson.forEach(f => {
            if (f.tempField === null || f.tempField === undefined) {
              this.util.genericMessageBoxXTranslate('Client Alert!', 'Please make sure you entered a valid figure!');
              isError = true;
            }
            else if (f.Balance < (f.BalanceCollected + f.tempField)) {
              this.util.genericMessageBoxXTranslate('Client Alert!', 'The sum of allocated and allocated now cannot be larger than required!');
              isError = true;
            }
          });
          if (isError) {
            resolve(null)
            return;
          }
          else if (this.dataJson.RemainingBalance < 0) {
            this.util.genericMessageBoxXTranslate('Client Alert!', 'The Balance Remaining cannot be negative value!');
            resolve(null);
            return;
          }
          else {
            resolve(field);
          }
        }
        else if (field === 'ReimbursePaid') {
          this.dataSalesJson.forEach(f => {
            if (f.tempField === null || f.tempField === undefined) {
              this.util.genericMessageBoxXTranslate('Client Alert!', 'Please make sure you entered a valid figure!');
              isError = true;
            }
            else if (f.Reimburse < (f.ReimbursePaid + f.tempField)) {
              this.util.genericMessageBoxXTranslate('Client Alert!', 'The sum of allocated and allocated now cannot be larger than required!');
              isError = true;
            }
          });
          if (isError) {
            resolve(null)
            return;
          }
          else if (this.dataJson.RemainingReimburse < 0) {
            this.util.genericMessageBoxXTranslate('Client Alert!', 'The Reimburse Remaining cannot be negative value!');
            resolve(null);
            return;
          }
          else {
            resolve(field);
          }
        }
      });

    });

    return promise;
  }

  async allocateProceed(fld) {
    await this.allocateValidate(fld).then(f => {
      if (f) {
        this.util.msgboxConfirmXTranslate('Client Alert!', `Are you sure you save this?`, async () => {
          const loading = await this.loadingController.create({
            message: 'Please wait...'
          });
          await loading.present();

          let body = this.dataSalesJson.map(f => {
            let retVal = {
              SalesId: f.Id,
              Collected: f.tempField
            }
            return retVal;
          });

          this.api.httpAction(`Main/ACT_FunctionAmendSales?KeyAction=ALLOCATION&JsonParam=${fld}`, body)
            .pipe(takeUntil(this.destroy$))
            .subscribe(async data => {
              if (data[0].ReturnCode === 'OK') {
                loading.dismiss();
                this.apiCall();
              }
              else {
                this.api.handleApiError2(data[0].ReturnCode);
                loading.dismiss();
                return;
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

  uploadFile2() {
    document.getElementById('upload2').click();
  }

  @ViewChild('upload')
  fileInput: ElementRef;
  file: any;
  extension = '';
  allowedExtension = ['jpeg', 'jpg', 'png', 'pdf', 'xlsx'];
  async onFileChange(e) {
    this.file = e.target.files[0];
    this.fileInput.nativeElement.value = '';

    this.extension = this.file.name.split('.')[1];
    if (!this.allowedExtension.includes(this.extension)) {
      this.util.genericMessageBoxXTranslate('Client Alert', `We only accept ${this.allowedExtension} files only`);
      return;
    }
    let description = `Proof of Payment for ${this.dataJson.Quotation} ${this.currentField}`
    description = await this.util.promptDescription2(description);

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


    this.api.httpAction(`Main/ACT_UploadAttachment?KeyAction=UPLOAD&JsonParam=FINANCE`, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          this.blobService.uploadFile(this.file, data[0].FileId + '.' + this.extension, this.containerName, this.sas);
          this.apiCall();
          this.currentValue += this.newValue;
          this.newValue = 0;
          setTimeout(() => {
            this.util.msgPop('Uploaded Successfully!', 'success', 1000, 'bottom');
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

  @ViewChild('upload2')
  fileInput2: ElementRef;
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

  public trackItem(index: number, item) {
    return item.trackId;
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

  colorController2(readonly, item) {
    if (readonly) {
      return 'rgba(238,238,238,1)';
    }
    else if (item.isError) {
      return 'rgba(255,199,206,255)';
    }
    return 'rgba(198,239,206,255)'
  }

  cancelQuote() {
    let totalCollected = this.dataJson.DepositCollected + this.dataJson.LoanCollected + this.dataJson.BalanceCollected;
    
    console.log()
    if((totalCollected - this.dataJson.ReimbursePaid) !== 0) {
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
}
