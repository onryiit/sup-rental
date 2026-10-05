import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { RentalService } from '../../../services/rental.service';
import { PageLayoutComponent } from '../../../components/page-layout/page-layout.component';
import { BreadcrumbComponent } from '../../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-admin-rentals',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, TranslatePipe, PageLayoutComponent, BreadcrumbComponent],
  templateUrl: './admin-rentals.component.html',
  styleUrls: ['../admin-shared.scss'],
})
export class AdminRentalsComponent implements OnInit {
  rentals: any[] = [];
  loading = true;

  constructor(private rentalService: RentalService) {}

  ngOnInit(): void {
    this.rentalService.getAdminRentals().subscribe({
      next: res => {
        this.rentals = res.all;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  formatDuration(r: any): string {
    if (r.actualMinutes != null) return `${r.actualMinutes} dk`;
    if (r.elapsedMinutes != null) return `${r.elapsedMinutes} dk (aktif)`;
    return '-';
  }

  formatPrice(r: any): string {
    if (r.actualPrice != null) return `₺${r.actualPrice}`;
    if (r.estimatedPrice != null) return `~₺${r.estimatedPrice}`;
    return '-';
  }
}
