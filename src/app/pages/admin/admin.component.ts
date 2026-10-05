import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { SupService } from '../../services/sup.service';
import { RentalService } from '../../services/rental.service';
import { IotService } from '../../services/iot.service';
import { Sup, Beach, Rental } from '../../models';
import { TranslatePipe } from '@ngx-translate/core';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';

type Tab = 'dashboard' | 'sups' | 'rentals';

@Component({
    selector: 'app-admin',
    imports: [NgIf, NgFor, TranslatePipe, PageLayoutComponent],
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  activeTab: Tab = 'dashboard';
  sups: Sup[] = [];
  beaches: Beach[] = [];
  rentals: Rental[] = [];
  loading = true;

  mockRentals: Rental[] = [
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

  constructor(
    private supService: SupService,
    private rentalService: RentalService,
    private iotService: IotService
  ) {}

  ngOnInit(): void {
    this.supService.getAllSups().subscribe(sups => { this.sups = sups; });
    this.supService.getAllBeaches().subscribe(beaches => { this.beaches = beaches; });
    this.rentals = this.mockRentals;
    this.loading = false;
  }

  setTab(tab: Tab): void { this.activeTab = tab; }

  getBeachName(beachId: string): string {
    return this.beaches.find(b => b.id === beachId)?.name ?? beachId;
  }

  unlockManual(sup: Sup): void {
    const deviceId = `cabinet-${sup.cabinetNumber}`;
    this.iotService.unlockCabinet(deviceId, 'MANUAL').subscribe(res => {
      alert(res.message);
    });
  }

  get availableCount(): number { return this.sups.filter(s => s.status === '1').length; }
  get rentedCount(): number { return this.sups.filter(s => s.status === '2').length; }
  get todayRevenue(): number {
    const today = new Date().toDateString();
    return this.rentals
      .filter(r => r.status === 'completed' && new Date(r.startTime).toDateString() === today)
      .reduce((sum, r) => sum + r.price, 0);
  }
  get activeRentals(): Rental[] { return this.rentals.filter(r => r.status === 'active'); }
}
