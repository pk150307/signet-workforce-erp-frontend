import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, EMPTY } from 'rxjs';
import { environment } from '@env/environment';
import { AuthResponse, LoginRequest, TokenPayload } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private _authState = signal<AuthResponse | null>(this.loadStoredState());

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
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(res => {
        this._authState.set(res);
        this.persistState(res);
      })
    );
  }

  logout() {
    this._authState.set(null);
    this.clearState();
    this.router.navigate(['/auth/login']);
  }

  refreshToken() {
    const state = this._authState();
    if (!state?.refreshToken) return EMPTY;

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/refresh-token`, {
      refreshToken: state.refreshToken
    }).pipe(
      tap(res => {
        this._authState.set(res);
        this.persistState(res);
      }),
      catchError(() => {
        this.logout();
        return EMPTY;
      })
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
    localStorage.setItem('auth_state', JSON.stringify(state));
  }

  private clearState() {
    localStorage.removeItem('auth_state');
  }

  private loadStoredState(): AuthResponse | null {
    try {
      const stored = localStorage.getItem('auth_state');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
