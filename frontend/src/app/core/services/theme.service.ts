import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'default';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Active theme signal
  readonly activeTheme = signal<Theme>('default');

  // Media Query listener for system color scheme changes
  private darkSchemeMedia: MediaQueryList | null = null;
  private mediaListener: (() => void) | null = null;

  constructor() {
    if (this.isBrowser) {
      // 1. Retrieve cached theme configuration
      const cachedTheme = localStorage.getItem('theme') as Theme | null;
      if (cachedTheme && ['light', 'dark', 'default'].includes(cachedTheme)) {
        this.activeTheme.set(cachedTheme);
      }

      // 2. Set up media queries for system theme monitoring
      this.darkSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaListener = () => {
        if (this.activeTheme() === 'default') {
          this.applyThemeClass();
        }
      };
      this.darkSchemeMedia.addEventListener('change', this.mediaListener);

      // 3. Reactively update body class and localStorage on signal change
      effect(() => {
        const theme = this.activeTheme();
        localStorage.setItem('theme', theme);
        this.applyThemeClass();
      });
    }
  }

  setTheme(theme: Theme): void {
    this.activeTheme.set(theme);
  }

  private applyThemeClass(): void {
    if (!this.isBrowser) return;

    const theme = this.activeTheme();
    const body = document.body;

    // Clear existing theme classes
    body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'dark') {
      body.classList.add('dark-theme');
    } else if (theme === 'light') {
      body.classList.add('light-theme');
    } else {
      // System Default
      const isSystemDark = this.darkSchemeMedia?.matches ?? false;
      if (isSystemDark) {
        body.classList.add('dark-theme');
      } else {
        body.classList.add('light-theme');
      }
    }
  }

  destroy(): void {
    if (this.isBrowser && this.darkSchemeMedia && this.mediaListener) {
      this.darkSchemeMedia.removeEventListener('change', this.mediaListener);
    }
  }
}
