import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

const RESEND_SECONDS = 120;

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

@Component({
    selector: 'app-register',
    imports: [NgIf, RouterLink, ReactiveFormsModule, TranslatePipe],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnDestroy {
  form: FormGroup;
  confirmForm: FormGroup;

  step: 'register' | 'confirm' = 'register';
  pendingEmail    = '';
  pendingPassword = '';

  loading         = false;
  error           = '';
  showPassword    = false;
  showConfirmPw   = false;

  countdown    = 0;
  resending    = false;
  private timer: any;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name:           ['', [Validators.required, Validators.minLength(2)]],
      email:          ['', [Validators.required, Validators.email]],
      phone:          ['', [Validators.required, Validators.pattern(/^(\+90|0)?5\d{9}$/)]],
      tc_id_number:   ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      address:        ['', Validators.required],
      password:       ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword:['', Validators.required],
    }, { validators: passwordsMatch });

    this.confirmForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
    if (this.auth.isLoggedIn) this.router.navigate(['/home']);
  }

  get passwordMismatch(): boolean {
    return !!(this.form.errors?.['passwordMismatch'] &&
              this.form.get('confirmPassword')?.touched);
  }

  submit(): void {
    if (!this.form.valid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const { name, email, phone, password } = this.form.value;
    this.auth.register(name, email, phone, password).subscribe({
      next: () => {
        this.pendingEmail    = email;
        this.pendingPassword = password;
        this.step = 'confirm';
        this.loading = false;
        this.startCountdown();
      },
      error: err => {
        this.error = err.error?.message || 'Kayıt sırasında bir hata oluştu';
        this.loading = false;
      },
    });
  }

  confirmCode(): void {
    if (!this.confirmForm.valid) { this.confirmForm.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const { code } = this.confirmForm.value;
    const { name, phone, tc_id_number, address } = this.form.value;

    this.auth.confirm(this.pendingEmail, code).pipe(
      switchMap(() => this.auth.login(this.pendingEmail, this.pendingPassword)),
      switchMap(() => this.auth.saveUserProfile(name, phone, tc_id_number, address)),
    ).subscribe({
      next: () => this.router.navigate(['/home']),
      error: err => {
        this.error = err.error?.message || 'Doğrulama başarısız';
        this.loading = false;
      },
    });
  }

  resendCode(): void {
    if (this.countdown > 0 || this.resending) return;
    this.resending = true;
    this.error = '';
    this.auth.resendCode(this.pendingEmail).subscribe({
      next: () => {
        this.resending = false;
        this.startCountdown();
      },
      error: err => {
        this.error = err.error?.message || 'Kod gönderilemedi';
        this.resending = false;
      },
    });
  }

  get countdownFormatted(): string {
    const m = Math.floor(this.countdown / 60).toString().padStart(2, '0');
    const s = (this.countdown % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  private startCountdown(): void {
    this.stopCountdown();
    this.countdown = RESEND_SECONDS;
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) this.stopCountdown();
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }
}
