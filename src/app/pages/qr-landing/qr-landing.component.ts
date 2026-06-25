import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { SupService } from '../../services/sup.service';
import { Sup, Beach } from '../../models';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-qr-landing',
  standalone: true,
  imports: [NgIf, TranslatePipe],
  templateUrl: './qr-landing.component.html',
  styleUrls: ['./qr-landing.component.scss'],
})
export class QrLandingComponent implements OnInit {
  sup: Sup | null = null;
  beach: Beach | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supService: SupService
  ) {}

  ngOnInit(): void {
    const qrCode = this.route.snapshot.queryParamMap.get('qr');
    if (!qrCode) {
      this.error = 'Geçersiz QR kod. Lütfen tekrar okutun.';
      this.loading = false;
      return;
    }
    this.supService.getSupByQrCode(qrCode).subscribe(sup => {
      if (!sup) {
        this.error = 'Bu QR koda ait SUP bulunamadı.';
        this.loading = false;
        return;
      }
      this.sup = sup;
      this.supService.getBeach(sup.beachId).subscribe(beach => {
        this.beach = beach;
        this.loading = false;
      });
    });
  }

  rent(): void {
    this.router.navigate(['/rent', this.sup!.qrCode, 'select']);
  }

  get statusLabel(): string {
    switch (this.sup?.status) {
      case 'available': return 'Müsait';
      case 'rented': return 'Kiralanmış';
      case 'maintenance': return 'Bakımda';
      default: return '';
    }
  }
}
