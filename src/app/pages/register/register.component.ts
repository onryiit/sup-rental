import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  form: FormGroup;
  confirmForm: FormGroup;

  step: 'register' | 'confirm' = 'register';
  pendingEmail = '';

  loading = false;
  error   = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      phone:    ['', [Validators.required, Validators.pattern(/^(\+90|0)?5\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    this.confirmForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
    if (this.auth.isLoggedIn) this.router.navigate(['/home']);
  }

  submit(): void {
    if (!this.form.valid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const { name, email, phone, password } = this.form.value;
    this.auth.register(name, email, phone, password).subscribe({
      next: () => {
        this.pendingEmail = email;
        this.step = 'confirm';
        this.loading = false;
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
    this.auth.confirm(this.pendingEmail, code).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { confirmed: '1' } }),
      error: err => {
        this.error = err.error?.message || 'Doğrulama başarısız';
        this.loading = false;
      },
    });
  }
}
