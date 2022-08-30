import { Injectable } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  environment = 'server';
  public projectName: string = 'Hong Seng';

  barcodeFormat: BarcodeFormat[] = [
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_128,
    BarcodeFormat.QR_CODE
  ];

  baseUrl: string;
  fileUrl: string;
  reportUrl: string;
  payUrl: string;

  unitPriceFormat = '#,##0.0000';
  unitPriceGridFormat = {type: 'fixedPoint', precision: 4};
  subtotalFormat = '#,##0.00';
  subtotalGridFormat = {type: 'fixedPoint', precision: 2};
  quantityFormat = '#,##0.##';
  quantityGridFormat = {};
  dateFormat = 'dd MMM yyyy hh:mm a';

  public nickName;
  public name;
  public defaultLanguage = 'en';
  public email: string;
  public tenant: string;
  public mobilePhone: string;
  public accessToken = '';
  public role: string;
  public appUserStatus: any;
  public supportNumber: string;
  public banners: any;
  public appVersion = 'Version 1.1.1';
  public eventId: string;
  public eventMode: string;
  public handledBy: string;
  public userId: string;
  public department = '';
  public branch = '';
  public lookupJson;
  public DepositPercentage = 10;

  public UserJson = [];
  public menuJson = [];
  public userListJson = [];
  public groupListJson = [];
  public IsRetail = '';
  public RetailBranch = [];
  public isGetIc = false;
  public isChanged = false;
  public changedId = {TaskId: '', SalesId: ''};
  public sas = '?sp=racwdli&st=2022-08-05T04:27:59Z&se=2999-08-05T12:27:59Z&spr=https&sv=2021-06-08&sr=c&sig=6bx9iAO8mpUaIm5euS%2FiuD9x7TEmeWvnV9%2B%2BOJO8jps%3D'

  public stateDs = [{"Id":"MY-JOHOR","Info":"JOHOR"},{"Id":"MY-KEDAH","Info":"KEDAH"},{"Id":"MY-KELANTAN","Info":"KELANTAN"},{"Id":"MY-MALACCA","Info":"MALACCA"},{"Id":"MY-NSEMBILAN","Info":"NEGERI SEMBILAN"},{"Id":"MY-PAHANG","Info":"PAHANG"},{"Id":"MY-PERAK","Info":"PERAK"},{"Id":"MY-PERLIS","Info":"PERLIS"},{"Id":"MY-PENANG","Info":"PULAU PINANG"},{"Id":"MY-SABAH","Info":"SABAH"},{"Id":"MY-SARAWAK","Info":"SARAWAK"},{"Id":"MY-SELANGOR","Info":"SELANGOR"},{"Id":"MY-TERENGGANU","Info":"TERENGGANU"}]
  
  public saleStatus = [
    {Id: -99, Info: '(ALL)'},
    {Id: 0, Info: 'NEW'},
    {Id: 1, Info: 'RELEASE'},
    {Id: 8, Info: 'CLOSE'},
    {Id: 9, Info: 'CANCEL'},
  ]

  public saleMasterBossStatus = [
    {Id: 1, Info: 'RELEASE'},
    {Id: 0, Info: 'PENDING'},
    {Id: 8, Info: 'CLOSE'},
    {Id: 9, Info: 'CANCEL'},
  ]

  public taskStatus = [
    {Id: 1, Info: 'PENDING'},
    {Id: 2, Info: 'ONHOLD'},
    {Id: 8, Info: 'COMPLETED'},
    {Id: 9, Info: 'CANCEL'},
  ]

  public stockStatus = [
    {Id: 1, Info: 'NEW'},
    {Id: 2, Info: 'ALLOCATED'},
    {Id: 3, Info: 'CLOSED'},
    {Id: 9, Info: 'CANCEL'},
  ]

  public stockModifiedStatus = [
    {Id: 1, Info: 'ACTIVE'},
    {Id: 3, Info: 'CLOSED'},
    {Id: 9, Info: 'CANCEL'},
  ]

  public stockActionStatus = [
    {Id: 1, Info: 'SYNC IN'},
    {Id: 2, Info: 'ALLOCATED'},
    {Id: 3, Info: 'UNALLOCATED'},
    {Id: 9, Info: 'CLOSE'},
  ]

  public amendSaleStatus = [
    {Id: 1, Info: 'RELEASE'},
    {Id: 2, Info: 'TASK UPDATE'},
    {Id: 3, Info: 'AMEND'},
    {Id: 4, Info: 'UUNASSIGN CHASSIS'},
    {Id: 5, Info: 'REVERT'},
    {Id: 6, Info: 'CLOSE'},
    {Id: 7, Info: 'REOPEN'},
    {Id: 9, Info: 'CANCEL'}
  ]

  public SalesMasterStatusOG = [
    {Id: 0, Info: 'NEW'},
    {Id: 1, Info: 'PARTIAL'},
    {Id: 8, Info: 'CLOSE'},
    {Id: 9, Info: 'CANCEL'},
  ]

  public SalesMasterStatus = [
    {Id: -99, Info: '(ALL)'},
    {Id: 0, Info: 'NEW'},
    {Id: 1, Info: 'PARTIAL'},
    {Id: -98, Info: 'NEW + PARTIAL'},
    {Id: 8, Info: 'CLOSE'},
    {Id: 9, Info: 'CANCEL'},
  ]

  public SalesMaster2Status = [
    {Id: -99, Info: '(ALL)'},
    {Id: -98, Info: 'NEW + PARTIAL'},
    {Id: 0, Info: 'NEW'},
    {Id: 1, Info: 'PARTIAL'},
    {Id: 8, Info: 'CLOSE'},
    {Id: 9, Info: 'CANCEL'},
  ]

  public SalesMaster3Status = [
    {Id: -99, Info: '(ALL)'},
    {Id: 0, Info: 'NEW'},
    {Id: 1, Info: 'PARTIAL'},
    {Id: 8, Info: 'CLOSE'},
    {Id: 9, Info: 'CANCEL'},
  ]

  public SalesMasterVerifyStatus = [
    {Id: 0, Info: 'PENDING VERIFY'},
    {Id: 1, Info: 'ALREADY VERIFY'}
  ]

  getSaleMasterStatusInfo(statusId) {
    if (!this.SalesMasterStatusOG.map(f => {return f.Id}).includes(statusId)) {
      return '-';
    }
    return this.SalesMasterStatusOG.filter(f => f.Id === statusId)[0].Info;
  }

  getSaleStatusInfo(statusId) {
    if (!this.saleStatus.map(f => {return f.Id}).includes(statusId)) {
      return '-';
    }
    return this.saleStatus.filter(f => f.Id === statusId)[0].Info;
  }

  getTaskStatusInfo(statusId) {
    if (!this.taskStatus.map(f => {return f.Id}).includes(statusId)) {
      return '-';
    }
    return this.taskStatus.filter(f => f.Id === statusId)[0].Info;
  }

  getstockStatusInfo(statusId) {
    if (!this.stockStatus.map(f => {return f.Id}).includes(statusId)) {
      return '-';
    }
    return this.stockStatus.filter(f => f.Id === statusId)[0].Info;
  }

  getstockActionStatusInfo(statusId) {
    if (!this.stockActionStatus.map(f => {return f.Id}).includes(statusId)) {
      return '-';
    }
    return this.stockActionStatus.filter(f => f.Id === statusId)[0].Info;
  }

  public language = [
    { Id: 'en', Info: 'English'},
    { Id: 'cn', Info: '中 文 简 体'},
    { Id: 'tw', Info: '中 文 繁 體'},
    { Id: 'vn', Info: 'Tiếng việt'},
    { Id: 'th', Info: 'ภาษาไทย'},
    { Id: 'my', Info: 'Bahasa Melayu'}
  ]

  constructor() {
    let project = 'hs';
    // this.environment = 'local';

    if (this.environment === 'local') {
      this.baseUrl = 'https://localhost:44344/api/';
      this.fileUrl = 'https://localhost:44344/file/';
      this.payUrl = 'https://localhost:44344/pay/';
      this.reportUrl = 'https://localhost:44344/';
    } else {
      this.baseUrl = `https://sbtapi-${project}.azurewebsites.net/api/`;
      this.fileUrl = `https://sbtapi-${project}.azurewebsites.net/fileUrl/`;
      this.reportUrl = `https://sbtapi-${project}.azurewebsites.net/reportUrl/`;
    }
  }
}