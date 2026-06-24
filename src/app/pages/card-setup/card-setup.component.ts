import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CardService, CardInfo } from '../../services/card.service';
import { MeterService } from '../../services/meter.service';
import { AuthService } from '../../services/auth.service';

type PageState = 'loading' | 'has-card' | 'form' | 'success' | 'error';

@Component({
  selector: 'app-card-setup',
  templateUrl: './card-setup.component.html',
  styleUrls: ['./card-setup.component.scss'],
})
export class CardSetupComponent implements OnInit, AfterViewInit {
  @ViewChild('iyzicoContainer') iyzicoContainer!: ElementRef;

  state: PageState = 'loading';
  cardInfo: CardInfo | null = null;
  errorMessage = '';
  // rentalId var ise kart kaydedince otomatik kiralama başlat
  pendingRentalId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cardService: CardService,
    private meterService: MeterService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const status = this.route.snapshot.queryParamMap.get('status');
    const msg    = this.route.snapshot.queryParamMap.get('msg');

    if (status === 'success') {
      this.state = 'success';
      // Bekleyen kiralama varsa geri dön
      const pending = localStorage.getItem('sup_pending_rental');
      if (pending) {
        localStorage.removeItem('sup_pending_rental');
        setTimeout(() => this.router.navigate(['/summary', pending]), 1500);
      }
      return;
    }

    if (status === 'error') {
      this.state = 'error';
      this.errorMessage = msg ? decodeURIComponent(msg) : 'Kart kaydedilemedi.';
      return;
    }

    this.loadCard();
  }

  ngAfterViewInit(): void {}

  loadCard(): void {
    const user = this.auth.currentUser!;
    this.cardService.getCard(user.id).subscribe({
      next: card => {
        this.cardInfo = card;
        this.state = card.hasCard ? 'has-card' : 'form';
        if (!card.hasCard) setTimeout(() => this.initForm(), 100);
      },
      error: () => { this.state = 'form'; setTimeout(() => this.initForm(), 100); },
    });
  }

  initForm(): void {
    const user = this.auth.currentUser!;
    this.cardService.initCardSave({
      id: user.id, name: user.name, phone: user.phone, email: user.email,
    }).subscribe({
      next: res => {
        this.state = 'form';
        setTimeout(() => this.injectForm(res.checkoutFormContent), 50);
      },
      error: err => {
        this.state = 'error';
        this.errorMessage = err.error?.error || 'Form başlatılamadı.';
      },
    });
  }

  private injectForm(html: string): void {
    if (!this.iyzicoContainer) return;
    const el = this.iyzicoContainer.nativeElement;
    el.innerHTML = html;
    Array.from(el.querySelectorAll('script')).forEach((old: any) => {
      const s = document.createElement('script');
      Array.from(old.attributes).forEach((a: any) => s.setAttribute(a.name, a.value));
      s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
  }

  devInjectCard(): void {
    const user = this.auth.currentUser!;
    this.cardService.devInjectCard(user.id).subscribe({
      next: () => {
        this.state = 'success';
        const pending = localStorage.getItem('sup_pending_rental');
        if (pending) {
          localStorage.removeItem('sup_pending_rental');
          setTimeout(() => this.router.navigate(['/summary', pending]), 1500);
        }
      },
      error: err => alert(err.error?.error || 'Hata'),
    });
  }

  deleteCard(): void {
    if (!confirm('Kartınızı silmek istediğinize emin misiniz?')) return;
    const user = this.auth.currentUser!;
    this.cardService.deleteCard(user.id).subscribe(() => {
      this.cardInfo = null;
      this.state = 'loading';
      this.loadCard();
    });
  }

  goHome(): void { this.router.navigate(['/home']); }
}
