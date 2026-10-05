import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, LowerCasePipe } from '@angular/common';
import { SupService } from '../../services/sup.service';
import { CardService } from '../../services/card.service';
import { AuthService } from '../../services/auth.service';
import { MeterService } from '../../services/meter.service';
import { Sup, Beach } from '../../models';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-rental-summary',
  imports: [NgIf, LowerCasePipe, TranslatePipe],
  templateUrl: './rental-summary.component.html',
  styleUrls: ['./rental-summary.component.scss']
})
export class RentalSummaryComponent implements OnInit {
  sup: Sup | null = null;
  beach: Beach | null = null;
  meterConfig: { pricePerMinute: number; preAuthAmount: number; maxHours: number } | null = null;
  loading = true;
  notFound = false;
  formLoading = false;
  formError = '';
  formShown = false;
  qrCode = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supService: SupService,
    private cardService: CardService,
    private meterService: MeterService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.qrCode =
      this.route.snapshot.paramMap.get('qrCode') ||
      this.route.snapshot.queryParamMap.get('qr') || '';

    if (!this.qrCode) { this.notFound = true; this.loading = false; return; }

    this.meterService.getConfig().subscribe(cfg => this.meterConfig = cfg);

    this.supService.getSupByQrCode(this.qrCode).subscribe({
      next: sup => {
        if (!sup) { this.notFound = true; this.loading = false; return; }
        this.sup = sup;
        this.supService.getBeach(sup.beachId).subscribe(b => {
          this.beach = b;
          this.loading = false;
        });
      },
      error: () => { this.notFound = true; this.loading = false; }
    });
  }

  proceedToPayment(): void {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/login']); return; }
    if (!this.sup) return;

    this.formLoading = true;
    this.formError = '';
    const user = this.auth.currentUser!;

    this.cardService.initRentalForm({
      user: { id: user.id, name: user.name, phone: user.phone, email: user.email },
      supId: this.sup.id,
      qrCode: this.sup.qrCode,
      beachId: this.sup.beachId,
      cabinetNumber: this.sup.cabinetNumber,
    }).subscribe({
      next: res => {
        this.formShown = true;
        this.formLoading = false;
        setTimeout(() => {
          const container = document.getElementById('iyzipay-checkout-form-rental');
          if (container && (window as any).iyziInit) {
            new (window as any).iyziInit({ token: res.token, container, node: container });
          } else if (container) {
            container.innerHTML = res.checkoutFormContent;
            const scripts = container.querySelectorAll('script');
            scripts.forEach((s: HTMLScriptElement) => {
              const ns = document.createElement('script');
              if (s.src) { ns.src = s.src; } else { ns.textContent = s.textContent; }
              document.body.appendChild(ns);
            });
          }
        }, 100);
      },
      error: err => {
        this.formLoading = false;
        this.formError = err.error?.message || err.error?.error || err.message || 'Could not initialize payment form';
      }
    });
  }

  cancelForm(): void {
    this.formShown = false;
    this.formError = '';
    const container = document.getElementById('iyzipay-checkout-form-rental');
    if (container) container.innerHTML = '';
  }

  goBack(): void { this.router.navigate(['/scan']); }

  get statusLabel(): string {
    switch (this.sup?.status) {
      case '1': return 'Available';
      case '2': return 'Rented';
      case '3': return 'Maintenance';
      default: return '';
    }
  }

  get maxCost(): number {
    if (!this.meterConfig) return 0;
    return this.meterConfig.pricePerMinute * this.meterConfig.maxHours * 60;
  }
}
