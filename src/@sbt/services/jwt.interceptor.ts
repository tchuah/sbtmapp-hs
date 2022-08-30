import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalService } from 'src/app/app-config/global.service';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    
  constructor(
      private global: GlobalService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if (this.global.accessToken) {
          request = request.clone({
              setHeaders: {
                  Authorization: `Bearer ${this.global.accessToken}`
              }
          });
      }
      return next.handle(request);
  }
}
