import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf, DecimalPipe } from '@angular/common';
import { MeterService, MeterStatus } from '../../services/meter.service';
import { TranslatePipe } from '@ngx-translate/core';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-active-rental',
    imports: [NgIf, RouterLink, DecimalPipe, TranslatePipe, PageLayoutComponent, BreadcrumbComponent],
    templateUrl: './active-rental.component.html',
    styleUrls: ['./active-rental.component.scss']
})
export class ActiveRentalComponent implements OnInit, OnDestroy {
  status: MeterStatus | null = null;
  state: 'loading' | 'active' | 'no-rental' = 'loading';
  private pollInterval: any;

  constructor(private meter: MeterService, private router: Router) {}

  ngOnInit(): void {
    const rentalId = this.meter.getActiveRentalId();
    if (!rentalId) { this.state = 'no-rental'; return; }
    this.fetchStatus(rentalId);
    this.pollInterval = setInterval(() => this.fetchStatus(rentalId), 30000);
  }

  private fetchStatus(rentalId: string): void {
    this.meter.getStatus(rentalId).subscribe({
      next: s => {
        this.status = s;
        this.state = 'active';
        if (s.status === 'completed' || s.status === 'overdue') {
          clearInterval(this.pollInterval);
        }
      },
      error: () => { this.state = 'no-rental'; },
    });
  }

  ngOnDestroy(): void { clearInterval(this.pollInterval); }

  get elapsedDisplay(): string {
    const m = this.status?.elapsedMinutes ?? 0;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h} sa ${min} dk` : `${min} dk`;
  }

  get progressPercent(): number {
    if (!this.status) return 0;
    return Math.min(100, (this.status.elapsedMinutes / this.status.maxMinutes) * 100);
  }

  get progressColor(): string {
    const p = this.progressPercent;
    if (p >= 90) return '#ef4444';
    if (p >= 70) return '#f59e0b';
    return '#0077b6';
  }

  goHome(): void { this.router.navigate(['/home']); }
}
