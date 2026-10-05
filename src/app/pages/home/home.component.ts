import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RentalService } from '../../services/rental.service';
import { SupService } from '../../services/sup.service';
import { MeterService } from '../../services/meter.service';
import { Rental, User, Beach } from '../../models';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-home',
    imports: [NgIf, NgFor, TranslatePipe],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  pastRentals: Rental[] = [];
  beaches: Beach[] = [];
  activeRentalId: string | null = null;
  loading = true;

  constructor(
    private auth: AuthService,
    private rentalService: RentalService,
    private supService: SupService,
    private meterService: MeterService,
    private router: Router,
    private lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    this.supService.getAllBeaches().subscribe(b => (this.beaches = b));

    this.meterService.getMyRentals().subscribe({
      next: res => {
        this.activeRentalId = res.active?.id ?? null;
        this.pastRentals = res.history.slice(0, 5);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  goScan(): void { this.router.navigate(['/scan']); }
  goActiveRental(): void { this.router.navigate(['/active-rental']); }

  getBeachName(beachId: string): string {
    return this.beaches.find(b => b.id === beachId)?.name ?? beachId;
  }

  formatDate(d: Date): string {
    const lang = this.lang.current;
    return new Date(d).toLocaleDateString(lang === 'en' ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'long' });
  }

  get greeting(): string {
    const h = new Date().getHours();
    const key = h < 12 ? 'HOME.GREETING_MORNING' : h < 18 ? 'HOME.GREETING_DAY' : 'HOME.GREETING_EVENING';
    return key;
  }
}
