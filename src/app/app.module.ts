import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AuthInterceptor } from './interceptors/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QrLandingComponent } from './pages/qr-landing/qr-landing.component';
import { RentalFlowComponent } from './pages/rental-flow/rental-flow.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { RentalSuccessComponent } from './pages/rental-success/rental-success.component';
import { AdminComponent } from './pages/admin/admin.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { QrScannerComponent } from './pages/qr-scanner/qr-scanner.component';
import { RentalSummaryComponent } from './pages/rental-summary/rental-summary.component';
import { CardSetupComponent } from './pages/card-setup/card-setup.component';
import { ActiveRentalComponent } from './pages/active-rental/active-rental.component';

@NgModule({
  declarations: [
    AppComponent,
    QrLandingComponent,
    RentalFlowComponent,
    PaymentComponent,
    RentalSuccessComponent,
    AdminComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    QrScannerComponent,
    RentalSummaryComponent,
    CardSetupComponent,
    ActiveRentalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    DecimalPipe,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
