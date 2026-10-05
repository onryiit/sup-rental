import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SupService } from '../../../services/sup.service';
import { RentalService } from '../../../services/rental.service';
import { Sup, Beach } from '../../../models';
import { PageLayoutComponent } from '../../../components/page-layout/page-layout.component';
import { BreadcrumbComponent } from '../../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, TranslatePipe, PageLayoutComponent, BreadcrumbComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['../admin-shared.scss'],
})
export class AdminDashboardComponent implements OnInit {
  sups: Sup[] = [];
  beaches: Beach[] = [];
  activeRentals: any[] = [];
  completedRentals: any[] = [];
  loading = true;

  constructor(private supService: SupService, private rentalService: RentalService) {}

  ngOnInit(): void {
    this.supService.getAllSups().subscribe(s => this.sups = s);
    this.supService.getAllBeaches().subscribe(b => this.beaches = b);

    this.rentalService.getAdminRentals().subscribe({
      next: res => {
        this.activeRentals    = res.active;
        this.completedRentals = res.completed;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  getBeachName(beachId: string): string {
    return this.beaches.find(b => b.id === beachId)?.name ?? beachId;
  }

  get availableCount(): number { return this.sups.filter(s => s.status === '1').length; }
  get rentedCount(): number    { return this.sups.filter(s => s.status === '2').length; }

  get todayRevenue(): number {
    const today = new Date().toDateString();
    return this.completedRentals
      .filter(r => new Date(r.startTime).toDateString() === today)
      .reduce((sum, r) => sum + (r.actualPrice ?? 0), 0);
  }
}
