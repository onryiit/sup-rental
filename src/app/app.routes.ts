import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/permissions.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(c => c.RegisterComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'scan',
    loadComponent: () => import('./pages/qr-scanner/qr-scanner.component').then(c => c.QrScannerComponent),
    canActivate: [authGuard],
  },
  {
    path: 'rent',
    loadComponent: () => import('./pages/rental-summary/rental-summary.component').then(c => c.RentalSummaryComponent),
  },
  {
    path: 'summary/:qrCode',
    loadComponent: () => import('./pages/rental-summary/rental-summary.component').then(c => c.RentalSummaryComponent),
    canActivate: [authGuard],
  },
  {
    path: 'payment/:rentalId',
    loadComponent: () => import('./pages/payment/payment.component').then(c => c.PaymentComponent),
    canActivate: [authGuard],
  },
  {
    path: 'success',
    loadComponent: () => import('./pages/rental-success/rental-success.component').then(c => c.RentalSuccessComponent),
    canActivate: [authGuard],
  },
  {
    path: 'card-setup',
    loadComponent: () => import('./pages/card-setup/card-setup.component').then(c => c.CardSetupComponent),
    canActivate: [authGuard],
  },
  {
    path: 'active-rental',
    loadComponent: () => import('./pages/active-rental/active-rental.component').then(c => c.ActiveRentalComponent),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent),
      },
      {
        path: 'sups',
        loadComponent: () => import('./pages/admin/sups/admin-sups.component').then(c => c.AdminSupsComponent),
      },
      {
        path: 'rentals',
        loadComponent: () => import('./pages/admin/rentals/admin-rentals.component').then(c => c.AdminRentalsComponent),
      },
    ],
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
