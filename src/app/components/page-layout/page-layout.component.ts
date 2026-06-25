import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [NgIf],
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss'],
})
export class PageLayoutComponent {
  // Header title shown in the colored strip
  @Input() title = '';
  // Material Symbols icon name shown next to the title
  @Input() icon  = '';
  // Optional subtitle below the title
  @Input() subtitle = '';
}
