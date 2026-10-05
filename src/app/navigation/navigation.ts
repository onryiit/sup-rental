// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION CONFIG
//
// This is the single source of truth for the sidebar navigation.
// To add a new menu item:
//   - type: 'item'        → a regular link
//   - type: 'collapsable' → an accordion group with children
//
// Fields:
//   id          unique identifier (kebab-case)
//   title       fallback display name (used if translate key is missing)
//   translate   i18n key resolved by ngx-translate
//   type        'item' | 'collapsable'
//   icon        Material Symbols icon name
//   url         route path (only for type: 'item')
//   adminOnly   if true, hidden for non-admin users
//   children    sub-items (only for type: 'collapsable')
// ─────────────────────────────────────────────────────────────────────────────

export type NavItemType = 'item' | 'collapsable';

export interface NavItem {
  id: string;
  title: string;
  translate: string;
  type: NavItemType;
  icon: string;
  url?: string;
  adminOnly?: boolean;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    id: 'home',
    title: 'Home',
    translate: 'NAV.HOME',
    type: 'item',
    icon: 'home',
    url: '/home',
  },
  {
    id: 'scan',
    title: 'Scan',
    translate: 'NAV.SCAN',
    type: 'item',
    icon: 'qr_code_scanner',
    url: '/scan',
  },
  {
    id: 'active-rental',
    title: 'Rental',
    translate: 'NAV.RENTAL',
    type: 'item',
    icon: 'surfing',
    url: '/active-rental',
  },
  {
    id: 'profile',
    title: 'Profile',
    translate: 'NAV.PROFILE',
    type: 'item',
    icon: 'manage_accounts',
    url: '/profile',
  },

  // ── Admin group ────────────────────────────────────────────────────────────
  // Add new admin sub-pages as children here. The parent is collapsable
  // (accordion) and will only be visible to admin users.
  {
    id: 'admin',
    title: 'Admin',
    translate: 'NAV.ADMIN',
    type: 'collapsable',
    icon: 'admin_panel_settings',
    adminOnly: true,
    children: [
      {
        id: 'admin-dashboard',
        title: 'Dashboard',
        translate: 'ADMIN.TAB_DASHBOARD',
        type: 'item',
        icon: 'dashboard',
        url: '/admin/dashboard',
      },
      {
        id: 'admin-sups',
        title: "SUP's",
        translate: 'ADMIN.TAB_SUPS',
        type: 'item',
        icon: 'surfing',
        url: '/admin/sups',
      },
      {
        id: 'admin-rentals',
        title: 'Rentals',
        translate: 'ADMIN.TAB_RENTALS',
        type: 'item',
        icon: 'receipt_long',
        url: '/admin/rentals',
      },
    ],
  },

  // ── Add new top-level items below ──────────────────────────────────────────
  // Example collapsable:
  // {
  //   id: 'reports',
  //   title: 'Reports',
  //   translate: 'NAV.REPORTS',
  //   type: 'collapsable',
  //   icon: 'bar_chart',
  //   adminOnly: true,
  //   children: [
  //     { id: 'daily-report', title: 'Daily', translate: 'NAV.DAILY_REPORT',
  //       type: 'item', icon: 'today', url: '/reports/daily' },
  //   ],
  // },
];
