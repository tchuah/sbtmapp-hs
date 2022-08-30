import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'sbt-scanner',
  templateUrl: './sbt-scanner.component.html',
  styleUrls: ['./sbt-scanner.component.scss'],
})
export class SbtScannerComponent {

  @Input() scannerEnabled: boolean = true;
  @Input() scannerFormat: BarcodeFormat[] = [ BarcodeFormat.QR_CODE ];

  @Output() scanSuccess = new EventEmitter<string>();

  lastScanValue = '';
  
  constructor() {}

  onScanSuccess(e) {
    if (e) {
      if (this.lastScanValue === e) {
        return;
      }
  
      this.scanSuccess.emit(e);
    }
    this.lastScanValue = e;
  }
}