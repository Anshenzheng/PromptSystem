import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, of, Subject } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/prompt.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  private _currentUser = signal<User | null>(null);
  private _token = signal<string | null>(null);
  private _authChanged = new Subject<boolean>();
  
  public currentUser = computed(() => this._currentUser());
  public token = computed(() => this._token());
  public isLoggedIn = computed(() => this._token() !== null);
  public authChanged$ = this._authChanged.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this._token.set(token);
        this._currentUser.set(user);
      } catch {
        this.clearAuth();
      }
    }
  }

  private clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this._token.set(null);
    this._currentUser.set(null);
    this._authChanged.next(false);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        if (response.success && response.token && response.user) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('auth_user', JSON.stringify(response.user));
          this._token.set(response.token);
          this._currentUser.set(response.user);
          this._authChanged.next(true);
        }
      }),
      catchError((err) => {
        const errorResponse: AuthResponse = {
          success: false,
          message: err.error?.message || '登录失败，请检查网络连接'
        };
        return of(errorResponse);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((response) => {
        if (response.success && response.token && response.user) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('auth_user', JSON.stringify(response.user));
          this._token.set(response.token);
          this._currentUser.set(response.user);
          this._authChanged.next(true);
        }
      }),
      catchError((err) => {
        const errorResponse: AuthResponse = {
          success: false,
          message: err.error?.message || '注册失败，请检查网络连接'
        };
        return of(errorResponse);
      })
    );
  }

  logout(): void {
    this.clearAuth();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this._token();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    }
    return new HttpHeaders();
  }
}
