import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models';
import { environment } from '../../environments/environment';

interface AuthTokens {
  idToken: string;
  accessToken: string;
  expiresIn: number;
}

interface StoredSession {
  user: User;
  expiresAt: number; // unix ms
}

const SESSION_KEY = 'sup_session';
const REFRESH_BEFORE_MS = 5 * 60 * 1000; // expire'dan 5 dakika önce yenile

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject  = new BehaviorSubject<User | null>(null);
  private readySubject = new BehaviorSubject<boolean>(false);
  private idToken: string | null = null;
  private refreshTimer: any = null;

  user$  = this.userSubject.asObservable();
  ready$ = this.readySubject.asObservable(); // guard bunu bekler

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): User | null  { return this.userSubject.value; }
  get isLoggedIn(): boolean       { return !!this.currentUser && !!this.idToken; }
  get isReady(): boolean          { return this.readySubject.value; }
  get bearerToken(): string | null { return this.idToken; }

  /** AppComponent ngOnInit'ten çağrılır */
  initSession(): void {
    const session = this.loadSession();

    if (!session) {
      this.readySubject.next(true);
      return;
    }

    const msLeft = session.expiresAt - Date.now();

    if (msLeft > 0) {
      // Token hâlâ geçerli ama yakın zamanda expire olacaksa refresh yap
      if (msLeft < REFRESH_BEFORE_MS) {
        this.doRefresh(session.user);
      } else {
        // Token geçerli — refresh cookie'den yeni idToken al
        this.doRefresh(session.user);
      }
    } else {
      // Token süresi dolmuş, refresh cookie ile yenile
      this.doRefresh(session.user);
    }
  }

  private doRefresh(fallbackUser?: User): void {
    this.http.post<AuthTokens>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .subscribe({
        next: tokens => {
          this.applyTokens(tokens, fallbackUser);
          this.readySubject.next(true);
        },
        error: () => {
          // Refresh cookie süresi de dolmuş
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

  login(email: string, password: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(
      `${environment.apiUrl}/auth/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(tokens => this.applyTokens(tokens))
    );
  }

  refresh(): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(
      `${environment.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(tokens => {
        this.idToken = tokens.idToken;
        this.scheduleRefresh(tokens.expiresIn);
        this.updateStoredExpiry(tokens.expiresIn);
      })
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({ error: () => {} });
    this.clearSession();
  }

  // ── Private helpers ───────────────────────────────────────────────

  private applyTokens(tokens: AuthTokens, existingUser?: User): void {
    this.idToken = tokens.idToken;

    const payload = this.decodeJwtPayload(tokens.idToken);
    const user: User = existingUser ?? {
      id:    payload.sub,
      name:  payload.name  || '',
      email: payload.email || '',
      phone: payload.phone_number || '',
    };

    const expiresAt = Date.now() + tokens.expiresIn * 1000;
    this.saveSession({ user, expiresAt });
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

  private updateStoredExpiry(expiresIn: number): void {
    const session = this.loadSession();
    if (session) {
      session.expiresAt = Date.now() + expiresIn * 1000;
      this.saveSession(session);
    }
  }

  private saveSession(session: StoredSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.userSubject.next(session.user);
  }

  private loadSession(): StoredSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private clearSession(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    localStorage.removeItem(SESSION_KEY);
    this.userSubject.next(null);
    this.idToken = null;
    this.router.navigate(['/login']);
  }

  private decodeJwtPayload(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch { return {}; }
  }
}
