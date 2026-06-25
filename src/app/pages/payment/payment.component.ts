import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { RentalService } from '../../services/rental.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { Rental } from '../../models';

@Component({
    selector: 'app-payment',
    imports: [NgIf],
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, AfterViewInit {
  @ViewChild('iyzicoContainer') iyzicoContainer!: ElementRef;

  rental: Rental | null = null;
  state: 'loading' | 'form' | 'verifying' | 'error' = 'loading';
  errorMessage = '';
  iyzicoToken = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rentalService: RentalService,
    private paymentService: PaymentService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.rental = this.rentalService.getActiveRental();
    if (!this.rental) { this.router.navigate(['/home']); return; }

    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.iyzicoToken = token;
      this.verifyPayment(token);
      return;
    }

    this.initForm();
  }

  ngAfterViewInit(): void {}

  initForm(): void {
    const user = this.auth.currentUser!;
    this.paymentService.initCheckoutForm(this.rental!, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
    }).subscribe({
      next: (res) => {
        this.iyzicoToken = res.token;
        this.state = 'form';
        setTimeout(() => this.injectIyzicoForm(res.checkoutFormContent), 100);
      },
      error: (err) => {
        this.state = 'error';
        this.errorMessage = err.error?.error || 'Ödeme formu başlatılamadı.';
      },
    });
  }

  private injectIyzicoForm(html: string): void {
    if (!this.iyzicoContainer) return;
    const el = this.iyzicoContainer.nativeElement;
    el.innerHTML = html;
    Array.from(el.querySelectorAll('script')).forEach((oldScript: any) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr: any) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  verifyPayment(token: string): void {
    this.state = 'verifying';
    this.paymentService.getPaymentResult(token).subscribe({
      next: (res) => {
        if (res.success) {
          if (res.rental) this.rentalService.setActiveRental(res.rental as any);
          this.router.navigate(['/success']);
        } else {
          this.state = 'error';
          this.errorMessage = res.error || 'Ödeme onaylanamadı.';
        }
      },
      error: () => {
        this.state = 'error';
        this.errorMessage = 'Ödeme sonucu alınamadı.';
      },
    });
  }

  get endTimeFormatted(): string {
    if (!this.rental) return '';
    return new Date(this.rental.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  goBack(): void { this.router.navigate(['/summary', this.rental?.qrCode]); }
}
