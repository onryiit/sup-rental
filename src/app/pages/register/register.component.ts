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
  loading = false;
  error = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+90|0)?5\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    if (this.auth.isLoggedIn) this.router.navigate(['/home']);
  }

  submit(): void {
    if (!this.form.valid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const { name, email, phone, password } = this.form.value;
    this.auth.register(name, email, phone, password).subscribe({
      next: user => { this.auth.setUser(user); this.router.navigate(['/home']); },
      error: err => { this.error = err.message; this.loading = false; },
    });
  }
}
