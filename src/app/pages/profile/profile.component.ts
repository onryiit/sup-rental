import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CardService, Card } from '../../services/card.service';
import { TranslatePipe } from '@ngx-translate/core';
import { PageLayoutComponent } from '../../components/page-layout/page-layout.component';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('newPassword')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  imports: [NgIf, NgFor, ReactiveFormsModule, TranslatePipe, PageLayoutComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  pwForm: FormGroup;

  profileLoading = true;
  profileSaving  = false;
  profileSuccess = false;
  profileError   = '';

  pwSaving   = false;
  pwSuccess  = false;
  pwError    = '';
  showOldPw  = false;
  showNewPw  = false;
  showCnfPw  = false;

  cards: Card[]  = [];
  cardLoading    = true;
  cardFormShown  = false;
  cardError      = '';
  cardSuccess    = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private card: CardService,
    private route: ActivatedRoute,
  ) {
    this.profileForm = this.fb.group({
      name:         ['', [Validators.required, Validators.minLength(2)]],
      telephone_no: ['', [Validators.required, Validators.pattern(/^(\+90|0)?5\d{9}$/)]],
      tc_id_number: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      address:      ['', Validators.required],
    });

    this.pwForm = this.fb.group({
      oldPassword:     ['', [Validators.required, Validators.minLength(8)]],
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordsMatch });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadCards();

    // Handle redirect from iyzico callback
    const status = this.route.snapshot.queryParamMap.get('cardStatus');
    if (status === 'success') this.cardSuccess = 'CARD.SUCCESS_TITLE';
    if (status === 'error')   this.cardError   = this.route.snapshot.queryParamMap.get('msg') || 'Card save failed';
  }

  get pwMismatch(): boolean {
    return !!(this.pwForm.errors?.['passwordMismatch'] && this.pwForm.get('confirmPassword')?.touched);
  }

  // ── Personal info ──────────────────────────────────────────────────

  loadProfile(): void {
    this.auth.getUserProfile().subscribe({
      next: res => { this.profileForm.patchValue(res.data); this.profileLoading = false; },
      error: () => {
        const u = this.auth.currentUser;
        if (u) this.profileForm.patchValue({ name: u.name, telephone_no: u.phone });
        this.profileLoading = false;
      },
    });
  }

  saveProfile(): void {
    if (!this.profileForm.valid) { this.profileForm.markAllAsTouched(); return; }
    this.profileSaving = true;
    this.profileSuccess = false;
    this.profileError = '';
    const { name, telephone_no, tc_id_number, address } = this.profileForm.value;
    this.auth.saveUserProfile(name, telephone_no, tc_id_number, address).subscribe({
      next: () => { this.profileSaving = false; this.profileSuccess = true; setTimeout(() => this.profileSuccess = false, 3000); },
      error: err => { this.profileSaving = false; this.profileError = err.error?.message || 'Could not save'; },
    });
  }

  // ── Password ───────────────────────────────────────────────────────

  changePassword(): void {
    if (!this.pwForm.valid) { this.pwForm.markAllAsTouched(); return; }
    this.pwSaving = true;
    this.pwSuccess = false;
    this.pwError = '';
    const { oldPassword, newPassword } = this.pwForm.value;
    this.auth.changePassword(oldPassword, newPassword).subscribe({
      next: () => { this.pwSaving = false; this.pwSuccess = true; this.pwForm.reset(); setTimeout(() => this.pwSuccess = false, 4000); },
      error: err => {
        this.pwSaving = false;
        this.pwError = err.error?.message || 'Could not change password';
      },
    });
  }

  // ── Cards ──────────────────────────────────────────────────────────

  loadCards(): void {
    this.cardLoading = true;
    this.card.getCards().subscribe({
      next: res => { this.cards = res.cards; this.cardLoading = false; },
      error: () => { this.cardLoading = false; },
    });
  }

  showAddCardForm(): void {
    this.cardFormShown = true;
    this.cardError = '';
    setTimeout(() => this.initCardForm(), 80);
  }

  private initCardForm(): void {
    const user = this.auth.currentUser!;
    this.card.initCardSave({ id: user.id, name: user.name, phone: user.phone, email: user.email }).subscribe({
      next: res => {
        setTimeout(() => {
          const el = document.getElementById('iyzipay-checkout-form-profile');
          if (!el) return;
          el.innerHTML = res.checkoutFormContent;
          Array.from(el.querySelectorAll('script')).forEach((old: any) => {
            const s = document.createElement('script');
            Array.from(old.attributes).forEach((a: any) => s.setAttribute(a.name, a.value));
            s.textContent = old.textContent;
            old.parentNode.replaceChild(s, old);
          });
        }, 80);
      },
      error: err => { this.cardError = err.error?.message || err.error?.error || err.message || 'Form could not be initialized'; },
    });
  }

  deleteCard(cardId: string): void {
    if (!confirm('Are you sure you want to remove this card?')) return;
    this.card.deleteCard(cardId).subscribe({ next: () => this.loadCards() });
  }

  setDefault(cardId: string): void {
    this.card.setDefaultCard(cardId).subscribe({ next: () => this.loadCards() });
  }

  devInject(): void {
    const user = this.auth.currentUser!;
    this.card.devInjectCard(user.id).subscribe({ next: () => this.loadCards() });
  }
}
