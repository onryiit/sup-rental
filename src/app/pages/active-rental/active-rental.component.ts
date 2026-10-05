import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf, DecimalPipe } from '@angular/common';
import { MeterService, MeterStatus } from '../../services/meter.service';
import { TranslatePipe } from '@ngx-translate/core';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-active-rental',
  imports: [NgIf, DecimalPipe, TranslatePipe, PageLayoutComponent, BreadcrumbComponent],
  templateUrl: './active-rental.component.html',
  styleUrls: ['./active-rental.component.scss']
})
export class ActiveRentalComponent implements OnInit, OnDestroy {
  status: MeterStatus | null = null;
  state: 'loading' | 'active' | 'no-rental' | 'returning' = 'loading';
  private rentalId: string | null = null;
  private pollInterval: any;

  constructor(private meter: MeterService, private router: Router) {}

  ngOnInit(): void {
    this.meter.getMyRentals().subscribe({
      next: res => {
        if (!res.active) { this.state = 'no-rental'; return; }
        this.rentalId = res.active.id;
        this.fetchStatus();
        this.pollInterval = setInterval(() => this.fetchStatus(), 30000);
      },
      error: () => { this.state = 'no-rental'; },
    });
  }

  private fetchStatus(): void {
    if (!this.rentalId) return;
    this.meter.getStatus(this.rentalId).subscribe({
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

  returnSup(): void {
    if (!this.rentalId) return;
    clearInterval(this.pollInterval);
    this.state = 'returning';
    this.meter.returnSup(this.rentalId).subscribe({
      next: res => {
        console.log('[returnSup] success', res);
        this.router.navigate(['/home'], {
          queryParams: {
            returned: '1',
            minutes: res.actualMinutes ?? 0,
            price: res.actualPrice ?? 0,
          }
        });
      },
      error: (err) => {
        console.error('[returnSup] error', err);
        this.state = 'active';
        clearInterval(this.pollInterval);
        this.pollInterval = setInterval(() => this.fetchStatus(), 30000);
      },
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
