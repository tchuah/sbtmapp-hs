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
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
})
export class TaskDetail implements OnInit, OnDestroy {

  // UI Control
  @ViewChild('focusItem', { static: false })
  focusItem: IonInput;
  showImage: boolean = false;

  isReadOnly: boolean = false;
  PageFrom: string = '';
  customizeSales = false;
  Customize6BImage = false;

  // Data
  containerName = 'hs-attachment'
  sas = this.global.sas;
  paramId;
  getData;
  getData2;
  tasksJson;
  WorkflowStageItemId;
  uploadFileName: string;
  attachmentJson: any = [];
  attachmentTempJson: any = [];
  progress = 0;
  salesJson;
  selectedImage;
  finalBalance;
  lookupJson: any = new Array(6);
  list: any = [];
  extensionJson: any = [];
  Detail1;
  summation = 0;
  notApplicable = false;

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

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.route.params.subscribe(param => {
      if (param) {
        this.paramId = param['id'];
        this.api.httpSp(`Main/ACT_LookupAppSales?KeyAction=GetTaskById`, { TaskId: this.paramId })
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (data) => {
              this.getData = data[0]
              this.attachmentJson = this.getData.Attachment;
              this.extensionJson = [];
              this.list = [];
              this.attachmentJson.forEach((f, i) => {
                this.list.push(f.Info);
                if (f.Path.split('/')[4].split('.')[1] === 'pdf' || f.Path.split('/')[4].split('.')[1] === 'xlsx') {
                  this.extensionJson.push('docs')
                }
                else {
                  this.extensionJson.push('Image')
                }
              });
              this.salesJson = this.getData.AppSales;
              if (this.getData.IsComplete || this.data.getData() === 'progress-detail') {
                this.isReadOnly = true;
              }

              //Customize 6B: 72F06892-D712-4E19-AA12-975F7E4ED261
              if (this.getData.WorkflowStageItem === '72F06892-D712-4E19-AA12-975F7E4ED261') {
                this.getData.StageItemUploadFile = true;
                this.Customize6BImage = true;
              }

              this.fieldForm = this.fb.group({
                Detail1: [{ value: null }, (this.getData.StageItemDetail1) ? Validators.required : ''],
                Detail2: [{ value: null }, (this.getData.StageItemDetail2) ? Validators.required : ''],
                Detail3: [{ value: null }, (this.getData.StageItemDetail3) ? Validators.required : ''],
                Detail4: [{ value: null }, (this.getData.StageItemDetail4) ? Validators.required : ''],
                Detail5: [{ value: null }, (this.getData.StageItemDetail5) ? Validators.required : ''],
                Number1: [{ value: null, disabled: false }, (this.getData.StageItemNumber1) ? Validators.required : ''],
                Number2: [{ value: null }, (this.getData.StageItemNumber2) ? Validators.required : ''],
                Number3: [{ value: null }, (this.getData.StageItemNumber3) ? Validators.required : ''],
                Number4: [{ value: null }, (this.getData.StageItemNumber4) ? Validators.required : ''],
                Number5: [{ value: null }, (this.getData.StageItemNumber5) ? Validators.required : ''],
                Date1: [{ value: null }, (this.getData.StageItemDate1) ? Validators.required : ''],
                Date2: [{ value: null }, (this.getData.StageItemDate2) ? Validators.required : ''],
                Date3: [{ value: null }, (this.getData.StageItemDate3) ? Validators.required : ''],
                Date4: [{ value: null }, (this.getData.StageItemDate4) ? Validators.required : ''],
                Date5: [{ value: null }, (this.getData.StageItemDate5) ? Validators.required : ''],
                Progress: [{ value: null }],
              });

              this.sbtForm = this.fb.group({
                Sales: new FormControl(null, Validators.compose([Validators.required])),
                SalesCollected: new FormControl(null, Validators.compose([Validators.required])),
                Deposit: new FormControl(null, Validators.compose([Validators.required])),
                DepositCollected: new FormControl(null, Validators.compose([Validators.required])),
                Balance: new FormControl(null, Validators.compose([Validators.required])),
                BalanceCollected: new FormControl(null, Validators.compose([Validators.required])),
                Loan: new FormControl(null, Validators.compose([Validators.required])),
                LoanCollected: new FormControl(null, Validators.compose([Validators.required])),
                Reimburse: new FormControl(null, Validators.compose([Validators.required])),
                ReimbursePaid: new FormControl(null, Validators.compose([Validators.required])),
                Outstanding: new FormControl(null, Validators.compose([Validators.required])),
                OutstandingCollected: new FormControl(null, Validators.compose([Validators.required])),
              })

              this.fieldForm.patchValue(this.getData);
              this.sbtForm.patchValue(this.getData.AppSales[0])

              this.summation = this.sbtForm.get('Sales').value - this.sbtForm.get('Deposit').value - this.sbtForm.get('Loan').value - this.sbtForm.get('Balance').value + this.sbtForm.get('Reimburse').value;
              this.progress = this.getData.Progress

              //Lookup
              if (this.getData.StageItemDetail1LookupType) {
                this.lookup(1, this.getData.StageItemDetail1LookupType, this.getData.StageItemDetail1LookupSetting);
                setTimeout(() => {
                  this.fieldForm.get('Detail1').setValue(this.lookupJson[1].filter(f => f.Id === this.getData.Detail1)[0])
                }, 500);
              }
              if (this.getData.StageItemDetail2LookupType) {
                this.lookup(2, this.getData.StageItemDetail2LookupType, this.getData.StageItemDetail2LookupSetting);
                setTimeout(() => {
                  this.fieldForm.get('Detail2').setValue(this.lookupJson[2].filter(f => f.Id === this.getData.Detail2)[0])
                }, 500);
              }
              if (this.getData.StageItemDetail3LookupType) {
                this.lookup(3, this.getData.StageItemDetail3LookupType, this.getData.StageItemDetail3LookupSetting);
                setTimeout(() => {
                  this.fieldForm.get('Detail3').setValue(this.lookupJson[3].filter(f => f.Id === this.getData.Detail3)[0])
                }, 500);
              }
              if (this.getData.StageItemDetail4LookupType) {
                this.lookup(4, this.getData.StageItemDetail4LookupType, this.getData.StageItemDetail4LookupSetting);
                setTimeout(() => {
                  this.fieldForm.get('Detail4').setValue(this.lookupJson[4].filter(f => f.Id === this.getData.Detail4)[0])
                }, 500);
              }
              if (this.getData.StageItemDetail5LookupType) {
                this.lookup(5, this.getData.StageItemDetail5LookupType, this.getData.StageItemDetail5LookupSetting);
                setTimeout(() => {
                  this.fieldForm.get('Detail5').setValue(this.lookupJson[5].filter(f => f.Id === this.getData.Detail5)[0])
                }, 500);
              }

              //Customize
              // 7B
              if (this.getData.WorkflowStageItem === '9900B9C6-6EF9-4EE3-B62D-E8E6750302E1') {
                if (this.isReadOnly) {
                  this.customizeSales = false;
                }
                else {
                  this.customizeSales = true;
                }
              }
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
    });
  }

  lookupUser(Id) {
    return this.global.userListJson.filter(f => f.Id === Id)[0].Info
  }

  setFocus() {
    setTimeout(() => {
      this.focusItem.setFocus();
    });
  }

  autoCalculate() {
    this.sbtForm.get('SalesCollected').setValue(this.sbtForm.get('DepositCollected').value + this.sbtForm.get('LoanCollected').value + this.sbtForm.get('BalanceCollected').value - this.sbtForm.get('ReimbursePaid').value);
    this.sbtForm.get('Outstanding').setValue(this.sbtForm.get('Sales').value - this.sbtForm.get('Deposit').value - this.sbtForm.get('Loan').value - this.sbtForm.get('Balance').value + this.sbtForm.get('Reimburse').value);
    this.sbtForm.get('OutstandingCollected').setValue(this.sbtForm.get('Sales').value - this.sbtForm.get('DepositCollected').value - this.sbtForm.get('LoanCollected').value - this.sbtForm.get('BalanceCollected').value + this.sbtForm.get('ReimbursePaid').value);
  }

  // General Api call and refresh
  async apiCall() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpSp(`Main/ACT_LookupAppSales?KeyAction=GetTaskById`, { TaskId: this.paramId })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.getData = data[0]
          this.attachmentJson = this.getData.Attachment;
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

  expandImg(src) {
    this.selectedImage = src + this.sas;
    this.showImage = true;
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
          setTimeout(() => {
            this.apiCall();
            loading.dismiss();
            this.util.msgPop('Updated Successfully!', 'success', 500);
          }, 1000);
        }, async (error) => {
          if (error instanceof TimeoutError) {
            this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
          } else {
            this.api.handleApiError(error);
          }
  
          loading.dismiss();
        });
    })
  }

  closeImg() {
    this.showImage = false;
  }

  uploadFile() {
    document.getElementById('upload').click();
  }

  dateFormat(type) {
    if (type) {
      if (type.toUpperCase() === 'DATE') {
        return 'DD/MM/YYYY';
      }
      else if (type.toUpperCase() === 'TIME') {
        return 'h:mm a';
      }
      else {
        return 'YYYY-MM-DD h:mm a';
      }
    }
  }

  NAChange(e) {
    this.notApplicable = e.detail.checked;
  }

  lookup(index, type, settings) {
    if (type) {
      switch (type.toUpperCase()) {
        case 'LOOKUPSP':
          if (this.getData.WorkflowStageItem === '895EC23B-3DB1-4C2C-9348-803F767CE44B') {
            let body = {
              Make: this.getData.AppSales[0].Make,
              Model: this.getData.AppSales[0].Model,
              IsCompleted: this.getData.IsComplete
            }
            this.httpClient.post(this.global.baseUrl + `action/Workflow/${settings}`, body)
            .pipe(timeout(5000), takeUntil(this.destroy$))
            .subscribe(data => {
              this.lookupJson[index] = data;
            }, error => {
              if (error.status === 400) {
                this.util.genericMessageBoxXTranslate('Alert!', 'Please contact administration for help! (HS-BR-SP)');
              }
              else {
                this.api.handleApiError(error);
              }
            });
            return;
          }
          this.httpClient.post(this.global.baseUrl + `action/Workflow/${settings}`, ["IsActive", "=", true])
            .pipe(timeout(5000), takeUntil(this.destroy$))
            .subscribe(data => {
              this.lookupJson[index] = data;
            }, error => {
              if (error.status === 400) {
                this.util.genericMessageBoxXTranslate('Alert!', 'Please contact administration for help! (HS-BR-SP)');
              }
              else {
                this.api.handleApiError(error);
              }
            });
          return;
        case 'LOOKUPTABLE':
          this.httpClient.get(this.global.baseUrl + `lookup/table/${settings}`)
            .pipe(timeout(5000), takeUntil(this.destroy$))
            .subscribe((data) => {
              this.lookupJson[index] = data;
            }, error => {
              if (error.status === 400) {
                this.util.genericMessageBoxXTranslate('Alert!', 'Please contact administration for help! (HS-BR-TB)');
              }
              else {
                this.api.handleApiError(error);
              }
            });
          return;
        case 'LOOKUPDROPBOX':
          this.httpClient.get(this.global.baseUrl + `lookup/appdropbox/${settings}`)
            .pipe(timeout(5000), takeUntil(this.destroy$))
            .subscribe((data) => {
              this.lookupJson[index] = data;
            }, error => {
              if (error.status === 400) {
                this.util.genericMessageBoxXTranslate('Alert!', 'Please contact administration for help! (HS-BR-DB)');
              }
              else {
                this.api.handleApiError(error);
              }
            });
          return;
      }
    }

  }

  @ViewChild('upload')
  fileInput: ElementRef;
  file: any;
  extension: any;
  allowedExtension = ['jpeg', 'jpg', 'png', 'pdf', 'xlsx'];
  async onFileChange(e) {
    this.file = e.target.files[0];
    this.fileInput.nativeElement.value = '';

    this.extension = this.file.name.split('.')[1];
    if (!this.allowedExtension.includes(this.extension)) {
      this.util.genericMessageBoxXTranslate('Client Alert', `We only accept ${this.allowedExtension} files only`);
      return;
    }

    let description = this.getData.StageItemInfo;
    description = await this.util.promptDescription2(description);

    let extension = this.file.type.split('/')[1];
    let body = [
      {
        FileName: description,
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
        this.blobService.uploadFile(this.file, data[0].FileId + '.' + extension, this.containerName, this.sas);
        this.uploadFileName = this.file.name


        setTimeout(() => {
          this.apiCall();
          loading.dismiss();
          this.util.msgPop('Uploaded Successfully!', 'success', 1000, 'bottom');
        }, 1000);
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  completeButton() {
    this.completeTask('TaskComplete');
  }

  updateButton() {
    this.completeTask('TaskUpdate');
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

          setTimeout(() => {
            this.apiCall();
            loading.dismiss();
            this.util.msgPop('Delete Successfully!', 'success', 1000, 'bottom');
          }, 1000);
        });
    })
  }

  async completeTask(keyAction) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    
    if (this.getData.StageItemProgressBar === false) {
      this.progress = 100;
    }

    let tempDetail1 = null, tempDetail2 = null, tempDetail3 = null, tempDetail4 = null, tempDetail5 = null;

    if (this.fieldForm.get('Detail1').value) {
      (this.getData.StageItemDetail1LookupType) ? tempDetail1 = this.fieldForm.get('Detail1').value.Id : tempDetail1 = this.fieldForm.get('Detail1').value;
    }
    if (this.fieldForm.get('Detail2').value) {
      (this.getData.StageItemDetail2LookupType) ? tempDetail2 = this.fieldForm.get('Detail2').value.Id : tempDetail2 = this.fieldForm.get('Detail2').value;
    }
    if (this.fieldForm.get('Detail3').value) {
      (this.getData.StageItemDetail3LookupType) ? tempDetail3 = this.fieldForm.get('Detail3').value.Id : tempDetail3 = this.fieldForm.get('Detail3').value;
    }
    if (this.fieldForm.get('Detail4').value) {
      (this.getData.StageItemDetail4LookupType) ? tempDetail4 = this.fieldForm.get('Detail4').value.Id : tempDetail4 = this.fieldForm.get('Detail4').value;
    }
    if (this.fieldForm.get('Detail5').value) {
      (this.getData.StageItemDetail5LookupType) ? tempDetail5 = this.fieldForm.get('Detail5').value.Id : tempDetail5 = this.fieldForm.get('Detail5').value;
    }


    let data = [
      {
        Detail1: tempDetail1, Detail2: tempDetail2, Detail3: tempDetail3, Detail4: tempDetail4, Detail5: tempDetail5,
        Number1: this.fieldForm.get('Number1').value, Number2: this.fieldForm.get('Number2').value, Number3: this.fieldForm.get('Number3').value, Number4: this.fieldForm.get('Number4').value, Number5: this.fieldForm.get('Number5').value,
        Date1: this.fieldForm.get('Date1').value, Date2: this.fieldForm.get('Date2').value, Date3: this.fieldForm.get('Date3').value, Date4: this.fieldForm.get('Date4').value, Date5: this.fieldForm.get('Date5').value,
        Progress: this.progress,
      }
    ]

    this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${this.paramId}&KeyAction=${keyAction}`, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data[0].ReturnCode === 'OK') {
          if (keyAction === 'TaskComplete') {
            this.getData.IsComplete = true;
            this.getData.OnHoldUntil = null;
            this.global.isChanged = true;
            this.global.changedId = { TaskId: this.paramId, SalesId: this.getData.Sales };
            this.isReadOnly = true;

            if (this.getData.WorkflowStageItem === '9900B9C6-6EF9-4EE3-B62D-E8E6750302E1') {
              this.UpdateSales();
            }
          }
          this.util.msgPop('Successful!', 'success', 1000, 'bottom')
          loading.dismiss();
        }
        else {
          loading.dismiss();
          this.api.handleApiError2(data[0].ReturnCode)
        }
      }, error => {
        loading.dismiss();
        this.api.handleApiError(error);
      });
  }

  click = 0;
  currentItem;
  inputDefault(item, item2) {
    if (this.isReadOnly) {
      return;
    }

    this.click = this.click + 1;

    if (item !== this.currentItem) {
      this.click = 0;
    }

    if (this.click === 2) {
      this.click = 0;
      if (item2 === 'Number') {
        this.fieldForm.get(item).setValue(0);
      }
      else if (item2 === 'Detail') {
        this.fieldForm.get(item).setValue('N/A');
      }
      else if (item2 === 'Date') {
        this.fieldForm.get(item).setValue(new Date());
      }
    }

    this.currentItem = item;

    setTimeout(() => {
      this.click = 0
    }, 1500);
  }

  clear(item) {
    if (this.isReadOnly) {
      return;
    }

    this.fieldForm.get(item).setValue(null);
  }

  UpdateSales() {
    this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${this.getData.Sales}&KeyAction=UpdateSalesFigure`, this.sbtForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async data => {
        if (data[0].ReturnCode === 'OK') {
          this.apiCall();
        }
        else {
          this.api.handleApiError2(data[0].ReturnCode);
          return false;
        }
      });
  }

  disabledVerifyComplete() {
    // N/A
    if (this.getData.StageItemIsNA) {
      if (this.notApplicable){
        return false;
      }
    }

    // Attachment
    if (this.getData.StageItemUploadFile) {
      if (this.attachmentJson.length === 0) {
        return true;
      }
    }

    // Data Entry
    if (this.getData.StageItemDetail1 ||this.getData.StageItemDetail2 || this.getData.StageItemDetail3 || this.getData.StageItemDetail4 || this.getData.StageItemDetail5 ||
        this.getData.StageItemNumber1 || this.getData.StageItemNumber2 || this.getData.StageItemNumber3 || this.getData.StageItemNumber4 || this.getData.StageItemNumber5 || 
        this.getData.StageItemDate1 || this.getData.StageItemDate2 || this.getData.StageItemDate3 || this.getData.StageItemDate4 || this.getData.StageItemDate5) {
        if (!this.fieldForm.valid) {
          return true;
        }
      }

    return false;
  }

  disabledIsNA() {
    // Attachment
    if (this.getData.StageItemUploadFile) {
      if (this.attachmentJson.length !== 0) {
        return true;
      }
    }

    // Data Entry
    if (this.getData.StageItemDetail1 ||this.getData.StageItemDetail2 || this.getData.StageItemDetail3 || this.getData.StageItemDetail4 || this.getData.StageItemDetail5 ||
      this.getData.StageItemNumber1 || this.getData.StageItemNumber2 || this.getData.StageItemNumber3 || this.getData.StageItemNumber4 || this.getData.StageItemNumber5 || 
      this.getData.StageItemDate1 || this.getData.StageItemDate2 || this.getData.StageItemDate3 || this.getData.StageItemDate4 || this.getData.StageItemDate5) {
      if (!this.fieldForm.valid) {
        return true;
      }
    }

    if (this.isReadOnly) {
      return true;
    }
    return false;
  }
}
