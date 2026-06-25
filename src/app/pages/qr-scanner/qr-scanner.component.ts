import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { Html5Qrcode } from 'html5-qrcode';
import { TranslatePipe } from '@ngx-translate/core';

type ScanState = 'idle' | 'scanning' | 'found' | 'error' | 'denied';

@Component({
    selector: 'app-qr-scanner',
    imports: [NgIf, TranslatePipe],
    templateUrl: './qr-scanner.component.html',
    styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnInit, OnDestroy {
  state: ScanState = 'idle';
  errorMessage = '';
  scannedCode = '';
  private scanner: Html5Qrcode | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startScan();
  }

  startScan(): void {
    this.state = 'scanning';
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
