import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { LanguageService } from './services/language.service';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, NgClass, NavbarComponent, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'Aqua SUP';
  sidebarOpen = false;

  constructor(public auth: AuthService, public lang: LanguageService) {}

  ngOnInit(): void {
    this.auth.initSession();
    this.lang.init();
  }

  onSidebarToggled(open: boolean): void {
    this.sidebarOpen = open;
  }
}
