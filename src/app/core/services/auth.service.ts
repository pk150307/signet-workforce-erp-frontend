import { Injectable, Injector, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, finalize, of, EMPTY, Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AuthResponse, LoginRequest, TokenPayload } from '../models/auth.models';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { AUTH_STORAGE_KEY, SESSION_STORAGE_KEYS } from '../constants/auth-storage.constants';
import { BreadcrumbService } from './breadcrumb.service';
import { CompanyService } from './company.service';
import { SessionService } from './session.service';
import { invalidateLookupCache } from '../utils/lookup-cache.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly breadcrumbService = inject(BreadcrumbService);

  private _authState = signal<AuthResponse | null>(this.loadStoredState());
  private _isLoggingOut = false;

  readonly currentUser = computed(() => this._authState());
  readonly isAuthenticated = computed(() => {
    const state = this._authState();
    if (!state) return false;
    const payload = this.decodeToken(state.accessToken);
    return payload ? payload.exp * 1000 > Date.now() : false;
  });
  readonly userRoles = computed(() => this._authState()?.roles ?? []);
  readonly userPermissions = computed(() => this._authState()?.permissions ?? []);
  readonly userFullName = computed(() => this._authState()?.fullName ?? this._authState()?.userName ?? '');

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}${API_ENDPOINTS.auth.login}`, request).pipe(
      tap(res => {
        this._isLoggingOut = false;
        this._authState.set(res);
        this.persistState(res);
      }),
    );
  }

  logout() {
    if (this._isLoggingOut) return;
    this._isLoggingOut = true;

    const hadSession = Boolean(this.getAccessToken() || this._authState());

    const finish = () => {
      this.clearAllSessionData();
      this._isLoggingOut = false;
      void this.router.navigate(['/auth/login']);
    };

    if (!hadSession) {
      finish();
      return;
    }

    this.http.post<void>(`${environment.apiUrl}${API_ENDPOINTS.auth.logout}`, {}).pipe(
      catchError(() => of(undefined)),
      finalize(() => finish()),
    ).subscribe();
  }

  isLoggingOut(): boolean {
    return this._isLoggingOut;
  }

  refreshToken(): Observable<AuthResponse> {
    const state = this._authState();
    if (!state?.refreshToken) return EMPTY;

    return this.http.post<AuthResponse>(`${environment.apiUrl}${API_ENDPOINTS.auth.refreshToken}`, {
      refreshToken: state.refreshToken,
    }).pipe(
      tap(res => {
        this._authState.set(res);
        this.persistState(res);
      }),
      catchError(() => {
        this.logout();
        return EMPTY;
      }),
    );
  }

  getAccessToken(): string | null {
    return this._authState()?.accessToken ?? null;
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions().some(p => p.toLowerCase() === permission.toLowerCase());
  }

  hasRole(role: string): boolean {
    return this.userRoles().some(r => r.toLowerCase() === role.toLowerCase());
  }

  private decodeToken(token: string): TokenPayload | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as TokenPayload;
    } catch {
      return null;
    }
  }

  private persistState(state: AuthResponse) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  }

  private clearAllSessionData() {
    this._authState.set(null);

    for (const key of SESSION_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }

    try {
      sessionStorage.clear();
    } catch {
      /* ignore */
    }

    this.clearAuthCookies();
    this.breadcrumbService.reset();

    try {
      this.injector.get(CompanyService).clearSessionCache();
    } catch {
      /* noop */
    }

    invalidateLookupCache();

    try {
      this.injector.get(SessionService).clearSessionTimers();
    } catch {
      /* noop */
    }
  }

  private clearAuthCookies() {
    if (typeof document === 'undefined') return;

    const cookieNames = document.cookie
      .split(';')
      .map(part => part.split('=')[0]?.trim())
      .filter((name): name is string => Boolean(name));

    for (const name of cookieNames) {
      const lower = name.toLowerCase();
      if (
        lower.includes('token')
        || lower.includes('auth')
        || lower.includes('session')
        || lower.includes('jwt')
      ) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}; SameSite=Lax`;
      }
    }
  }

  private loadStoredState(): AuthResponse | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) as AuthResponse : null;
    } catch {
      return null;
    }
  }
}
