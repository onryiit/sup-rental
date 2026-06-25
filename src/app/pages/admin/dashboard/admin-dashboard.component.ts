import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SupService } from '../../../services/sup.service';
import { RentalService } from '../../../services/rental.service';
import { Sup, Beach, Rental } from '../../../models';
import { PageLayoutComponent } from '../../../components/page-layout/page-layout.component';
import { BreadcrumbComponent } from '../../../components/breadcrumb/breadcrumb.component';

const MOCK_RENTALS: Rental[] = [
  {
    id: 'RNT-001', supId: 'sup-001', qrCode: 'QR-OLUD-001', beachId: 'beach-001',
    cabinetNumber: 1, startTime: new Date(Date.now() - 45 * 60000),
    endTime: new Date(Date.now() + 15 * 60000), durationMinutes: 60,
    price: 250, paymentRef: 'PAYTR-1001', status: 'active', phoneNumber: '05301234567',
  },
  {
    id: 'RNT-002', supId: 'sup-003', qrCode: 'QR-PATA-001', beachId: 'beach-002',
    cabinetNumber: 1, startTime: new Date(Date.now() - 2 * 3600000),
    endTime: new Date(Date.now() - 3600000), durationMinutes: 60,
    price: 250, paymentRef: 'PAYTR-1002', status: 'completed', phoneNumber: '05359876543',
  },
  {
    id: 'RNT-003', supId: 'sup-001', qrCode: 'QR-OLUD-001', beachId: 'beach-001',
    cabinetNumber: 1, startTime: new Date(Date.now() - 5 * 3600000),
    endTime: new Date(Date.now() - 3 * 3600000), durationMinutes: 120,
    price: 400, paymentRef: 'PAYTR-1000', status: 'completed', phoneNumber: '05421112233',
  },
];

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, TranslatePipe, PageLayoutComponent, BreadcrumbComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['../admin-shared.scss'],
})
export class AdminDashboardComponent implements OnInit {
  sups: Sup[] = [];
  beaches: Beach[] = [];
  rentals: Rental[] = MOCK_RENTALS;

  constructor(private supService: SupService) {}

  ngOnInit(): void {
    this.supService.getAllSups().subscribe(s => this.sups = s);
    this.supService.getAllBeaches().subscribe(b => this.beaches = b);
  }

  getBeachName(beachId: string): string {
    return this.beaches.find(b => b.id === beachId)?.name ?? beachId;
  }

  get availableCount(): number { return this.sups.filter(s => s.status === 'available').length; }
  get rentedCount(): number    { return this.sups.filter(s => s.status === 'rented').length; }
  get activeRentals(): Rental[] { return this.rentals.filter(r => r.status === 'active'); }
  get todayRevenue(): number {
    const today = new Date().toDateString();
    return this.rentals
      .filter(r => r.status === 'completed' && new Date(r.startTime).toDateString() === today)
      .reduce((sum, r) => sum + r.price, 0);
  }
}
