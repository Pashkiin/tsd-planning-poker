import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  BehaviorSubject,
  tap,
  catchError,
  of,
  throwError,
} from 'rxjs';
import { Router } from '@angular/router';

interface LoginResponse {
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/player/login';
  private userKey = 'planning_poker_user_id';

  private loggedIn = new BehaviorSubject<boolean>(this.hasUserId());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private hasUserId(): boolean {
    return !!localStorage.getItem(this.userKey);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.userKey);
  }

  login(username: string): Observable<LoginResponse> {
    if (!username) {
      return throwError(() => new Error('Username is required.'));
    }
    return this.http.post<LoginResponse>(this.apiUrl, { username }).pipe(
      tap((response) => {
        if (response && response.userId) {
          localStorage.setItem(this.userKey, response.userId);
          this.loggedIn.next(true);
          console.log('Login successful, userId:', response.userId);
        } else {
          throw new Error('Login failed: Invalid response from server.');
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        this.loggedIn.next(false);
        return throwError(
          () =>
            new Error('Login failed. Please check username or server status.')
        );
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.userKey);
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}
