import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Rental } from '../models';

export interface CheckoutFormResponse {
  token: string;
  checkoutFormContent: string;
}

export interface PaymentResultResponse {
  success: boolean;
  paymentId?: string;
  rental?: Rental;
  error?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {

  initCheckoutForm(rental: Rental, user: any): Observable<CheckoutFormResponse> {
    return of({ token: 'mock-token', checkoutFormContent: '' });
  }

  getPaymentResult(token: string): Observable<PaymentResultResponse> {
    return of({ success: true, status: 'SUCCESS' });
  }
}
