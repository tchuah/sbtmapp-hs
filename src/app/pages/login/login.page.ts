import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { NavController, Platform } from '@ionic/angular';

import { Md5 } from 'ts-md5/dist/md5';
import { ActivatedRoute } from '@angular/router';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { AzureBlobStorageService } from 'src/@sbt/services/azure-blob-storage.service';
import { base64StringToBlob } from 'blob-util';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  // UI Control
  showPassword = false;
  currentPage = 1;

  destroy$: Subject<boolean> = new Subject<boolean>();
  sbtForm: FormGroup;

  constructor(
    private translationLoaderService: TranslationLoaderService,
    private navController: NavController,
    private translate: TranslateService,
    private api: ApiService,
    private appService: AppService,
    public util: UtilService,
    public blobService: AzureBlobStorageService,
    public global: GlobalService) {
    this.translationLoaderService.loadTranslations(en, cn, my);

    this.sbtForm = new FormGroup({
      'Email': new FormControl(null, Validators.compose([Validators.required])),
      'Password': new FormControl(null, Validators.compose([Validators.required, Validators.pattern('^.{8,}$')]))
    });
  }

  ngOnInit(): void {
    // this.test();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  login() {
    this.api.httpPostSecurity('authenticate', this.sbtForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.global.accessToken = data[0].AccessToken;
        this.global.UserJson = data[0].UserJson;
        this.global.userListJson = data[0].UserListJson;
        this.global.groupListJson = data[0].GroupListJson;
        this.global.role = data[0].UserJson[0].Role;
        this.global.userId = data[0].UserJson[0].Id;
        this.global.name = data[0].UserJson[0].Info;
        this.global.department = data[0].UserJson[0].Department;
        this.global.branch = data[0].UserJson[0].Branch;
        this.global.IsRetail = data[0].UserJson[0].IsRetail;
        this.global.RetailBranch = data[0].UserJson[0].RetailBranch;

        let retVal = {
          Role: this.global.role,
          IsRetail: this.global.IsRetail,
          RetailBranch: this.global.RetailBranch
        }

        this.appService.setRoleSubject(retVal);

        this.navController.navigateRoot('home');
      },
        error => {
          if (error.status === 401) {
            this.util.msgPop('Invalid email or password!', 'danger', 2000);
            return;
          }
          this.util.msgPop('Cannot connect to the server, please check your internet connection!', 'danger', 2000);
        });
        // this.test();
   }

  test() {
    // let data = [
    //   {
    //     UserName: 'Han A',
    //     Role: 'STAFF',
    //     Email: '001',
    //     Password: '123',
    //     MobilePhone: '012-1111111',
    //     ValidFrom: '2022/06/29',
    //     ValidTo: '2999/12/31',
    //     DefaultLanguage: 'English',
    //     IsActive: 1,
    //     Entrance: 1,
    //     Souvenir: 1,
    //     Meal: 1,
    //     Activity: 0
    //   },
    //   {
    //     UserName: "Sausage Man",
    //     Role: "STAFF",
    //     Email: "sausage@gmail.com",
    //     Password: "123",
    //     MobilePhone: "012-34567",
    //     ValidFrom: "2022/06/17",
    //     ValidTo: "2022/08/29",
    //     DefaultLanguage: "English",
    //     IsActive: 1,
    //     Entrance: 1,
    //     Souvenir: 1,
    //     Meal: 1,
    //     Activity: 0
    //   },
    // ]

    let data = [
      {
          "Error": 0,
          "ErrorDetail": [],
          "Seq": 3,
          "UserName": "TEST7",
          "Role": "STAFF",
          "Email": "test7@gmail.com",
          "Password": "@#$123PoL",
          "MobilePhone": "01121415922",
          "ValidFrom": "2022/08/01",
          "ValidTo": "2022/12/11",
          "DefaultLanguage": "English",
          "IsActive": 1,
          "Entrance": 1,
          "Souvenir": 1,
          "Meal": 1,
          "Activity": 0
      }
  ]
    this.api.httpPostSecurity(`changeuserpassword?KeyAction=IM50-BB`, data)
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          console.log(data)
        },
          async (error) => {
            if (error instanceof TimeoutError) {
              this.util.msgPop('The internet connection is very slow, do you want to try again?', 'danger', 2000);
            }
          });
  }
}
