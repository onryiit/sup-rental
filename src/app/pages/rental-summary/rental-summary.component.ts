import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, LowerCasePipe } from '@angular/common';
import { SupService } from '../../services/sup.service';
import { MeterService } from '../../services/meter.service';
import { CardService, CardInfo } from '../../services/card.service';
import { AuthService } from '../../services/auth.service';
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
  cardInfo: CardInfo | null = null;
  meterConfig: { pricePerMinute: number; preAuthAmount: number; maxHours: number } | null = null;
  loading = true;
  starting = false;
  notFound = false;
  qrCode = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supService: SupService,
    private meterService: MeterService,
    private cardService: CardService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.qrCode =
      this.route.snapshot.paramMap.get('qrCode') ||
      this.route.snapshot.queryParamMap.get('qr') || '';

    if (!this.qrCode) { this.notFound = true; this.loading = false; return; }

    this.meterService.getConfig().subscribe(cfg => this.meterConfig = cfg);

    const user = this.auth.currentUser;
    if (user) {
      this.cardService.getCard(user.id).subscribe(c => this.cardInfo = c);
    }

    this.supService.getSupByQrCode(this.qrCode).subscribe(sup => {
      if (!sup) { this.notFound = true; this.loading = false; return; }
      this.sup = sup;
      this.supService.getBeach(sup.beachId).subscribe(b => {
        this.beach = b;
        this.loading = false;
      });
    });
  }

  startRental(): void {
    if (!this.sup || this.starting) return;

    if (!this.auth.isLoggedIn) { this.router.navigate(['/login']); return; }

    if (!this.cardInfo?.hasCard) {
      localStorage.setItem('sup_pending_rental', this.qrCode);
      this.router.navigate(['/card-setup']);
      return;
    }

    this.starting = true;
    const user = this.auth.currentUser!;

    this.meterService.startRental({
      userId: user.id,
      supId: this.sup.id,
      qrCode: this.sup.qrCode,
      beachId: this.sup.beachId,
      cabinetNumber: this.sup.cabinetNumber,
      userName: user.name,
      userPhone: user.phone,
      userEmail: user.email,
    }).subscribe({
      next: res => {
        this.meterService.setActiveRentalId(res.rentalId);
        this.router.navigate(['/active-rental']);
      },
      error: err => {
        this.starting = false;
        if (err.error?.code === 'NO_CARD') {
          localStorage.setItem('sup_pending_rental', this.qrCode);
          this.router.navigate(['/card-setup']);
        } else {
          alert(err.error?.error || 'Kiralama başlatılamadı.');
        }
      },
    });
  }

  goBack(): void { this.router.navigate(['/scan']); }

  get statusLabel(): string {
    switch (this.sup?.status) {
      case '1': return 'Müsait';
      case '2': return 'Kiralanmış';
      case '3': return 'Bakımda';
      default: return '';
    }
  }

  get maxCost(): number {
    if (!this.meterConfig) return 0;
    return this.meterConfig.pricePerMinute * this.meterConfig.maxHours * 60;
  }
}
