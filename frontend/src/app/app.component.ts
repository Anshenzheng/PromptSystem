import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="app-container">
      <header class="header">
        <div class="header-content">
          <h1 class="logo">
            <span class="logo-icon">✦</span>
            提示词管理
          </h1>
          <nav class="nav">
            <a routerLink="/prompts" class="nav-link">列表</a>
            <a routerLink="/generate" class="nav-link">生成</a>
          </nav>
          <button (click)="toggleTheme()" class="theme-btn" [attr.aria-label]="isDark ? '切换亮色模式' : '切换暗色模式'">
            {{ isDark ? '☀️' : '🌙' }}
          </button>
        </div>
      </header>
      <main class="main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      transition: background-color 0.2s, color 0.2s;
    }
    
    .header {
      background-color: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .logo {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .logo-icon {
      font-size: 1.1rem;
    }
    
    .nav {
      display: flex;
      gap: 2rem;
    }
    
    .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.95rem;
      padding: 0.5rem 0;
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;
    }
    
    .nav-link:hover,
    .nav-link:active,
    .nav-link:focus {
      color: var(--text-primary);
      border-bottom-color: var(--accent-color);
    }
    
    .theme-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s;
    }
    
    .theme-btn:hover {
      background-color: var(--bg-hover);
    }
    
    .main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
    }
  `]
})
export class AppComponent {
  constructor(public themeService: ThemeService) {}
  
  get isDark(): boolean {
    return this.themeService.isDark;
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
