import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen'
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from 'src/app/app-config/global.service';
import { TranslationLoaderService } from 'src/@sbt/services/translation-loader.service';
import { locale as en } from 'src/app/navigation/en'
import { locale as cn } from 'src/app/navigation/cn'
import { locale as my } from 'src/app/navigation/my'
import { Subject } from 'rxjs';
import { IMenu } from '../@sbt/services/system.model';
import { takeUntil } from 'rxjs/operators';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  role: string;

  public menus: IMenu[] = [
    // {
    //   id: 'home',
    //   title: 'Home',
    //   translate: 'Menu.Home',
    //   type: 'item',
    //   icon: 'home',
    //   url: '/home'
    // },
    // {
    //   id: 'NewSales',
    //   title: 'NewSales',
    //   translate: 'Menu.NewSales',
    //   type: 'item',
    //   icon: 'add',
    //   url: '/new-sales'
    // },
    // {
    //   id: 'NewCustomer',
    //   title: 'NewCustomer',
    //   translate: 'Menu.NewCustomer',
    //   type: 'item',
    //   icon: 'add',
    //   url: '/new-customers'
    // },
    // {
    //   id: 'Stock',
    //   title: 'Stock',
    //   translate: 'Menu.Stock',
    //   type: 'item',
    //   icon: 'podium',
    //   url: '/stock'
    // },
  ];

  public appPages = [
    { title: 'Menu.FollowUp', url: '/follow-up', icon: 'icon-calendar' },
    { title: 'Menu.Query', url: '/query', icon: 'icon-comment-account' },
    { title: 'Menu.Serving', url: '/serving', icon: ' icon-qrcode' },
    { title: 'Menu.TestResult', url: '/test-result', icon: ' icon-qrcode' },
    { title: 'Menu.Logout', url: '/login', icon: 'icon-logout' }
  ];
  constructor(
    private translate: TranslateService,
    public global: GlobalService,
    private translationLoaderService: TranslationLoaderService,
    private appService: AppService,
    private navController: NavController) {
    this.translationLoaderService.loadTranslations(en, cn, my);
    this.translate.use('en');
    setTimeout(() => {
      this.translate.setDefaultLang('en')
    });
    this.initializeApp();

  }

  ngOnInit() {
    this.appService.getRoleSubject().pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        switch (value.Role) {
          case 'USER':
            this.menus = [{
              id: 'home',
              title: 'Home',
              translate: 'Menu.Home',
              type: 'item',
              icon: 'home',
              url: '/home'
            },
            {
              id: 'NewCustomer',
              title: 'NewCustomer',
              translate: 'Menu.NewCustomer',
              type: 'item',
              icon: 'add',
              url: '/new-customers'
            },
            {
              id: 'NewSales',
              title: 'NewSales',
              translate: 'Menu.NewSales',
              type: 'item',
              icon: 'add',
              url: '/new-sales'
            },
            {
              id: 'SalesUnapproved',
              title: 'SalesUnapproved ',
              translate: 'Menu.SalesUnapproved',
              type: 'item',
              icon: 'analytics',
              url: '/sales-unapproved'
            },
            {
              id: 'SalesMaster3', 
              title: 'SalesMaster3 ',
              translate: 'Menu.SalesMaster3',
              type: 'item',
              icon: 'pricetag',
              url: '/sales-master3'
            }]
            break;
  
          case 'BRANCH-MANAGER':
            this.menus = [{
              id: 'home',
              title: 'Home',
              translate: 'Menu.Home',
              type: 'item',
              icon: 'home',
              url: '/home'
            },
            {
              id: 'NewSales',
              title: 'NewSales',
              translate: 'Menu.NewSales',
              type: 'item',
              icon: 'add',
              url: '/new-sales'
            },
            {
              id: 'NewCustomer',
              title: 'NewCustomer',
              translate: 'Menu.NewCustomer',
              type: 'item',
              icon: 'add',
              url: '/new-customers'
            },
            {
              id: 'Stock',
              title: 'Stock',
              translate: 'Menu.Stock',
              type: 'item',
              icon: 'podium',
              url: '/stock'
            }];
            return;
  
          case 'BOSS':
            this.menus = [{
              id: 'home',
              title: 'Home',
              translate: 'Menu.Home',
              type: 'item',
              icon: 'home',
              url: '/home'
            },
            {
              id: 'SalesScenario',
              title: 'SalesScenario',
              translate: 'Menu.SalesScenario',
              type: 'item',
              icon: 'pie-chart',
              url: '/sales-scenario'
            },
            {
              id: 'SalesMaster4',
              title: 'SalesMaster4',
              translate: 'Menu.SalesMaster',
              type: 'item',
              icon: 'document',
              url: '/sales-master4'
            },
            {
              id: 'Stock',
              title: 'Stock',
              translate: 'Menu.Stock',
              type: 'item',
              icon: 'podium',
              url: '/stock'
            }];
            break;
  
          case 'DEVELOPER':
            this.menus = [{
              id: 'home',
              title: 'Home',
              translate: 'Menu.Home',
              type: 'item',
              icon: 'home',
              url: '/home'
            },
            {
              id: 'NewSales',
              title: 'NewSales',
              translate: 'Menu.NewSales',
              type: 'item',
              icon: 'add',
              url: '/new-sales'
            },
            {
              id: 'NewCustomer',
              title: 'NewCustomer',
              translate: 'Menu.NewCustomer',
              type: 'item',
              icon: 'add',
              url: '/new-customers'
            },
            {
              id: 'SalesUnapproved',
              title: 'SalesUnapproved ',
              translate: 'Menu.SalesUnapproved',
              type: 'item',
              icon: 'analytics',
              url: '/sales-unapproved'
            },
            {
              id: 'SalesMaster', 
              title: 'SalesMaster',
              translate: 'Menu.SalesMaster',
              type: 'item',
              icon: 'reader',
              url: '/sales-master'
            },
            {
              id: 'SalesMaster2', 
              title: 'SalesMaster2 ',
              translate: 'Menu.SalesMaster',
              type: 'item',
              icon: 'wallet',
              url: '/sales-master2'
            },
            {
              id: 'SalesMaster3', 
              title: 'SalesMaster3 ',
              translate: 'Menu.SalesMaster3',
              type: 'item',
              icon: 'pricetag',
              url: '/sales-master3'
            },
            {
              id: 'SalesMaster4',
              title: 'SalesMaster4',
              translate: 'Menu.SalesMaster',
              type: 'item',
              icon: 'document',
              url: '/sales-master4'
            },
            {
              id: 'SalesScenario',
              title: 'SalesScenario',
              translate: 'Menu.SalesScenario',
              type: 'item',
              icon: 'pie-chart',
              url: '/sales-scenario'
            },
            {
              id: 'Stock',
              title: 'Stock',
              translate: 'Menu.Stock',
              type: 'item',
              icon: 'podium',
              url: '/stock'
            }];
            break;
  
          case 'ALL':
          this.menus = [{
            id: 'home',
            title: 'Home',
            translate: 'Menu.Home',
            type: 'item',
            icon: 'home',
            url: '/home'
          },
          {
            id: 'NewSales',
            title: 'NewSales',
            translate: 'Menu.NewSales',
            type: 'item',
            icon: 'add',
            url: '/new-sales'
          },
          {
            id: 'NewCustomer',
            title: 'NewCustomer',
            translate: 'Menu.NewCustomer',
            type: 'item',
            icon: 'add',
            url: '/new-customers'
          },
          {
            id: 'SalesUnapproved',
            title: 'SalesUnapproved ',
            translate: 'Menu.SalesUnapproved',
            type: 'item',
            icon: 'analytics',
            url: '/sales-unapproved'
          },
          {
            id: 'SalesMaster3', 
            title: 'SalesMaster3 ',
            translate: 'Menu.SalesMaster3',
            type: 'item',
            icon: 'pricetag',
            url: '/sales-master3'
          },
          {
            id: 'SalesMaster', 
            title: 'SalesMaster',
            translate: 'Menu.SalesMaster',
            type: 'item',
            icon: 'reader',
            url: '/sales-master'
          },
          {
            id: 'SalesMaster2', 
            title: 'SalesMaster2 ',
            translate: 'Menu.SalesMaster',
            type: 'item',
            icon: 'wallet',
            url: '/sales-master2'
          }];
          break;
  
          case 'FINANCE':
            this.menus = [{
              id: 'home',
              title: 'Home',
              translate: 'Menu.Home',
              type: 'item',
              icon: 'home',
              url: '/home'
            },
            {
              id: 'SalesMaster2', 
              title: 'SalesMaster2 ',
              translate: 'Menu.SalesMaster',
              type: 'item',
              icon: 'wallet',
              url: '/sales-master2'
            }];
            break;
  
          case 'SALES-ADMIN':
            this.menus = [{
              id: 'home',
              title: 'Home',
              translate: 'Menu.Home',
              type: 'item',
              icon: 'home',
              url: '/home'
            },
            {
              id: 'SalesMaster1', 
              title: 'SalesMaster1',
              translate: 'Menu.SalesMaster',
              type: 'item',
              icon: 'reader',
              url: '/sales-master'
            }];
            break;
  
          default:
            this.menus = [
              {
                id: 'home',
                title: 'Home',
                translate: 'Menu.Home',
                type: 'item',
                icon: 'home',
                url: '/home'
              },
            ];
            break;
        }

        // if (value.IsRetail === 1) {
        //   this.menus.push(
        //     {
        //       id: 'RetailAnalytics',
        //       title: 'RetailAnalytics',
        //       translate: 'Menu.RetailAnalytics',
        //       type: 'item',
        //       icon: 'pie-chart',
        //       url: '/retail-analytics'
        //     }
        //   )
        // }
      }
    });
  }

  initializeApp() {
    SplashScreen.hide();
  }

  openPage(pageUrl: string) {
    this.navController.navigateRoot(pageUrl);
  }

  logout(): void {
    this.global.nickName = '';
    this.global.name = '';
    this.global.defaultLanguage = '';
    this.global.email = '';
    this.global.mobilePhone = '';
    this.global.accessToken = '';

    this.global.menuJson = [];
    this.global.userListJson = [];
    this.navController.navigateRoot(['/login']);
  }

}