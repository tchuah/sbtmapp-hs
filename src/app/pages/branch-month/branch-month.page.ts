import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { Subject, TimeoutError } from 'rxjs';

import { locale as en } from './i18n/en';
import { locale as cn } from './i18n/cn'
import { locale as my } from './i18n/my'

import { ApiService } from 'src/@sbt/services/api.service';
import { UtilService } from 'src/@sbt/utils/util.service';
import { GlobalService } from 'src/app/app-config/global.service';
import { TranslationLoaderService } from 'src/@sbt/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingController, NavController} from '@ionic/angular';
import { AzureBlobStorageService } from 'src/@sbt/services/azure-blob-storage.service';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Chart, registerables } from 'chart.js'; Chart.register(...registerables);
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-branch-month',
  templateUrl: './branch-month.page.html',
  styleUrls: ['./branch-month.page.scss'],
})
export class BranchMonthPage implements OnInit, OnDestroy {

  // UI Control
  pageNumData = 0;
  pageShowNumData = 20;
  from = '';

  // Data
  param;
  branch;
  BranchName;
  searchValue = '';
  searchRawValue = '';
  currentStatus: number = 0;
  currentRawStatus: number = 0;
  currentVerifyStatus: number = 0;
  currentRawVerifyStatus: number = 0;
  noData = true;
  data;
  dataJson = []; 
  dataJson2 = []; 
  chartLabel = []; 
  chartJson = []; 
  selectedStatus = -1;

  // OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

    //CHART
    @ViewChild('barCanvas') private barCanvas: ElementRef;
    barChart: any;

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    private route: ActivatedRoute,
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
    this.route.params.subscribe(param => {
      if (param) {
        this.branch = param['branch'];     
        this.currentStatus = this.currentRawStatus; 
      }
    });  
    this.apiCall();
  }

  ngAfterViewInit() {
    
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  barChartMethod() {
    // Now we need to supply a Chart element reference with an object that defines the type of chart we want to use, and the type of data we want to display.
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.chartLabel,
        datasets: [{
          data: this.chartJson,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(75, 192, 192, 0.2)'
          ],
          hoverBackgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          },
          datalabels: {
            formatter(value, context) {
              if (value === 0) {
                return '';
              }
              return value
            },
          }
        },
        indexAxis: 'y',
        scales: {
          y: {
              beginAtZero: true
          },
        },
        events: ['mouseenter', 'click', 'touchstart', 'touchmove','dblclick', ],
      },
      plugins: [ChartDataLabels, {
        id: 'customEventListner',
        afterEvent: (chart, evt, opts) => {
          if (evt.event.type === 'click') {
            
            if (chart.getActiveElements()[0]) {
              switch (chart.getActiveElements()[0].index) {
                case 0:
                  this.dataJson2 = this.dataJson.filter(f => f.MonthStatus === 'Over3Month');
                  return;
                case 1:
                  this.dataJson2 = this.dataJson.filter(f => f.MonthStatus === 'In2to3Month');
                  return;
                case 2: 
                  this.dataJson2 = this.dataJson.filter(f => f.MonthStatus === 'In1to2Month');
                  return;
                case 3: 
                  this.dataJson2 = this.dataJson.filter(f => f.MonthStatus === 'In1Month');
                  return;
              }
            }
            else {
              this.dataJson2 = this.dataJson;
              return;
            }
          }
        }
      }]
    });
  }

  async apiCall() {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.api.httpSp(`Main/ACT_LookupAppSalesBoss?KeyAction=SalesByMonth`,  {BranchId: this.branch})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.chartJson = [data[0].BranchOver3Month, data[0].BranchIn2to3Month, data[0].BranchIn1to2Month, data[0].BranchIn1Month]
          this.chartLabel = ['> 3 Month', '2-3 Month', '1-2 Month', '< 1 Month']
          this.data = data[0];
          this.dataJson = data[0].Sales;
          this.dataJson2 = this.dataJson;
          console.log(this.dataJson2)
          if (this.dataJson.length < 1) {
            this.noData = false;
          } 
          else {
            this.noData = true;
          }

          setTimeout(() => {
            this.barChartMethod();
          });
        }, async (error) => {
        if (error instanceof TimeoutError) {
          this.util.genericMessageBox('ClientAlert', 'ErrorTimeOutRetry');
        } else {
          this.api.handleApiError(error);
        }
      });

    loading.dismiss();
  }

  selectStatus(e) {
    this.currentRawStatus = e.detail.value;
  }

  search(){
    this.currentStatus = this.currentRawStatus;
    this.apiCall();
  }

  // ion refresh
  doRefresh(e) {
    this.barChart.destroy();
    setTimeout(() => {
      this.apiCall();
    });
    e.target.complete();
  }

  colorSettings(status) {
    switch(status) {
      case 'Over3Month':
        return 'rgba(255, 99, 132, 0.5)';
      case 'In2to3Month':
        return 'rgba(255, 206, 86, 0.5)';
      case 'In1to2Month':
        return 'rgba(54, 162, 235, 0.5)';
      case 'In1Month':
        return 'rgba(75, 192, 192, 0.5)';
    }
  }
}
