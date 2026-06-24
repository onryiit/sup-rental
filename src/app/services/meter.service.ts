import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

export interface MeterStatus {
  rentalId: string;
  status: string;
  startTime: string;
  elapsedMinutes: number;
  estimatedPrice: number;
  pricePerMinute: number;
  preAuthAmount: number;
  isOverdue: boolean;
  maxMinutes: number;
}

export interface MeterConfig {
  pricePerMinute: number;
  preAuthAmount: number;
  maxHours: number;
}

export interface StartRentalRequest {
  userId: string;
  supId: string;
  qrCode: string;
  beachId: string;
  cabinetNumber: number;
  userName: string;
  userPhone: string;
  userEmail?: string;
}

export interface StartRentalResponse {
  ok: boolean;
  rentalId: string;
  startTime: string;
  pricePerMinute: number;
  preAuthAmount: number;
}

const ACTIVE_RENTAL_KEY = 'sup_active_rental';
const ACTIVE_RENTAL_START = 'sup_active_rental_start';

const CONFIG: MeterConfig = { pricePerMinute: 3, preAuthAmount: 500, maxHours: 24 };

@Injectable({ providedIn: 'root' })
export class MeterService {
  private activeRentalId$ = new BehaviorSubject<string | null>(
    localStorage.getItem(ACTIVE_RENTAL_KEY)
  );

  getConfig(): Observable<MeterConfig> {
    return of(CONFIG);
  }

  startRental(data: StartRentalRequest): Observable<StartRentalResponse> {
    const rentalId = 'RNT-' + Date.now();
    const startTime = new Date().toISOString();
    localStorage.setItem(ACTIVE_RENTAL_START, startTime);
    return of({
      ok: true,
      rentalId,
      startTime,
      pricePerMinute: CONFIG.pricePerMinute,
      preAuthAmount: CONFIG.preAuthAmount,
    });
  }

  getStatus(rentalId: string): Observable<MeterStatus> {
    const startTime = localStorage.getItem(ACTIVE_RENTAL_START) || new Date().toISOString();
    const elapsedMinutes = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
    const maxMinutes = CONFIG.maxHours * 60;
    return of({
      rentalId,
      status: 'active',
      startTime,
      elapsedMinutes,
      estimatedPrice: elapsedMinutes * CONFIG.pricePerMinute,
      pricePerMinute: CONFIG.pricePerMinute,
      preAuthAmount: CONFIG.preAuthAmount,
      isOverdue: elapsedMinutes >= maxMinutes,
      maxMinutes,
    });
  }

  setActiveRentalId(id: string | null): void {
    if (id) localStorage.setItem(ACTIVE_RENTAL_KEY, id);
    else {
      localStorage.removeItem(ACTIVE_RENTAL_KEY);
      localStorage.removeItem(ACTIVE_RENTAL_START);
    }
    this.activeRentalId$.next(id);
  }

  getActiveRentalId(): string | null {
    return localStorage.getItem(ACTIVE_RENTAL_KEY);
  }
}
