import { Component, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { navigation, NavItem } from '../../navigation/navigation';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Output() sidebarToggled = new EventEmitter<boolean>();

  sidebarOpen = false;

  // Track which collapsable group is currently expanded (by item id)
  expandedGroup: string | null = null;

  // Navigation items are sourced entirely from /navigation/navigation.ts
  readonly allItems: NavItem[] = navigation;

  constructor(public auth: AuthService, public lang: LanguageService, public router: Router) {
    // Auto-expand the group that matches the current route on load
    this.syncExpanded();
    this.router.events.subscribe(() => this.syncExpanded());
  }

  // Returns only items the current user is allowed to see
  get visibleItems(): NavItem[] {
    return this.allItems.filter(i => !i.adminOnly || this.auth.isAdmin);
  }

  // Expand the collapsable group whose child url matches the current route
  private syncExpanded(): void {
    const url = this.router.url;
    for (const item of this.allItems) {
      if (item.type === 'collapsable' && item.children?.some(c => url.startsWith(c.url ?? ''))) {
        this.expandedGroup = item.id;
        return;
      }
    }
  }

  toggleGroup(id: string): void {
    this.expandedGroup = this.expandedGroup === id ? null : id;
  }

  isGroupExpanded(id: string): boolean {
    return this.expandedGroup === id;
  }

  // Returns true when the current route falls inside a collapsable group
  isGroupActive(item: NavItem): boolean {
    return !!item.children?.some(c => this.router.url.startsWith(c.url ?? ''));
  }

  logout(): void { this.auth.logout(); }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.sidebarToggled.emit(this.sidebarOpen);
  }
}
