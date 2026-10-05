import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs'; // 'of' mock metodlar için
import { Beach, Sup, RentalDuration, ApiResponse } from '../models';
import { environment } from '../../environments/environment';



export const RENTAL_DURATIONS: RentalDuration[] = [
  { minutes: 30, label: '30 Dakika', price: 150 },
  { minutes: 60, label: '1 Saat', price: 250 },
  { minutes: 120, label: '2 Saat', price: 400 },
  { minutes: 180, label: '3 Saat', price: 550 },
];

@Injectable({ providedIn: 'root' })
export class SupService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;



  getSupByQrCode(qrCode: string): Observable<Sup | null> {
    return this.http.get<ApiResponse<Sup>>(`${this.apiUrl}/sups/qr/${qrCode}`).pipe(
          map(res => {
            return res.data
          })
        );
  }

  getBeach(beachId: string): Observable<Beach | null> {
    return this.http.get<ApiResponse<Beach>>(`${this.apiUrl}/beaches/${beachId}`).pipe(
          map(res => {
            return res.data
          })
        );
  }

  getAllSups(): Observable<Sup[]> {
    return this.http.get<ApiResponse<Sup[]>>(`${this.apiUrl}/sups`).pipe(
      map(res => {
        return res.data
      })
    );
  }

  getAllBeaches(): Observable<Beach[]> {
     return this.http.get<ApiResponse<Beach[]>>(`${this.apiUrl}/beaches`).pipe(
      map(res => {
        return res.data
      })
    );
  }

  getRentalDurations(): RentalDuration[] {
    return RENTAL_DURATIONS;
  }

  createSup(sup: any): Observable<Sup> {
    return this.http.post<ApiResponse<{ id: string }>>(`${this.apiUrl}/sups`, sup).pipe(
      map(res => ({ ...sup }))
    );
  }
}
