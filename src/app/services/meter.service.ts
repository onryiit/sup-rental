import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  cardId?: string | null;
}

export interface StartRentalResponse {
  ok: boolean;
  rentalId: string;
  startTime: string;
  pricePerMinute: number;
  preAuthAmount: number;
}

export interface MyRentalsResponse {
  active: any | null;
  history: any[];
}

@Injectable({ providedIn: 'root' })
export class MeterService {
  constructor(private http: HttpClient) {}

  getConfig(): Observable<MeterConfig> {
    return of({ pricePerMinute: 3, preAuthAmount: 500, maxHours: 24 });
  }

  getMyRentals(): Observable<MyRentalsResponse> {
    return this.http.get<any>(`${environment.apiUrl}/rentals/my`).pipe(
      map(res => res.data ?? res)
    );
  }

  getStatus(rentalId: string): Observable<MeterStatus> {
    return this.http.get<any>(`${environment.apiUrl}/meter/status/${rentalId}`).pipe(
      map(res => res.data ?? res)
    );
  }

  returnSup(rentalId: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/meter/return`, { rentalId }).pipe(
      map(res => res.data ?? res)
    );
  }
}
