import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const LANG_KEY = 'sup_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  constructor(private translate: TranslateService) {}

  init(): void {
    const saved = (localStorage.getItem(LANG_KEY) as 'tr' | 'en') ?? 'tr';
    this.translate.use(saved);
  }

  toggle(): void {
    const next = this.current === 'tr' ? 'en' : 'tr';
    this.translate.use(next);
    localStorage.setItem(LANG_KEY, next);
  }

  get current(): string {
    return this.translate.currentLang() ?? 'tr';
  }
}
