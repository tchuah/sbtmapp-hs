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
import { Chart, registerables } from 'chart.js'; Chart.register(...registerables);
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-retail-analytics',
  templateUrl: './retail-analytics.page.html',
  styleUrls: ['./retail-analytics.page.scss'],
})
export class RetailAnalyticsPage implements OnInit, OnDestroy {

  // UI Control
  pageNumData = 0;
  pageShowNumData = 20;
  mode = 'PERCENTAGE'
  showReleased = false;

  // Data
  searchValue = '';
  searchRawValue = '';
  currentStatus: number = 0;
  currentRawStatus: number = 0;
  currentVerifyStatus: number = 0;
  currentRawVerifyStatus: number = 0;
  noData = true;
  dataJson; 
  dataJsonBranch; 
  chartLabel = []; 
  chartJson = []; 
  selectedStatus = '';

  // OTHERS
  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  //CHART
  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;
  doughnutChart: any;
  amountOfClicks = 0;

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
  }

  ngOnInit() {
    this.apiCall(this.mode);
  }

  ngAfterViewInit() {
    
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  doughnutChartMethod() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.chartLabel ,
        datasets: [{
          data: this.chartJson,
          backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(220, 20, 60, 0.2)',
            'rgba(128, 128, 128, 0.2)',
          ],
          hoverBackgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(220, 20, 60, 0.5)',
            'rgba(128, 128, 128, 0.5)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(220, 20, 60, 0.5)',
            'rgba(128, 128, 128, 0.5)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        interaction: {
          intersect: true,
          mode: 'point'
        },
        plugins: {
          legend: {
            onClick() {
            }
          },
          tooltip: {
            enabled: false
          },
          datalabels: {
            formatter(value, context) {

              if (value === 0) {
                return;
              }

              return value + '%'
            },
          }
        }
      },
      plugins: [ChartDataLabels, {
        id: 'customEventListner',
        afterEvent: (chart, evt, opts) => {
          if (evt.event.type === 'click') {
            if (chart.getActiveElements()[0]) {
              switch (chart.getActiveElements()[0].index) {
                case 0:
                  this.selectedStatus = this.chartLabel[0]; 
                  return;
                case 1:
                  this.selectedStatus = this.chartLabel[1]; 
                  return;
                case 2: 
                  this.selectedStatus = this.chartLabel[2]; 
                  return;
                case 3: 
                  this.selectedStatus = this.chartLabel[3]; 
                  return;
              }
            }
            else {
              this.selectedStatus = ''
              return;
            }
          }
        }
      }]
    });
  }

  doubleClick(){
    const ctx = document.getElementById('barCanvas')
  }


  modeChange() {
    (this.mode === 'PERCENTAGE') ? 'FIGURE' : 'PERCENTAGE';
  }

  async apiCall(subAction) {
    const loading = await this.loadingController.create({
      message: 'Please wait...'
    });
    await loading.present();
    this.api.httpSp(`Main/ACT_LookupAppSalesBoss?KeyAction=CurrentScenarioMaster`,  {SubAction: subAction})
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.dataJson = data[0];
          this.dataJsonBranch = data[0].Branch;
          this.chartJson = [data[0].ReleasedUnitPercentage, data[0].PendingUnitPercentage, data[0].CanceledUnitPercentage, data[0].ClosedUnitPercentage]
          this.chartLabel = ['Released', 'Pending', 'Canceled', 'Closed']

          if (this.dataJson.length < 1) {
            this.noData = false;
          } 
          else {
            this.noData = true;
          }

          setTimeout(() => {
            this.doughnutChartMethod();
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

  // ion refresh
  doRefresh(e) {
    this.doughnutChart.destroy();
    this.selectedStatus = '';
    this.apiCall(this.mode);
    e.target.complete();
  }

  refresh() {
    this.selectedStatus = '';
  }
}
