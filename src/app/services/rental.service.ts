import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Rental, RentalDuration } from '../models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RentalService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private activeRental: Rental | null = null;

  

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

  getAdminRentals(): Observable<{ active: any[]; completed: any[]; all: any[] }> {
    return this.http.get<any>(`${this.apiUrl}/admin/rentals`).pipe(
      map(res => res.data ?? res)
    );
  }

  getUserRentals(userId: string): Observable<Rental[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rentals?userId=${userId}`);
  }
}
