import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, TimeoutError } from 'rxjs';

import { locale as en } from './i18n/en';
import { locale as cn } from './i18n/cn'
import { locale as my } from './i18n/my'

import { ApiService } from 'src/@sbt/services/api.service';
import { UtilService } from 'src/@sbt/utils/util.service';
import { GlobalService } from 'src/app/app-config/global.service';
import { TranslationLoaderService } from 'src/@sbt/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { IonRouterOutlet, LoadingController, ModalController, NavController, Platform } from '@ionic/angular';
import { takeUntil, timeout } from 'rxjs/operators';
import { CompileShallowModuleMetadata } from '@angular/compiler';
import { QrcodeModalPage } from '../qrcode-modal/qrcode-modal.page';
import { HttpClient } from '@angular/common/http';
import { DataService } from 'src/@sbt/services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {


  // UI Control
  segmentValue = 'tasks';
  selectedStatus = {
    'OVERDUE': true,
    'ACTIVE': true,
    'INACTIVE': false,
    'ONHOLD': false,
    'COMPLETED': false,
  };

  showInfo: boolean = true;

  //Offline Purposes
  getData = [];

  // Data Control
  dashboardJson: any; // Json for Dashboard
  salesData: any; // Full data from API
  salesJson: any; //Sales Json to show
  salesJson2: any; //Sales Json to show
  tasksJson: any; //Task Json to show
  today = new Date();
  daysAfterToday = new Date();
  searchValue: string = '';
  selectedValue;

  // Others
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    private loadingController: LoadingController,
    private translate: TranslateService,
    private data: DataService,
    private api: ApiService,
    public util: UtilService,
    private modalController: ModalController,
    private httpClient: HttpClient,
    private routerOutlet: IonRouterOutlet,
    public global: GlobalService) {
    this.translationLoaderService.loadTranslations(en, cn, my);

    this.sbtForm = new FormGroup({
      'IsLoan': new FormControl(null, Validators.compose([Validators.required])),
      'IsTradeIn': new FormControl(null, Validators.compose([Validators.required])),
      'IsBodyWork': new FormControl(null, Validators.compose([Validators.required])),
    });
  }

  ngOnInit() {
    this.apiCall();
    this.today.setHours(0,0,0,0)
    this.daysAfterToday.setDate(this.daysAfterToday.getDate() + 1);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  public trackItem (index: number, item) {
    return item.trackId;
  }

  statusSelect(status: string) {
    switch (status) {
      case 'ACTIVE':
        this.selectedStatus['ACTIVE'] = !this.selectedStatus['ACTIVE']
        break;
      case 'INACTIVE':
        this.selectedStatus['INACTIVE'] = !this.selectedStatus['INACTIVE']
        break;
      case 'ONHOLD':
        this.selectedStatus['ONHOLD'] = !this.selectedStatus['ONHOLD']
        break;
      case 'COMPLETED':
        this.selectedStatus['COMPLETED'] = !this.selectedStatus['COMPLETED']
        break;
    }
  }

  //Slider
  closeSlide(slideItem: any) {
    slideItem.close();
  }

  buttonIcon(id, salesId, isComplete, isActive) {
    if (!isActive) {
      this.util.msgPop('This task is currently inactive!', 'danger', 1000, 'bottom')
      return;
    }

    if (isComplete) {
      this.util.msgboxConfirmXTranslate('Alert', 'Are you sure to undo this tasks?', () => {
        this.api.httpAction(`Main/ACT_FunctionAppSales?Id=${id}&KeyAction=TaskRevert`, {})
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            if (data[0].ReturnCode === 'OK') {
              this.util.msgPop('Sucessfully Undo', 'success', 1000, 'bottom');
              this.apiCall();
            }
            else {
              this.api.handleApiError2(data[0].ReturnCode);
            }
          }), error => {
            this.api.handleApiError(error);
          };
      });
    }
    else {
      this.util.goto('home', 'task-detail', id)
    }
  }

  buttonItem(id, isComplete, isActive) {
    if (!isActive) {
      this.util.msgPop('Task Currently Inactive', 'danger', 1000, 'bottom')
      return;
    }

    this.util.goto('home', 'task-detail', id)
  }

  async sliderSelect(taskId, salesId, taskStatus, item, slidingItem, dueDate?) {
    if (item === 'ONHOLD') {
      if (taskStatus === 8) {
        this.util.genericMessageBoxXTranslate('Alert', 'This task is already Completed!');
        return;
      }
      else if (taskStatus === 9) {
        this.util.genericMessageBoxXTranslate('Alert', 'This task is already Cancelled!');
        return;
      }
    }

    else if (item === 'POSTPONE') {
      if (taskStatus === 8) {
        this.util.genericMessageBoxXTranslate('Alert', 'This task is already Completed!');
        return;
      }
      else if (taskStatus === 9) {
        this.util.genericMessageBoxXTranslate('Alert', 'This task is already Cancelled!');
        return;
      }
    }

    slidingItem.close();
    this.openModal(taskId, salesId, item, dueDate);

  }

  async openModal(taskId, salesId, item, dueDate?) {
    const modal = await this.modalController.create({
      component: QrcodeModalPage,
      componentProps: {
        item: item,
        dueDate: dueDate,
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    modal.onDidDismiss()
      .then((data) => {
        let storedData = data.data.value;
        if (data.data.IsClose) {
          return;
        }

        if (item === 'ONHOLD') {
          this.api.httpAction(`Home/ACT_FunctionOnHold?Id=${taskId}&KeyAction=ONHOLD&JsonParam=${data.data.value}`, { value: this.selectedValue })
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
              if (data[0].ReturnCode === 'OK') {
                this.apiCall();
                // this.apiCall2({TaskId: taskId, SalesId: salesId});
              }

            }), async error => {
              if (error instanceof TimeoutError) {
                this.util.genericMessageBox('ClientAlert', 'ErrorTimeOut');
              }
              else {
                this.api.handleApiError(error);
              }
            };
        }
        else if (item === 'POSTPONE') {
          this.api.httpAction(`Home/ACT_FunctionOnHold?Id=${taskId}&KeyAction=POSTPONE&JsonParam=${data.data.value}`, { value: this.selectedValue })
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
              if (data[0].ReturnCode === 'OK') {
                this.apiCall2({TaskId: taskId, SalesId: salesId});
              }

            }), async error => {
              if (error instanceof TimeoutError) {
                this.util.genericMessageBox('ClientAlert', 'ErrorTimeOut');
              }
              else {
                this.api.handleApiError(error);
              }
            };
        }

      });

    return await modal.present();
  }

  // General Api call and refresh
  async apiCall() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpSp(`Main/ACT_LookupAppSales?KeyAction=GetActiveTask`, { SearchValue: this.searchValue }, 15000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          loading.dismiss();
          setTimeout(() => {
            this.dashboardJson = data;
            this.salesData = data[0].Sales;
            this.salesJson = this.salesData;
          }, 500);
        },
          async (error) => {
            console.log(error)
            loading.dismiss();
            if (error instanceof TimeoutError) {
              this.util.genericMessageBox('ClientAlert', 'ErrorTimeOut');
            } else {
              this.api.handleApiError(error);
            }
          });    
  }

  async apiCallSales() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

    this.api.httpSp(`Main/ACT_LookupAppSales?KeyAction=GetSalesByUser`, { SearchValue: this.searchValue })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          loading.dismiss();
          setTimeout(() => {
            this.salesJson2 = data;
          }, 200);
        }
      ), async (error) => {
        loading.dismiss();
        if (error instanceof TimeoutError) {
          this.util.genericMessageBox('ClientAlert', 'ErrorTimeOut');
        } else {
          this.api.handleApiError(error);
        }
      };
  }

  displayCondition(data) {
    /**
     * Overdue: All Due date > today
     * Active: All IsActive = true
     * Inactive: All IsActive = false
     * OnHold: OnHoldUntil
     * Completed: IsComplete = true
     */
    let date = new Date(data.DueDate)
    //OD + Active
    if (data < this.today && data.IsActive === true) {
      return 'task-isActive task-overdue'
    }
    //OD + InActive
    else if (data < this.today && data.IsActive === false) {
      return 'task-inActive task-overdue'
    }
    //Normal Active
    else if (data.IsActive === true) {
      return 'task-isActive'
    }
    //Normal InActive
    else if (data.IsActive === false) {
      return 'task-inActive'
    }
  }

  iconCondition(data) {
    /**
     * IsComplete
     * Onhold
     * Normal
     */

    if (data.IsComplete) {
      return 'checkmark-circle-outline';
    }
    else {
      return 'ellipse-outline'
    }
  }

  IsOverdue(date) {

    if (!date) {
      return false
    }
    let dueDate = new Date(date);
    
    if (dueDate.getTime() < this.today.getTime()) {
      return true;
    } 
    return false;
  }

  IsOnhold(date) {
    if (!date) {
      return false
    }

    let onHoldDate = new Date(date);
    
    if (onHoldDate.getTime() <= this.today.getTime()) {
      return true;
    }
    return false;
  }

  filterCondition(data) {
    let onHoldDate = new Date(data.OnHoldUntil);
    let completedOn = new Date(data.CompletedOn);

    let isCompleted = false;
    if (data.IsComplete || data.IsForceComplete) {
      isCompleted = true;
    }
    else {
      isCompleted = false;
    }

    // ALL Overdue and NOT Complete
    if (data.DueDate) {
      let dueDate = new Date(data.DueDate);
      if ((dueDate.getTime() <= this.today.getTime()) && !isCompleted) {
        return false;
      }
    }

    if ((this.selectedStatus.ACTIVE || this.selectedStatus.COMPLETED) && isCompleted) {
      if (completedOn >= this.today && completedOn < this.daysAfterToday) {
        return false;
      }
    }
    
    //ACTIVE: (data.IsActive && !isCompleted)
    //INACTIVE: (data.IsActive && !isCompleted)
    //ONHOLD: data.OnHoldUntil
    //COMPLETED: isCompleted
    
    // ONLY ACTIVE
    if (this.selectedStatus.ACTIVE && !this.selectedStatus.INACTIVE && !this.selectedStatus.ONHOLD && !this.selectedStatus.COMPLETED) {
      if (data.IsActive && !isCompleted) {
        return false;
      }
    }
    //ALL
    else if (this.selectedStatus.OVERDUE && this.selectedStatus.ACTIVE && this.selectedStatus.INACTIVE && this.selectedStatus.COMPLETED) {
      return false;
    }
    //ACTIVE INACTIVE
    else if (this.selectedStatus.ACTIVE && this.selectedStatus.INACTIVE && !this.selectedStatus.ONHOLD && !this.selectedStatus.COMPLETED) {
      if (!isCompleted) {
        return false;
      }
    }
    //ACTIVE ONHOLD
    else if (this.selectedStatus.ACTIVE && !this.selectedStatus.INACTIVE && this.selectedStatus.ONHOLD && !this.selectedStatus.COMPLETED) {
      if ((data.IsActive) && !isCompleted) {
        return false;
      }
    }
    //ACTIVE COMPLETED
    else if (this.selectedStatus.ACTIVE && !this.selectedStatus.INACTIVE && !this.selectedStatus.ONHOLD && this.selectedStatus.COMPLETED) {
      if (data.IsActive|| isCompleted) {
        return false;
      }
    }
    //ACTIVE INACTIVE ONHOLD
    else if (this.selectedStatus.ACTIVE && this.selectedStatus.INACTIVE && this.selectedStatus.ONHOLD && !this.selectedStatus.COMPLETED) {
      if (!isCompleted) {
        return false;
      }
    }
    //ACTIVE INACTIVE COMPLETED
    else if (this.selectedStatus.ACTIVE && this.selectedStatus.INACTIVE && !this.selectedStatus.ONHOLD && this.selectedStatus.COMPLETED) {
      if (isCompleted) {
        return false;
      }
    }
    //ACTIVE ONHOLD COMPLETED
    else if (this.selectedStatus.ACTIVE && !this.selectedStatus.INACTIVE && this.selectedStatus.ONHOLD && this.selectedStatus.COMPLETED) {
      if (data.IsActive || isCompleted) {
        return false;
      }
    }
    //INACTIVE
    else if (!this.selectedStatus.ACTIVE && this.selectedStatus.INACTIVE && !this.selectedStatus.ONHOLD && !this.selectedStatus.COMPLETED) {
      if (!data.IsActive && !isCompleted) {
        return false;
      }
    }
    //INACTIVE ONHOLD
    else if (!this.selectedStatus.ACTIVE && this.selectedStatus.INACTIVE && this.selectedStatus.ONHOLD && !this.selectedStatus.COMPLETED) {
      if (!data.IsActive && !isCompleted) {
        return false;
      }
    }
    //INACTIVE COMPLETED
    else if (!this.selectedStatus.ACTIVE && this.selectedStatus.INACTIVE && !this.selectedStatus.ONHOLD && this.selectedStatus.COMPLETED) {
      if (!data.IsActive || isCompleted) {
        return false;
      }
    }
    //INACTIVE ONHOLD COMPLETED
    else if (!this.selectedStatus.ACTIVE && this.selectedStatus.INACTIVE && this.selectedStatus.ONHOLD && this.selectedStatus.COMPLETED) {
      if (!data.IsActive || isCompleted) {
        return false;
      }
    }
    //ONHOLD
    else if (!this.selectedStatus.ACTIVE && !this.selectedStatus.INACTIVE && this.selectedStatus.ONHOLD && !this.selectedStatus.COMPLETED) {
      if (!isCompleted) {
        return false;
      }
    }
    //ONHOLD COMPLETED
    else if (!this.selectedStatus.ACTIVE && !this.selectedStatus.INACTIVE && this.selectedStatus.ONHOLD && this.selectedStatus.COMPLETED) {
      if (isCompleted) {
        return false;
      }
    }
    //COMPLETED
    else if (!this.selectedStatus.ACTIVE && !this.selectedStatus.INACTIVE && !this.selectedStatus.ONHOLD && this.selectedStatus.COMPLETED) {
      if (isCompleted) {
        return false;
      }
    }
    return true;
  }
  
  // ion refresh
  doRefresh(e) {

    if (this.segmentValue === 'tasks') {
      this.apiCall();
    }
    e.target.complete();
  }

  searchBarChange(e) {
    this.searchValue = e.detail.value;
  }


  search() {
    if (this.segmentValue === 'tasks') {
      this.apiCall();
      this.selectedStatus = {
        'OVERDUE': true,
        'ACTIVE': true,
        'INACTIVE': false,
        'ONHOLD': false,
        'COMPLETED': false,
      };
    }
  }

  colorDisplay(date) {
    if (!date) {
      return;
    }
    let due = new Date(date);
    if (due < this.today) {
      return 'danger'
    }
  }

  // Api call to replace offline Data
  async apiCall2(item) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();

      this.api.httpSp(`Main/ACT_LookupAppSales?KeyAction=GetActiveTask`, { SearchValue: this.searchValue }, 15000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          this.getData = data;
          setTimeout(() => {
            this.dashboardJson[0].ActiveNum = this.getData[0].ActiveNum
            this.dashboardJson[0].InActiveNum = this.getData[0].InActiveNum
            this.dashboardJson[0].OnHoldNum = this.getData[0].OnHoldNum
            this.dashboardJson[0].OverDueNum = this.getData[0].OverDueNum
            this.dashboardJson[0].CompletedNum = this.getData[0].CompletedNum
            this.dashboardJson[0].Sales.filter(f => f.Id === item.SalesId)[0].SalesTask = this.getData[0].Sales.filter(f => f.Id === item.SalesId)[0].SalesTask
            this.dashboardJson[0].Sales.filter(f => f.Id === item.SalesId)[0].Progress = this.getData[0].Sales.filter(f => f.Id === item.SalesId)[0].Progress
          }, 200);
          loading.dismiss();
        },
          async (error) => {
            loading.dismiss();
            if (error instanceof TimeoutError) {
              this.util.genericMessageBox('ClientAlert', 'ErrorTimeOut');
            } else {
              this.api.handleApiError(error);
            }
          }); 
  }

  ionViewWillEnter() {
    if (this.global.isChanged) {
      this.global.isChanged = false;
      setTimeout(() => {
        this.apiCall()
        // this.apiCall2({SalesId: this.global.changedId.SalesId, TaskId: this.global.changedId.TaskId})
      });
    }
  }
}
