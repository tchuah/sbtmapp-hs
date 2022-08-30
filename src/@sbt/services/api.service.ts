import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UtilService } from '../utils/util.service';
import { Observable, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { GlobalService } from 'src/app/app-config/global.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl: string;
  maxTime: number = 5000;
  errorJson = [
    {Id: 'HS-PUBLIC-010', Message: 'The data sent is not in proper format!'},
    {Id: 'HS-PUBLIC-013', Message: 'No value are passed to the database!'},
    {Id: 'HS-PUBLIC-014', Message: 'The Id Passed does not exists!'},
    {Id: 'HS-SALES-001', Message: 'User have to complete all data field!'},
    {Id: 'HS-SALES-002', Message: 'An image or a file is needed to completed!'},
    {Id: 'HS-SALES-004', Message: 'Progress has to be 100% to be completed!'},
    {Id: 'HS-SALES-006', Message: 'This Sales Already Closed!'},
    {Id: 'HS-SALES-007', Message: 'This Sales Already Canceled!'},
    {Id: 'HS-SALES-008', Message: 'This Sales Already Approved!'},
    {Id: 'HS-SALES-009', Message: 'The Workflow is not activated! Please contact admin to activate it!'},
    {Id: 'HS-SALES-010', Message: 'This quotation already exists'},
    {Id: 'HS-SALES-011', Message: 'This sales does not has a chassis number'},
    {Id: 'HS-SALES-012', Message: 'Progress has to be 100% to be completed!'},
    {Id: 'HS-SALES-013', Message: 'Progress has to be 100% to be completed!'},
    {Id: 'HS-SALES-014', Message: 'Progress has to be 100% to be completed!'},
    {Id: 'HS-SALES-015', Message: 'Progress has to be 100% to be completed!'},
  ]

  constructor(
    private httpClient: HttpClient,
    private global: GlobalService,
    private router: Router,
    private util: UtilService) {
    this.baseUrl = this.global.baseUrl;
  } 

  httpGetIC(resource: string, maxTime: number = this.maxTime) {
    this.global.isGetIc = true;
    return this.httpClient.get(resource, {responseType: 'text'}).pipe(
      timeout(30000)
    );
  }

  // Generic API
  public httpGet(resource: string, maxTime: number = this.maxTime): Observable<any> {
    return this.httpClient.get(this.baseUrl + 'generic/' + resource).pipe(
      timeout(maxTime)
    );
  }

  httpGetById(id, resource: string, maxTime: number = this.maxTime): Observable<any> {
    resource = `${resource}/${id}`;
    return this.httpClient.get(this.baseUrl + 'generic/' + resource).pipe(
      timeout(maxTime)
    );
  }

  httpPut(resource: string, data: any, maxTime: number = this.maxTime): Observable<any> {
    return this.httpClient.put(this.baseUrl + 'generic/' + resource, data).pipe(
      timeout(maxTime)
    );
  }

  httpPost(resource: string, data: any, maxTime: number = this.maxTime): Observable<any> {
    return this.httpClient.post(this.baseUrl + 'generic/' + resource, data).pipe(
      timeout(maxTime)
    );
  }

  httpDelete(resource: string, maxTime: number = this.maxTime): Observable<any> {
    return this.httpClient.delete(this.baseUrl + 'generic/' + resource).pipe(
      timeout(maxTime)
    );
  }

  httpGetNonGeneric(resource: string, maxTime: number = this.maxTime): Observable<any> {    
    return this.httpClient.get(this.baseUrl + resource).pipe(      
      timeout(maxTime)
    );
  }

  // Lookup Api
  httpLookup(resource: string, maxTime: number = this.maxTime): Observable<any> {
    return this.httpClient.get(this.baseUrl + 'lookup/' + resource).pipe(
      timeout(maxTime)
    );
  }

  // Security Api
  httpPostSecurity(resource: string, data: any, maxTime: number = this.maxTime): Observable<any> {
    return this.httpClient.post(this.baseUrl + 'security/' + resource, data).pipe(
      timeout(maxTime)
    );
  }

  httpGetSecurity(resource: string, maxTime: number = this.maxTime): Observable<any> {
    return this.httpClient.get(this.baseUrl + 'security/' + resource).pipe(
      timeout(maxTime)
    );
  }

  // File Api
  httpUpload(id: string, tenant: string, formData: FormData) {
    return this.httpClient.post(`${this.global.fileUrl}${id}/${tenant}`, formData);
  }

  // Generic Action Api
  httpAction(resource: string, data?: any, maxTime: number = this.maxTime): Observable<any> {
    return this.httpClient.post(this.baseUrl + 'action/' + resource, data).pipe(
      timeout(maxTime)
    );
  }

  // Image Api
  httpLocalFile(resource: any, data: any, maxTime: number = this.maxTime): Observable<any> {
    return this.httpClient.post(this.baseUrl + 'image/' + resource, data).pipe(
      timeout(maxTime)
    );
  }

  httpWorkflow(resource: string, data?: any, maxTime: number = this.maxTime): Observable<any> {
    return this.httpClient.post(this.baseUrl + 'workflow/' + resource, data).pipe(
      timeout(maxTime)
    );
  }
  httpSp(resource: string, data?: any, maxTime: number = this.maxTime): Observable<any> {
    return this.httpClient.post(this.baseUrl + 'sp/' + resource, data).pipe(
      timeout(maxTime)
    );
  }

  async handleApiError2(errorCode) {
    switch (errorCode) {

      case 'HS-PUBLIC-010':
        this.util.genericMessageBoxXTranslate('Client Alert', 'The data sent is not in proper format!');
        return;
      case 'HS-PUBLIC-013':
        this.util.genericMessageBoxXTranslate('Client Alert', 'No Value Passed!');
        return;
      case 'HS-PUBLIC-014':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This Id Does Not Exists!');
        return;
      case 'HS-PUBLIC-015':
        this.util.genericMessageBoxXTranslate('Client Alert', 'The data is obsolete. Please refresh.');
        return;
      case 'HS-SALES-001':
        this.util.genericMessageBoxXTranslate('Client Alert', 'Have to complete all field!');
        return;
      case 'HS-SALES-002':
        this.util.genericMessageBoxXTranslate('Client Alert', 'An image/file is needed to upload to be completed!');
        return;
      case 'HS-SALES-004':
        this.util.genericMessageBoxXTranslate('Client Alert', 'Progress has to be 100% to be completed!');
        return;
      case 'HS-SALES-006':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This Sales Already Closed!');
        return;
      case 'HS-SALES-007':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This Sales Already Canceled!');
        return;
      case 'HS-SALES-008':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This Sales Already Approved!');
        return;
      case 'HS-SALES-009':
        this.util.genericMessageBoxXTranslate('Client Alert', 'Workflow is not activated! Please contact admin to activate it!');
        return;
      case 'HS-SALES-010':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This quotation already exists!');
        return;
      case 'HS-SALES-011':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This Sales Does Not Has A Chassis Number Yet!');
        return;
      case 'HS-SALES-012':
        this.util.genericMessageBoxXTranslate('Client Alert', 'Loan Does not have data!');
        return;
      case 'HS-SALES-013':
        this.util.genericMessageBoxXTranslate('Client Alert', 'Body Work Does not have data!');
        return;
      case 'HS-SALES-014':
        this.util.genericMessageBoxXTranslate('Client Alert', 'You have to complete all tasks before closing this sales!');
        return;
      case 'HS-SALES-015':
        this.util.genericMessageBoxXTranslate('Client Alert', 'The outstanding and outstanding collected figure has to be 0 to close the sales!');
        return;
      case 'HS-SALES-016':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This sales is already verified!');
        return;
      case 'HS-SALES-017':
        this.util.genericMessageBoxXTranslate('Client Alert', 'The outstanding is not 0!');
        return;
      case 'HS-SALES-018':
        this.util.genericMessageBoxXTranslate('Client Alert', 'The outstanding collected has to be 0!');
        return;
      case 'HS-SALES-019':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This sales already released!');
        return;
      case 'HS-SALES-5B':
        this.util.genericMessageBoxXTranslate('Client Alert', 'The outstanding has to be 0!');
        return;
      case 'HS-SALES-6H':
        this.util.genericMessageBoxXTranslate('Client Alert', 'Loan Collected has to be the same as Loan');
        return;
      case 'HS-CLOSE-001':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This sales cannot be closed because it does not have a chassis number assigned!');
        return;
      case 'HS-REVERT-001':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This task cannot be undone because Chassis Number has been assigned. Please contact sales admin for help.');
        return;
      case 'HS-REVERT-002':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This task cannot be undone because E-daftar has already approved. Please contact boss for help.');
        return;
      case 'HS-VERIFY-001':
        this.util.genericMessageBoxXTranslate('Client Alert', 'No Verify Upload Image.');
        return;
      case 'HS-UNVERIFY-001':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This quotation cannot be unverify because some of the sales already released.');
        return;
      case 'HS-UNVERIFY-002':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This quotation cannot be unverify because some of the sales already been modified.');
        return;
      case 'HS-CANCEL-001':
        this.util.genericMessageBoxXTranslate('Client Alert', 'You have to unassign the chassis number first before you cancel this sales.');
        return;
      case 'HS-CANCEL-002':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This sales is not canceled!');
        return;
      case 'HS-CANCEL-003':
        this.util.genericMessageBoxXTranslate('Client Alert', 'You can only cancel new or released sales!');
        return;
      case 'HS-CANCEL-004':
        this.util.genericMessageBoxXTranslate('Client Alert', 'You can only cancel a sale when all the collected figure is equal to reimburse.');
        return;
      case 'HS-CANCEL-005':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This sales is already canceled!');
        return;
      case 'HS-CANCEL-006':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This sales is not closed!');
        return;
      case 'HS-UP-001':
        this.util.genericMessageBoxXTranslate('Client Alert', 'New Collected Deposit cannot be larger than Required Deposit!');
        return;
      case 'HS-UP-002':
        this.util.genericMessageBoxXTranslate('Client Alert', 'New Collected Loan cannot be larger than Required Loan!');
        return;
      case 'HS-UP-003':
        this.util.genericMessageBoxXTranslate('Client Alert', 'New Collected Balance cannot be larger than Required Balance!');
        return;
      case 'HS-UP-004':
        this.util.genericMessageBoxXTranslate('Client Alert', 'New Collected Reimburse cannot be larger than Required Reimburse!');
        return;
      case 'HS-QUOTE-001':
        this.util.genericMessageBoxXTranslate('Client Alert', 'The subtraction of total collected and refunded figure must be 0 to cancel quotation!');
        return;
      case 'HS-CHASSIS-001':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This sales already assigned a chassis number. Please refresh to confirm.');
        return;
      case 'HS-CHASSIS-002':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This chassis number have already assigned. Please refresh to confirm.');
        return;
      case 'HS-CHASSIS-003':
        this.util.genericMessageBoxXTranslate('Client Alert', 'This sales E Daftar already approved. Only boss can revert the chassis number.');
        return;
      case 'HS-RESET-001':
        this.util.genericMessageBoxXTranslate('Client Alert', 'The collected deposit has already been allocated!');
        return;
      case 'HS-RESET-002':
        this.util.genericMessageBoxXTranslate('Client Alert', 'The collected loan has already been allocated!');
        return;
      case 'HS-RESET-003':
        this.util.genericMessageBoxXTranslate('Client Alert', 'The collected balance has already been allocated!');
        return;
      case 'HS-RESET-004':
        this.util.genericMessageBoxXTranslate('Client Alert', 'The paid reimburse has already been allocated!');
        return;

      default:
        this.util.genericMessageBoxXTranslate('Client Alert', errorCode);
        return;
    }
  }

  async handleApiError(error: HttpErrorResponse, callback: () => void = () => { }) {
    if (!navigator.onLine) {
      this.util.genericMessageBox('ClientAlert', 'ErrorInternetDown');
      callback();
      return;
    }

    if (error instanceof TimeoutError) {
      callback();
      this.util.genericMessageBox('ClientAlert', 'ErrorTimeOut');
      return;
    }

    if (error instanceof ErrorEvent) {
      this.util.genericMessageBox('ClientAlert', 'ErrorData');
      callback();
      return;
    }

    if (error.status === 400) {
      this.util.genericMessageBox('AdministratorAlert', 'Error400');
      callback();
      return;
    }

    if (error.status === 401) {
      callback();
      this.global.accessToken = undefined;
      this.router.navigate(['/login']);
      return;
    }

    if (error.status === 403) {
      this.util.genericMessageBox('ClientAlert', 'ErrorIPX');
      callback();
      return;
    }

    if (error.status === 500) {
      this.util.genericMessageBox('AdministratorAlert', 'Error500');
      callback();
      return;
    }

    if (error.error !== null) {
      if (error.error.hasOwnProperty('text')) {
        switch (error.error.text) {
          case ('DPK'):
            this.util.genericMessageBox('ClientAlert', 'ErrorDPX');
            callback();
            return;
          case ('MPX'):
            this.util.genericMessageBox('ClientAlert', 'ErrorMPX');
            callback();
            return;
          case ('RIX'):
            this.util.genericMessageBox('ClientAlert', 'ErrorRIX');
            callback();
            return;
          case ('IDX'):
            this.util.genericMessageBox('ClientAlert', 'ErrorIDX');
            callback();
            return;
          case ('FPX'):
            this.util.genericMessageBox('ClientAlert', 'ErrorFPX');
            callback();
            return;
          case ('JVX'):
            this.util.genericMessageBox('ClientAlert', 'ErrorJVX');
            callback();
            return;
          case ('RFX'):
            this.util.genericMessageBox('ClientAlert', 'ErrorRFX');
            callback();
            return;
          case ('RVX'):
            this.util.genericMessageBox('ClientAlert', 'ErrorRVX');
            callback();
            return;
          case ('StatusOH8'):
            this.util.genericMessageBoxXTranslate('Client Alert', 'This task has already completed');
            return;
          case ('StatusOH9'):
            this.util.genericMessageBoxXTranslate('Client Alert', 'This task has already cancelled');
            return;
          case ('StatusPP8'):
            this.util.genericMessageBoxXTranslate('Client Alert', 'This task has already completed');
            return;
          case ('StatusPP9'):
            this.util.genericMessageBoxXTranslate('Client Alert', 'This task has already cancelled');
            return;
          default:
            this.util.genericMessageBox('ClientAlert', error.error.text);
            return;
        }
      }
    }
    this.util.genericMessageBox('AdministratorAlert', error.message);
    callback();
  }
}