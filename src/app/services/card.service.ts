import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface CardInfo {
  hasCard: boolean;
  cardAlias?: string;
  lastFourDigits?: string;
}

const CARD_KEY = 'sup_mock_card';

@Injectable({ providedIn: 'root' })
export class CardService {

  getCard(userId: string): Observable<CardInfo> {
    const stored = localStorage.getItem(CARD_KEY);
    if (stored) return of(JSON.parse(stored));
    return of({ hasCard: false });
  }

  devInjectCard(userId: string): Observable<{ ok: boolean }> {
    const card: CardInfo = { hasCard: true, cardAlias: 'Test Kartı', lastFourDigits: '0008' };
    localStorage.setItem(CARD_KEY, JSON.stringify(card));
    return of({ ok: true });
  }

  deleteCard(userId: string): Observable<{ ok: boolean }> {
    localStorage.removeItem(CARD_KEY);
    return of({ ok: true });
  }

  // iyzico form başlatma — mock modda kullanılmıyor, dev-inject yeterli
  initCardSave(user: any): Observable<{ token: string; checkoutFormContent: string }> {
    return of({ token: 'mock-token', checkoutFormContent: '' });
  }
}
