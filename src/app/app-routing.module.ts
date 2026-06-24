import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { QrScannerComponent } from './pages/qr-scanner/qr-scanner.component';
import { RentalSummaryComponent } from './pages/rental-summary/rental-summary.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { RentalSuccessComponent } from './pages/rental-success/rental-success.component';
import { AdminComponent } from './pages/admin/admin.component';
import { CardSetupComponent } from './pages/card-setup/card-setup.component';
import { ActiveRentalComponent } from './pages/active-rental/active-rental.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'scan', component: QrScannerComponent, canActivate: [authGuard] },
  // QR'den direkt gelen link: /rent?qr=QR-OLUD-001
  { path: 'rent', component: RentalSummaryComponent },
  // QR scan sonrası özet
  { path: 'summary/:qrCode', component: RentalSummaryComponent, canActivate: [authGuard] },
  { path: 'payment/:rentalId', component: PaymentComponent, canActivate: [authGuard] },
  { path: 'success', component: RentalSuccessComponent, canActivate: [authGuard] },
  { path: 'card-setup', component: CardSetupComponent, canActivate: [authGuard] },
  { path: 'active-rental', component: ActiveRentalComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
