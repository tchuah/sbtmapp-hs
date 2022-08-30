import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

import { locale as en } from './i18n/en';
import { locale as cn } from './i18n/cn'
import { locale as my } from './i18n/my'

import { ApiService } from 'src/@sbt/services/api.service';
import { UtilService } from 'src/@sbt/utils/util.service';
import { GlobalService } from 'src/app/app-config/global.service';
import { TranslationLoaderService } from 'src/@sbt/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { ModalController, NavController, Platform } from '@ionic/angular';

import { Md5 } from 'ts-md5/dist/md5';
import { ActivatedRoute } from '@angular/router';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { AzureBlobStorageService } from 'src/@sbt/services/azure-blob-storage.service';
import { base64StringToBlob, dataURLToBlob } from 'blob-util';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-qrcode-modal',
  templateUrl: './qrcode-modal.page.html',
  styleUrls: ['./qrcode-modal.page.scss'],
})
export class QrcodeModalPage implements OnInit, OnDestroy {

  selectedValue = '1';
  extendedDate;
  destroy$: Subject<boolean> = new Subject<boolean>();

  item;
  dueDate;

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    private translate: TranslateService,
    private modalController: ModalController,
    private api: ApiService,
    private fb: FormBuilder,
    public util: UtilService,
    public global: GlobalService) {
    this.translationLoaderService.loadTranslations(en, cn, my);
  }

  ngOnInit() {
    if(this.item === 'POSTPONE') {
      this.extendedDate = this.addDays(1, new Date(this.dueDate))
    }
    else {
      if (this.dueDate) {
        this.extendedDate = this.addDays(1, new Date(this.dueDate))
      }
      else {
        this.extendedDate = this.addDays(1, new Date())
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  dateChange(e) {
    this.selectedValue = e.detail.value;

    if(this.item === 'POSTPONE') {
      this.extendedDate = this.addDays(parseInt(this.selectedValue), new Date(this.dueDate))
    }
    else {
      if (this.dueDate) {
        this.extendedDate = this.addDays(parseInt(this.selectedValue), new Date(this.dueDate))
      }
      else {
        this.extendedDate = this.addDays(parseInt(this.selectedValue), new Date())
      }
      
    }
  }

  addDays(numOfDays: number, date: Date) {
    date.setDate(date.getDate() + numOfDays);
    return date;
  }

  dismissModal(isClose) {
    this.modalController.dismiss({
      'dismissed': true,
      'IsClose': isClose,
      'value': this.selectedValue
    });
  }
}
