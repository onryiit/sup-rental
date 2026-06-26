import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { Html5Qrcode } from 'html5-qrcode';
import { TranslatePipe } from '@ngx-translate/core';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

type ScanState = 'idle' | 'scanning' | 'found' | 'error' | 'denied';

@Component({
    selector: 'app-qr-scanner',
    imports: [NgIf, TranslatePipe, PageLayoutComponent, BreadcrumbComponent],
    templateUrl: './qr-scanner.component.html',
    styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnInit, AfterViewInit, OnDestroy {
  state: ScanState = 'idle';
  errorMessage = '';
  scannedCode = '';
  private scanner: Html5Qrcode | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => this.startScan(), 0);
  }

  startScan(): void {
    this.state = 'scanning';
    // Wait one frame for *ngIf to render the #qr-reader div
    setTimeout(() => {
      if (!document.getElementById('qr-reader')) return;
      this.scanner = new Html5Qrcode('qr-reader');
      this.scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => this.onScanSuccess(decodedText),
          () => {}
        )
        .catch(err => {
          const msg: string = err?.toString() ?? '';
          this.state = msg.includes('NotAllowed') ? 'denied' : 'error';
          this.errorMessage = msg.includes('NotAllowed')
            ? 'Kamera izni reddedildi. Lütfen tarayıcı ayarlarından kamera iznini etkinleştirin.'
            : 'Kamera açılamadı. Başka bir uygulama kamerayı kullanıyor olabilir.';
        });
    }, 0);
  }

  private onScanSuccess(code: string): void {
    if (this.state === 'found') return;
    this.state = 'found';
    this.scannedCode = code;
    this.stopScanner().then(() => {
      const qrParam = this.extractQrCode(code);
      setTimeout(() => this.router.navigate(['/summary', qrParam]), 600);
    });
  }

  private extractQrCode(raw: string): string {
    try {
      const url = new URL(raw);
      const qr = url.searchParams.get('qr');
      if (qr) return qr;
    } catch {}
    return raw;
  }

  private async stopScanner(): Promise<void> {
    if (this.scanner) {
      try { await this.scanner.stop(); } catch {}
      this.scanner = null;
    }
  }

  enterManual(code: string): void {
    if (!code.trim()) return;
    this.router.navigate(['/summary', code.trim()]);
  }

  goBack(): void {
    this.stopScanner().then(() => this.router.navigate(['/home']));
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }
}
