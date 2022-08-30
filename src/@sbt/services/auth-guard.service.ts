import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Observable } from 'rxjs/internal/Observable';
import { Platform } from '@ionic/angular';

import { GlobalService } from 'src/app/app-config/global.service';
import { ApiService } from './api.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AuthGuardService implements CanActivate {

    constructor(
        private router: Router,
        private global: GlobalService) {
    }

    canActivate(): boolean {        
        if (this.global.accessToken) {                 
            return true;
        } else {
            this.router.navigate(['/login']);                        
            return false;
        }
    }
}



