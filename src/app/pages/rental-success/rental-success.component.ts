import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RentalService } from '../../services/rental.service';
import { PaymentService } from '../../services/payment.service';
import { Rental } from '../../models';

@Component({
  selector: 'app-rental-success',
  templateUrl: './rental-success.component.html',
  styleUrls: ['./rental-success.component.scss'],
})
export class RentalSuccessComponent implements OnInit, OnDestroy {
  rental: Rental | null = null;
  // 'verifying' → iyzico callback'ten döndük, backend'den sonuç bekliyoruz
  // 'success'   → kilit açıldı
  // 'fail'      → ödeme başarısız
  // 'error'     → teknik hata
  state: 'verifying' | 'success' | 'fail' | 'error' = 'verifying';
  errorMessage = '';
  remainingSeconds = 0;
  private timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rentalService: RentalService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const status  = params.get('status');   // 'fail' | 'error' (backend'den)
    const token   = params.get('token');    // başarılı callback'ten
    const msg     = params.get('msg');

    // Backend başarısız/hata ile yönlendirdiyse
    if (status === 'fail' || status === 'error') {
      this.state = status;
      this.errorMessage = msg ? decodeURIComponent(msg) : 'Ödeme tamamlanamadı.';
      return;
    }

    // Başarılı callback: backend rental'ı güncelledi, kilidi zaten açtı
    // Sadece görüntülemek için rental bilgisini getir
    if (token) {
      this.paymentService.getPaymentResult(token).subscribe({
        next: (res) => {
          if (res.success && res.rental) {
            this.rental = this.buildRental(res.rental);
            this.rentalService.setActiveRental(this.rental);
            this.calcRemaining();
            this.state = 'success';
            this.startTimer();
          } else {
            this.state = 'fail';
            this.errorMessage = res.error || 'Ödeme onaylanamadı.';
          }
        },
        error: () => {
          this.state = 'error';
          this.errorMessage = 'Sunucuya bağlanılamadı.';
        },
      });
      return;
    }

    // Token yoksa (eski mock akışı veya doğrudan navigasyon)
    this.rental = this.rentalService.getActiveRental();
    if (this.rental) {
      this.calcRemaining();
      this.state = 'success';
      this.startTimer();
    } else {
      this.router.navigate(['/home']);
    }
  }

  // Backend'den gelen plain object'i Rental'a çevir (Date nesneleri için)
  private buildRental(raw: any): Rental {
    return {
      ...raw,
      startTime: new Date(raw.startTime),
      endTime: new Date(raw.endTime),
    };
  }

  private calcRemaining(): void {
    if (!this.rental) return;
    this.remainingSeconds = Math.max(
      0,
      Math.floor((new Date(this.rental.endTime).getTime() - Date.now()) / 1000)
    );
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.calcRemaining();
      if (this.remainingSeconds === 0) clearInterval(this.timerInterval);
    }, 1000);
  }

  ngOnDestroy(): void { clearInterval(this.timerInterval); }

  get timeDisplay(): string {
    const h = Math.floor(this.remainingSeconds / 3600);
    const m = Math.floor((this.remainingSeconds % 3600) / 60);
    const s = this.remainingSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  get endTimeFormatted(): string {
    if (!this.rental) return '';
    return new Date(this.rental.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  get progressPercent(): number {
    if (!this.rental) return 0;
    const total = this.rental.durationMinutes * 60;
    return Math.min(100, Math.round(((total - this.remainingSeconds) / total) * 100));
  }
}
