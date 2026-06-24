import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Beach, Sup, RentalDuration } from '../models';
import { environment } from '../../environments/environment';

const MOCK_BEACHES: Beach[] = [
  { id: 'beach-001', name: 'Ölüdeniz Plajı', location: 'Fethiye, Muğla', coordinates: { lat: 36.5500, lng: 29.1167 } },
  { id: 'beach-002', name: 'Patara Plajı', location: 'Kaş, Antalya', coordinates: { lat: 36.2667, lng: 29.3167 } },
];

const MOCK_SUPS: Sup[] = [
  { id: 'sup-001', qrCode: 'QR-OLUD-001', beachId: 'beach-001', cabinetNumber: 1, status: 'available', name: 'SUP #1 - Mavi' },
  { id: 'sup-002', qrCode: 'QR-OLUD-002', beachId: 'beach-001', cabinetNumber: 2, status: 'rented', name: 'SUP #2 - Kırmızı' },
  { id: 'sup-003', qrCode: 'QR-PATA-001', beachId: 'beach-002', cabinetNumber: 1, status: 'available', name: 'SUP #3 - Sarı' },
];

export const RENTAL_DURATIONS: RentalDuration[] = [
  { minutes: 30, label: '30 Dakika', price: 150 },
  { minutes: 60, label: '1 Saat', price: 250 },
  { minutes: 120, label: '2 Saat', price: 400 },
  { minutes: 180, label: '3 Saat', price: 550 },
];

@Injectable({ providedIn: 'root' })
export class SupService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSupByQrCode(qrCode: string): Observable<Sup | null> {
    // TODO: this.http.get<Sup>(`${this.apiUrl}/sups/qr/${qrCode}`)
    const sup = MOCK_SUPS.find(s => s.qrCode === qrCode) ?? null;
    return of(sup);
  }

  getBeach(beachId: string): Observable<Beach | null> {
    // TODO: this.http.get<Beach>(`${this.apiUrl}/beaches/${beachId}`)
    const beach = MOCK_BEACHES.find(b => b.id === beachId) ?? null;
    return of(beach);
  }

  getAllSups(): Observable<Sup[]> {
    // TODO: this.http.get<Sup[]>(`${this.apiUrl}/sups`)
    return of(MOCK_SUPS);
  }

  getAllBeaches(): Observable<Beach[]> {
    // TODO: this.http.get<Beach[]>(`${this.apiUrl}/beaches`)
    return of(MOCK_BEACHES);
  }

  getRentalDurations(): RentalDuration[] {
    return RENTAL_DURATIONS;
  }
}
