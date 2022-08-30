import { Injectable } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ActionSheetController, AlertController, NavController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

import { CallNumber } from '@ionic-native/call-number/ngx';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';
import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(
    private inAppBrowser: InAppBrowser,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private data: DataService,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
    private callNum: CallNumber,
    private launchNavigator: LaunchNavigator,
    private platform: Platform,
    private bcScanner: BarcodeScanner,
    private translate: TranslateService) { }

  goto(from: string, dest: string, id1?: string, id2?) {
    this.data.setData(from);
    if(id1 && id2 !== null && id2 !== undefined) {
      this.navController.navigateForward(`/${dest}/${id1}/${id2}`)
      return;
    }
    else if(id1 && !id2) {
      this.navController.navigateForward(`/${dest}/${id1}`)
      return;
    }

    this.navController.navigateForward(`/${dest}`)
  }

  async onHoldPrompt() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'On hold days: ',
      inputs: [
        {
          name: 'name4',
          type: 'date',
          min: '2017-03-01',
          max: '2018-01-12'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: () => {
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }

    // Prompt Description
    async promptDescription(): Promise<string> {
      let resolveFunction: (description: string) => void;
      const promise = new Promise<string>(resolve => {
        resolveFunction = resolve;
      });
      const alert = await this.alertCtrl.create({
        cssClass: 'alert-input-format',
        header: 'Description',
        inputs: [
          {
            name: 'Description',
            type: 'text',
            placeholder: 'Enter Description (Optional)'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: data => {
              // resolveFunction('');
              return;
            }
          }, {
            text: 'Ok',
            handler: data => {
              resolveFunction(data.Description);
            }
          }
        ]
      });
      await alert.present();
      return promise;
    }

    // Prompt Description
    async promptDescription2(fileName): Promise<string> {
      let resolveFunction: (description: string) => void;
      const promise = new Promise<string>(resolve => {
        resolveFunction = resolve;
      });
      const alert = await this.alertCtrl.create({
        cssClass: 'alert-input-format',
        header: 'Description',
        inputs: [
          {
            name: 'Description',
            type: 'text',
            value: fileName,
            placeholder: fileName
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: data => {
              // resolveFunction('');
              return;
            }
          }, {
            text: 'Ok',
            handler: data => {
              resolveFunction(data.Description);
            }
          }
        ]
      });
      await alert.present();
      return promise;
    }

  // Messages
  async genericMessageBox(title: string, message: string, cb?: () => void) {
    const msgbox = await this.alertCtrl.create({
      header: this.translate.instant(`CommonMessage.${title}`),
      message: this.translate.instant(`CommonMessage.${message}`),
      buttons: [{text: this.translate.instant('CommonMessage.OK'), handler: cb}]
    });
    await msgbox.present();
  }

  async genericMessageBoxXTranslate(title: string, message: string, cb?: () => void) {
    const msgbox = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: [{text: 'OK', handler: cb}]
    });
    await msgbox.present();
  }

  async createCustomerMessageBox(cb?: () => void, cb2?: () => void) {
    const msgbox = await this.alertCtrl.create({
      header: 'Alert',
      message: 'This registration number is not registered in our database!',
      buttons: [{text: 'CANCEL', handler: cb}, {text: 'ADD CUSTOMER', handler: cb2}]
    });
    await msgbox.present();
  }

  async msgboxConfirm(title: string, message: string, cb?: () => void, cb2?: () => void) {
    const msgbox  = await this.alertCtrl.create({
      header: this.translate.instant(`CommonMessage.${title}`),
      message: this.translate.instant(`CommonMessage.${message}`),
      buttons: [
        {text: "Cancel", role: 'cancel', cssClass: 'secondary', handler: cb2},
        {text: 'Ok', handler: cb}
      ]
    });
    await msgbox.present();
  }

  async msgboxConfirmXTranslate(title: string, message: string, cb?: () => void, cb2?: () => void) {
    const msgbox  = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: [
        {text: "Cancel", role: 'cancel', cssClass: 'secondary', handler: cb2},
        {text: 'Ok', handler: cb}
      ]
    });
    await msgbox.present();
  }

  async msgPop(msgParam: string, color = 'primary', popDuration = 3000, popPosition: 'bottom'|'top'|'middle' = 'bottom') {
    const toast = await this.toastCtrl.create({
      message: msgParam,
      duration: popDuration,
      position: popPosition,
      color: color
    });
    toast.present();
  }

  barcodeScanner(msg: string, inputField?: any) {
    this.bcScanner.scan({
      orientation: 'portrait',
      showFlipCameraButton: true,
      showTorchButton: true,
      resultDisplayDuration: 0,
      formats: 'QR_CODE,CODE_39,CODE_128',
      prompt: msg
    }).then( result => {
      if (result.text !== '') {
        inputField?.setValue(result.text);
      }
    }).catch( err => {
      this.genericMessageBox('DeviceError', 'BarcodeError');
    });
  }

  today() {
    let date = new Date();
    let isoDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    return isoDate.slice(0, -1) + '+08:00';
  }

  getDateOnly(date: string) {
    return date.substring(0,10);
  }

  getDateLocale(date: string) {
    return new Date(date).toLocaleString('en-my');
  }

  numberOnlyValidation(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  openDoc(url: string) {
    if (url) {
      if (this.platform.is('ios')) {
        this.inAppBrowser.create(url, '_blank', 'location=no');
        return;
      }
      if (this.platform.is('android')) {
        this.inAppBrowser.create(url, '_system', 'location=no');
        return;
      }
    } else {
      this.genericMessageBox('Info', 'ReportNotAvailable')
    }
  }

  ionSelectRefresh(control: any) {
    let value = control.value;
    control.reset();
    control.setValue(value);
  }

  dialPhone(phoneNumber: string) {
    if (phoneNumber) {
      let processedPhoneNumber = phoneNumber.replace(' ', '').replace('-', '');
      if (this.platform.is('hybrid')) {
        this.callNum.callNumber(processedPhoneNumber, true);
      } else {
        window.open(`tel:${processedPhoneNumber}`,'_self');
      }
    }
  }

  async getDirection(long: string, lat: string) {
    if (long && lat) {
      if (this.platform.is('hybrid')) {
        this.launchNavigator.navigate(`${lat}, ${long}`);
      } else {
        // Web Click to Navigation
        let actionLinks=[];

        actionLinks.push({
          text: 'Google Maps App',
          handler: () => {
            window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${long}`);
          }
        });
        
        actionLinks.push({
          text: 'Apple Maps App',
          handler: () => {
            window.open(`https://maps.apple.com/?q=${lat},${long}&navigate=yes&z=10`);
          }
        });

        actionLinks.push({
          text: 'Waze App',
          handler: () => {
            window.open(`https://waze.com/ul?ll=${lat},${long}&navigate=yes&z=10`);
          }
        });
        
        actionLinks.push({
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
           
          }
        });
        
        const actionSheet = await this.actionSheetController.create({
          header: 'Navigate',
          buttons: actionLinks
        });
        await actionSheet.present();
      }
    }
  }
}
