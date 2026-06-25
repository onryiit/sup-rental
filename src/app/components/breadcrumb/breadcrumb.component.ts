import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

export interface BreadcrumbItem {
  // i18n key (e.g. 'NAV.HOME') — used when translate is true
  label: string;
  // set to true to pass label through TranslatePipe
  translate?: boolean;
  // route to navigate to; omit for the last (active) crumb
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, TranslatePipe],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
