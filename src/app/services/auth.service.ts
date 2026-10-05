import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models';
import { environment } from '../../environments/environment';

interface AuthTokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

const USER_KEY = 'sup_user';
const REFRESH_TOKEN_KEY = 'sup_rft';
const REFRESH_BEFORE_MS = 5 * 60 * 1000;
const AUTH_OPTIONS = { withCredentials: true };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private userSubject = new BehaviorSubject<User | null>(null);
  private readySubject = new BehaviorSubject<boolean>(false);

  private idToken: string | null = null;
  private accessToken: string | null = null;
  private refreshTimer: any = null;

  user$ = this.userSubject.asObservable();
  ready$ = this.readySubject.asObservable();

  constructor(private router: Router) { }

  get currentUser(): User | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!this.currentUser && !!this.idToken; }
  get isReady(): boolean { return this.readySubject.value; }
  get bearerToken(): string | null { return this.idToken; }
  get isAdmin(): boolean { return !!this.currentUser?.roles?.includes('Admin'); }
  get currentAccessToken(): string | null { return this.accessToken; }

  initSession(): void {
    const user = this.loadUser();
    if (user) this.userSubject.next(user);
    this.doRefresh(user ?? undefined);
  }

  private doRefresh(fallbackUser?: User): void {
    const rft = localStorage.getItem(REFRESH_TOKEN_KEY);
    this.http.post<AuthTokens>(
      `${environment.apiUrl}/auth/refresh`,
      rft ? { refreshToken: rft } : {},
      AUTH_OPTIONS,
    ).subscribe({
      next: tokens => {
        this.applyTokens(tokens, fallbackUser);
        this.readySubject.next(true);
      },
      error: () => {
        this.clearSession();
        this.readySubject.next(true);
      },
    });
  }

  register(name: string, email: string, phone: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, { name, email, phone, password });
  }

  confirm(email: string, code: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/confirm`, { email, code });
  }

  resendCode(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/resend`, { email });
  }

  saveUserProfile(name: string, telephone_no: string, tc_id_number: string, address: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/user`, { name, telephone_no, tc_id_number, address });
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/auth/user`);
  }

  changePassword(previousPassword: string, proposedPassword: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/auth/change-password`,
      { accessToken: this.accessToken, previousPassword, proposedPassword },
    );
  }

  login(email: string, password: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(
      `${environment.apiUrl}/auth/login`,
      { email, password },
      AUTH_OPTIONS,
    ).pipe(
      tap(tokens => this.applyTokens(tokens))
    );
  }

  refresh(): Observable<AuthTokens> {
    const rft = localStorage.getItem(REFRESH_TOKEN_KEY);
    return this.http.post<AuthTokens>(
      `${environment.apiUrl}/auth/refresh`,
      rft ? { refreshToken: rft } : {},
      AUTH_OPTIONS,
    ).pipe(
      tap(tokens => {
        this.idToken = tokens.idToken;
        this.scheduleRefresh(tokens.expiresIn);
      })
    );
  }

  logout(): void {
    this.http.post(
      `${environment.apiUrl}/auth/logout`,
      { accessToken: this.accessToken },
      AUTH_OPTIONS,
    ).subscribe({ error: () => { } });
    this.clearSession();
  }

  // ── Private helpers ───────────────────────────────────────────────

  private applyTokens(tokens: AuthTokens, existingUser?: User): void {
    this.idToken = tokens.idToken;
    this.accessToken = tokens.accessToken;

    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }

    const payload = this.decodeJwtPayload(tokens.idToken);
    const user: User = existingUser ?? {
      id: payload.sub,
      name: payload.name || [payload.given_name, payload.family_name].filter(Boolean).join(' ') || '',
      email: payload.email || '',
      phone: payload.phone_number || '',
      roles: payload['cognito:groups'] || [],
    };

    this.saveUser(user);
    this.userSubject.next(user);
    this.scheduleRefresh(tokens.expiresIn);
  }

  private scheduleRefresh(expiresIn: number): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    const delay = Math.max((expiresIn * 1000) - REFRESH_BEFORE_MS, 0);
    this.refreshTimer = setTimeout(() => {
      this.doRefresh(this.currentUser ?? undefined);
    }, delay);
  }

  private saveUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private clearSession(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.userSubject.next(null);
    this.idToken = null;
    this.accessToken = null;
    this.router.navigate(['/login']);
  }

  private decodeJwtPayload(token: string): any {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
      );
      return JSON.parse(json);
    } catch { return {}; }
  }
}
