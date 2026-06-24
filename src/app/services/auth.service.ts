import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models';
import { environment } from '../../environments/environment';

const STORAGE_KEY = 'sup_user';

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Ali Yılmaz', email: 'ali@test.com', phone: '05301234567', token: 'tok_u1' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  get currentUser(): User | null { return this.userSubject.value; }
  get isLoggedIn(): boolean { return !!this.currentUser; }

  login(email: string, password: string): Observable<User> {
    // TODO: this.http.post<User>(`${environment.apiUrl}/auth/login`, { email, password })
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user || password !== '123456') {
      return throwError(() => new Error('E-posta veya şifre hatalı'));
    }
    return of(user).pipe(delay(800));
  }

  register(name: string, email: string, phone: string, password: string): Observable<User> {
    // TODO: this.http.post<User>(`${environment.apiUrl}/auth/register`, { name, email, phone, password })
    const newUser: User = { id: 'u' + Date.now(), name, email, phone, token: 'tok_' + Date.now() };
    MOCK_USERS.push(newUser);
    return of(newUser).pipe(delay(1000));
  }

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
