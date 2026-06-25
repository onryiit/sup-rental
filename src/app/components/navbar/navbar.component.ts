import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, NgClass, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Output() sidebarToggled = new EventEmitter<boolean>();

  sidebarOpen = false;

  readonly items: NavItem[] = [
    { label: 'NAV.HOME',   path: '/home',          icon: 'home' },
    { label: 'NAV.SCAN',   path: '/scan',          icon: 'qr_code_scanner' },
    { label: 'NAV.RENTAL', path: '/active-rental', icon: 'surfing' },
    { label: 'NAV.CARD',   path: '/card-setup',    icon: 'credit_card' },
    { label: 'NAV.ADMIN',  path: '/admin',         icon: 'admin_panel_settings', adminOnly: true },
  ];

  constructor(public auth: AuthService, public lang: LanguageService) {}

  get visibleItems(): NavItem[] {
    return this.items.filter(i => !i.adminOnly || this.auth.isAdmin);
  }

  logout(): void { this.auth.logout(); }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.sidebarToggled.emit(this.sidebarOpen);
  }
}
