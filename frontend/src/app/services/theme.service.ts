import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'prompt-system-theme';
  private isDarkSignal = signal<boolean>(this.loadTheme());

  get isDark() {
    return this.isDarkSignal();
  }

  constructor() {
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkSignal.set(!this.isDarkSignal());
    this.saveTheme();
    this.applyTheme();
  }

  private loadTheme(): boolean {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private saveTheme(): void {
    localStorage.setItem(this.STORAGE_KEY, this.isDarkSignal() ? 'dark' : 'light');
  }

  private applyTheme(): void {
    if (this.isDarkSignal()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
