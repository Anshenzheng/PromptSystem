import { Component, computed } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

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
          <div class="header-right">
            @if (authService.isLoggedIn()) {
              <span class="user-info">
                👋 {{ authService.currentUser()?.username }}
              </span>
              <button (click)="logout()" class="nav-btn">
                退出登录
              </button>
            } @else {
              <a routerLink="/login" class="nav-btn">
                登录
              </a>
              <a routerLink="/register" class="nav-btn nav-btn-primary">
                注册
              </a>
            }
            <button (click)="toggleTheme()" class="theme-btn" [attr.aria-label]="isDark ? '切换亮色模式' : '切换暗色模式'">
              {{ isDark ? '☀️' : '🌙' }}
            </button>
          </div>
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
      gap: 1.5rem;
    }
    
    .logo {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: default;
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
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .user-info {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    
    .nav-btn {
      padding: 0.4rem 0.875rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid var(--border-color);
      background-color: transparent;
      color: var(--text-primary);
      transition: all 0.2s;
    }
    
    .nav-btn:hover {
      background-color: var(--bg-hover);
    }
    
    .nav-btn-primary {
      background-color: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
    }
    
    .nav-btn-primary:hover {
      background-color: var(--accent-hover);
      border-color: var(--accent-hover);
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
  constructor(
    public themeService: ThemeService,
    public authService: AuthService
  ) {}
  
  get isDark(): boolean {
    return this.themeService.isDark;
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  logout(): void {
    this.authService.logout();
  }
}
