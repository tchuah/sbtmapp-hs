import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { NavController, Platform } from '@ionic/angular';
import { takeUntil } from 'rxjs/operators';
import { i18nMetaToJSDoc } from '@angular/compiler/src/render3/view/i18n/meta';


@Component({
  selector: 'app-new-sales',
  templateUrl: './new-sales.page.html',
  styleUrls: ['./new-sales.page.scss'],
})
export class newSalesPage implements OnInit, OnDestroy {

  // UI Control

  // Data
  today = new Date();
  branchData: any;
  bodyTypeData: any;
  OfferItemData: any;
  vehicleMakeData: any;
  vehicleModelData: any;
  bankData: any;
  vehicleModelDataFilter: any;
  customerData: any;
  ngCustomerName: any;
  IsLoan: boolean = false;
  IsBodyWork: boolean = false;
  expandIsLoan = false;
  expandIsBodyWork = false;

  //OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;
  param: string;

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    private translate: TranslateService,
    private api: ApiService,
    public util: UtilService,
    private fb: FormBuilder,
    public global: GlobalService) {
    this.translationLoaderService.loadTranslations(en, cn, my);

    this.sbtForm = this.fb.group({
      Branch: new FormControl(null, Validators.compose([Validators.required])),
      Customer: new FormControl(null, Validators.compose([Validators.required])),
      CompanyName: new FormControl(null),
      Make: new FormControl(null, Validators.compose([Validators.required])),
      Model: new FormControl({value: null, disabled: true}, Validators.compose([Validators.required])),
      Application: new FormControl(null, Validators.compose([Validators.required])),
      Sales: new FormControl(0, Validators.compose([Validators.required])),
      SalesCollected: new FormControl(0),
      Deposit: new FormControl(0),
      DepositCollected: new FormControl(0),
      IsLoan: new FormControl(false),
      Loan: new FormControl(0),
      LoanCollected: new FormControl(0),
      Balance: new FormControl(0),
      BalanceCollected: new FormControl(0),
      Outstanding: new FormControl(0),
      OutstandingCollected: new FormControl(0),
      Reimburse: new FormControl(0),
      ReimbursePaid: new FormControl(0),
      IsBodyWork: new FormControl(false),
      Quotation: new FormControl(null, Validators.compose([Validators.required])),
      Quantity: new FormControl(null, Validators.compose([Validators.required])),
      Remarks: new FormControl(null),
      SalesOffer: this.fb.array([])
    })
  }

  // Getter 
  get salesForms(){
    return this.sbtForm.get('SalesOffer') as FormArray;
  }

  addSales(){
    const sales = this.fb.group({
      OfferItem: new FormControl(null, Validators.compose([Validators.required])),
      OfferQty: new FormControl(null, Validators.compose([Validators.required])),
      OfferRemarks: new FormControl(null)
    })

    this.salesForms.push(sales);
  }

  deleteSales(i:number){
    this.salesForms.removeAt(i);
  }

  onMakeChange(e) {
    this.vehicleModelDataFilter = [];
    this.sbtForm.get('Model').setValue(null);
    this.sbtForm.get('Model').enable();
    this.vehicleModelDataFilter = this.vehicleModelData.filter(f => f.VehicleMake === e.value.Id);
  }

  LoanChange(e) {
    this.IsLoan = e.detail.checked;
    this.sbtForm.get('Loan').setValue(0);
  }

  BodyWorkChange(e) {
    this.IsBodyWork = e.detail.checked;
  }

  ngOnInit() { 
    this.initApi();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
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

  toUpper(e) {
    this.sbtForm.get('Customer').setValue(e.detail.value.toUpperCase())
  }

  toUpperQuotation(e) {
    this.sbtForm.get('Quotation').setValue(e.detail.value.toUpperCase())
  }

  checkCustomer() {
    if (!this.sbtForm.get('Customer').value) {
      this.util.genericMessageBoxXTranslate('Alert!', 'The input field is empty!')
      return;
    }
    else if (isNaN(this.sbtForm.get('Customer').value)){
      this.util.genericMessageBoxXTranslate('Alert!', 'The new company number should only consist of numbers!')
      return;
    }

    this.param = "?where=" + "Id" + ',=,' + this.sbtForm.get('Customer').value;
    this.api.httpGet(`NewSales/AppCustomer${this.param}`).pipe(takeUntil(this.destroy$))
      .subscribe(data =>{
        this.customerData = data;
        if (this.customerData.length === 0) {
          this.util.createCustomerMessageBox(() => {
          }, () => {
            this.navController.navigateForward(`/new-customers`)
          })

          this.refresh();
          return;
        }

        if (!data[0].IsActive) {
          this.util.genericMessageBoxXTranslate('Client Alert!', 'This Company is still not active. Please contact the system admin to approve this company.');
          return;
        }

        this.sbtForm.get('CompanyName').setValue(data[0].CompanyName);
    });
  }

  refresh() {
    let temp = this.sbtForm.get('Branch').value;
    this.sbtForm.reset();
    this.salesForms.clear()
    this.sbtForm.get('Branch').setValue(temp);
  }

  autoCalculate(field) {
    if (this.sbtForm.get(field).value === null){
      this.sbtForm.controls[field].setValue(0)
    }
    this.sbtForm.get('SalesCollected').setValue(parseInt(this.sbtForm.get('DepositCollected').value) + parseInt(this.sbtForm.get('LoanCollected').value) + parseInt(this.sbtForm.get('BalanceCollected').value) - parseInt(this.sbtForm.get('ReimbursePaid').value));
    this.sbtForm.get('Outstanding').setValue(parseInt(this.sbtForm.get('Sales').value) - parseInt(this.sbtForm.get('Deposit').value) - parseInt(this.sbtForm.get('Loan').value) - parseInt(this.sbtForm.get('Balance').value) + parseInt(this.sbtForm.get('Reimburse').value));
    this.sbtForm.get('OutstandingCollected').setValue(parseInt(this.sbtForm.get('Sales').value) - parseInt(this.sbtForm.get('DepositCollected').value) - parseInt(this.sbtForm.get('LoanCollected').value) - parseInt(this.sbtForm.get('BalanceCollected').value) + parseInt(this.sbtForm.get('ReimbursePaid').value));
  }

  create() {
    let tempBranch = this.sbtForm.get('Branch').value
    let tempApplication = this.sbtForm.get('Application').value
    let tempMake = this.sbtForm.get('Make').value
    let tempModel = this.sbtForm.get('Model').value

    this.sbtForm.get('Branch').setValue(this.sbtForm.get('Branch').value.Id);
    this.sbtForm.get('Application').setValue(this.sbtForm.get('Application').value.Id);
    this.sbtForm.get('Make').setValue(this.sbtForm.get('Make').value.Id);
    this.sbtForm.get('Model').setValue(this.sbtForm.get('Model').value.Id);

    this.api.httpAction(`Main/ACT_FunctionAppSales?KeyAction=SalesCreate`, this.sbtForm.value)
    .pipe(takeUntil(this.destroy$))
    .subscribe((data) => {
      if (data[0].ReturnCode === 'OK') {
        this.util.genericMessageBoxXTranslate('Successful!', 'Successfully Created!');
        this.sbtForm.get('Branch').setValue(tempBranch);
        this.refresh();
      }
      else if (data[0].ReturnCode !== 'OK') {
        this.api.handleApiError2(data[0].ReturnCode)
        this.sbtForm.get('Branch').setValue(tempBranch);
        this.sbtForm.get('Application').setValue(tempApplication);
        this.sbtForm.get('Make').setValue(tempMake);
        this.sbtForm.get('Model').setValue(tempModel);
      }
    }), error => {
      if (error instanceof TimeoutError) {
        this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
      } else {
        this.api.handleApiError(error);
      }
    };
  }

  verified() {
    if (this.sbtForm.invalid) {
      return true;
    } 
    else if (this.sbtForm.get('Outstanding').value !== 0){
      return true;
    }
    else if (!this.sbtForm.get('Sales').value) {
      return true;
    }
    else if (this.sbtForm.get('IsLoan').value && !this.sbtForm.get('Loan').value) {
      return true;
    }

    return false;
  }
}
