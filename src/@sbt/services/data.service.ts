import { Injectable, OnInit } from '@angular/core';
import { Subject, TimeoutError } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnInit{

  private data: string = '';
  private isChanged: boolean = false;

  destroy$: Subject<boolean> = new Subject<boolean>();
 
  constructor()
  { }

  ngOnInit() {
  }
 
  setData(id) {
    this.data = id;
  }
 
  getData() {
    return this.data;
  }

  setChange(val) {
    this.isChanged = true;
  }

  IsChange() {
    return this.isChanged
  }
}
