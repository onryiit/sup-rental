import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Card {
  cardId: string;
  cardAlias: string;
  lastFourDigits: string;
  isDefault: boolean;
  createdAt?: number;
}

export interface CardInfo {
  hasCard: boolean;
  cardAlias?: string;
  lastFourDigits?: string;
  // legacy single-card compat — use getCards() for multi-card
}

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/cards`;

  getCards(): Observable<{ cards: Card[] }> {
    return this.http.get<{ cards: Card[] }>(this.base);
  }

  /** Legacy single-card compat used by rental-summary */
  getCard(userId: string): Observable<CardInfo> {
    return new Observable(obs => {
      this.getCards().subscribe({
        next: res => {
          const def = res.cards.find(c => c.isDefault) ?? res.cards[0];
          if (def) obs.next({ hasCard: true, cardAlias: def.cardAlias, lastFourDigits: def.lastFourDigits });
          else     obs.next({ hasCard: false });
          obs.complete();
        },
        error: () => { obs.next({ hasCard: false }); obs.complete(); },
      });
    });
  }

  initCardSave(user: { id: string; name: string; phone: string; email: string }): Observable<{ token: string; checkoutFormContent: string }> {
    return this.http.post<{ token: string; checkoutFormContent: string }>(`${this.base}/init`, { user });
  }

  initRentalForm(data: {
    user: { id: string; name: string; phone: string; email: string };
    supId: string;
    qrCode: string;
    beachId: string;
    cabinetNumber: string | number;
  }): Observable<{ token: string; checkoutFormContent: string }> {
    return this.http.post<{ token: string; checkoutFormContent: string }>(
      `${environment.apiUrl}/rentals/init-form`, data
    );
  }

  deleteCard(cardId: string): Observable<any> {
    return this.http.delete(`${this.base}/${cardId}`);
  }

  setDefaultCard(cardId: string): Observable<any> {
    return this.http.put(`${this.base}/${cardId}/default`, {});
  }

  devInjectCard(userId: string): Observable<{ ok: boolean }> {
    // Dev only — injects a mock card via localStorage flag so profile page shows it
    const mock: Card = { cardId: 'dev-' + Date.now(), cardAlias: 'Test Card', lastFourDigits: '0008', isDefault: true };
    localStorage.setItem('sup_dev_cards', JSON.stringify([mock]));
    return of({ ok: true });
  }
}
