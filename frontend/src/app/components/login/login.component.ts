import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/prompt.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="logo">
            <span class="logo-icon">✦</span>
            提示词管理
          </h1>
          <h2 class="auth-title">欢迎回来</h2>
          <p class="auth-subtitle">登录您的账号继续使用</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" class="auth-form">
          @if (errorMessage()) {
            <div class="error-alert">
              {{ errorMessage() }}
            </div>
          }
          
          <div class="form-group">
            <label class="form-label">用户名 / 邮箱</label>
            <input 
              type="text" 
              [(ngModel)]="formData.username"
              name="username"
              placeholder="请输入用户名或邮箱"
              class="form-input"
              [disabled]="loading()"
              required
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              type="password" 
              [(ngModel)]="formData.password"
              name="password"
              placeholder="请输入密码"
              class="form-input"
              [disabled]="loading()"
              required
            >
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-full"
            [disabled]="loading() || !isFormValid()"
          >
            {{ loading() ? '登录中...' : '登录' }}
          </button>
        </form>
        
        <div class="auth-footer">
          <span>还没有账号？</span>
          <a routerLink="/register" class="auth-link">立即注册</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    
    .auth-card {
      width: 100%;
      max-width: 420px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 4px 24px var(--shadow-color);
    }
    
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .logo-icon {
      color: var(--accent-color);
    }
    
    .auth-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }
    
    .auth-subtitle {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    
    .error-alert {
      padding: 0.875rem 1rem;
      background-color: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--error-color);
      border-radius: 8px;
      color: var(--error-color);
      font-size: 0.9rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .form-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .form-input {
      padding: 0.875rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 0.95rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    
    .form-input:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    
    .form-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background-color: var(--accent-color);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: var(--accent-hover);
    }
    
    .btn-full {
      width: 100%;
    }
    
    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    
    .auth-link {
      color: var(--accent-color);
      text-decoration: none;
      font-weight: 500;
      margin-left: 0.25rem;
    }
    
    .auth-link:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  formData: LoginRequest = {
    username: '',
    password: ''
  };
  
  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  isFormValid(): boolean {
    return this.formData.username.trim().length > 0 && 
           this.formData.password.length > 0;
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;
    
    this.loading.set(true);
    this.errorMessage.set('');
    
    this.authService.login(this.formData).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.router.navigate(['/prompts']);
        } else {
          this.errorMessage.set(response.message || '登录失败');
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('登录失败，请检查网络连接');
      }
    });
  }
}
