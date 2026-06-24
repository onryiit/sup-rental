import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Rental, RentalDuration } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RentalService {
  private apiUrl = environment.apiUrl;
  private activeRental: Rental | null = null;

  constructor(private http: HttpClient) {}

  createRental(supId: string, qrCode: string, beachId: string, cabinetNumber: number, duration: RentalDuration, phone: string): Observable<Rental> {
    const now = new Date();
    const rental: Rental = {
      id: 'RNT-' + Date.now(),
      supId,
      qrCode,
      beachId,
      cabinetNumber,
      startTime: now,
      endTime: new Date(now.getTime() + duration.minutes * 60000),
      durationMinutes: duration.minutes,
      price: duration.price,
      status: 'pending_payment',
      phoneNumber: phone,
    };
    this.activeRental = rental;
    // TODO: this.http.post<Rental>(`${this.apiUrl}/rentals`, rental)
    return of(rental);
  }

  confirmPayment(rentalId: string, paymentRef: string): Observable<Rental> {
    if (this.activeRental && this.activeRental.id === rentalId) {
      this.activeRental.status = 'active';
      this.activeRental.paymentRef = paymentRef;
    }
    // TODO: this.http.patch<Rental>(`${this.apiUrl}/rentals/${rentalId}/confirm`, { paymentRef })
    return of(this.activeRental!);
  }

  getActiveRental(): Rental | null {
    return this.activeRental;
  }

  setActiveRental(rental: Rental): void {
    this.activeRental = rental;
  }

  getAdminRentals(): Observable<Rental[]> {
    // TODO: this.http.get<Rental[]>(`${this.apiUrl}/rentals`)
    return of(this.mockHistory);
  }

  getUserRentals(userId: string): Observable<Rental[]> {
    // TODO: this.http.get<Rental[]>(`${this.apiUrl}/rentals?userId=${userId}`)
    return of(this.mockHistory);
  }

  private mockHistory: Rental[] = [
    {
      id: 'RNT-0011', supId: 'sup-001', qrCode: 'QR-OLUD-001', beachId: 'beach-001',
      cabinetNumber: 1, startTime: new Date(Date.now() - 2 * 86400000),
      endTime: new Date(Date.now() - 2 * 86400000 + 3600000),
      durationMinutes: 60, price: 250, paymentRef: 'PAYTR-8821',
      status: 'completed', phoneNumber: '05301234567',
    },
    {
      id: 'RNT-0008', supId: 'sup-003', qrCode: 'QR-PATA-001', beachId: 'beach-002',
      cabinetNumber: 1, startTime: new Date(Date.now() - 5 * 86400000),
      endTime: new Date(Date.now() - 5 * 86400000 + 7200000),
      durationMinutes: 120, price: 400, paymentRef: 'PAYTR-7743',
      status: 'completed', phoneNumber: '05301234567',
    },
  ];
}
