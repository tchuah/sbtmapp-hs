import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private roleSubject = new BehaviorSubject<any>(null);

  reset() {
    this.roleSubject.next(null);
  }

  setRoleSubject(value: any) {
    this.roleSubject.next(value);
  }

  getRoleSubject(): Observable<any> {
    return this.roleSubject.asObservable();
  }
}
