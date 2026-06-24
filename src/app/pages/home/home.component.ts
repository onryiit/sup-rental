import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RentalService } from '../../services/rental.service';
import { SupService } from '../../services/sup.service';
import { CardService, CardInfo } from '../../services/card.service';
import { MeterService } from '../../services/meter.service';
import { Rental, User, Beach } from '../../models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  pastRentals: Rental[] = [];
  beaches: Beach[] = [];
  cardInfo: CardInfo | null = null;
  activeRentalId: string | null = null;
  loading = true;

  constructor(
    private auth: AuthService,
    private rentalService: RentalService,
    private supService: SupService,
    private cardService: CardService,
    private meterService: MeterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.currentUser;
    this.activeRentalId = this.meterService.getActiveRentalId();
    this.supService.getAllBeaches().subscribe(b => (this.beaches = b));

    if (this.user) {
      this.cardService.getCard(this.user.id).subscribe(c => (this.cardInfo = c));
      this.rentalService.getUserRentals(this.user.id).subscribe(rentals => {
        this.pastRentals = rentals.slice(0, 5);
        this.loading = false;
      });
    }
  }

  goScan(): void { this.router.navigate(['/scan']); }
  goActiveRental(): void { this.router.navigate(['/active-rental']); }
  goCardSetup(): void { this.router.navigate(['/card-setup']); }
  logout(): void { this.auth.logout(); }

  getBeachName(beachId: string): string {
    return this.beaches.find(b => b.id === beachId)?.name ?? beachId;
  }

  formatDate(d: Date): string {
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
  }
}
