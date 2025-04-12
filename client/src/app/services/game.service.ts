import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

interface SelectCardPayload {
  userId: string;
  cardValue: number | null;
  cardLabel: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = '/api/game';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Confirmed card selection to backend
  selectCard(
    cardValue: number | null,
    cardLabel: string | null
  ): Observable<any> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(
        () => new Error('User ID not found. Cannot select card.')
      );
    }

    const payload: SelectCardPayload = { userId, cardValue, cardLabel };
    console.log('Sending card selection:', payload);

    return this.http.post<any>(`${this.apiUrl}/select`, payload).pipe(
      catchError((error) => {
        console.error('Error sending card selection:', error);
        return throwError(() => new Error('Failed to send card selection.'));
      })
    );
  }

  // Add other game actions here later (e.g., reset backend state if needed)
  resetSelection(): Observable<any> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(
        () => new Error('User ID not found. Cannot reset selection.')
      );
    }
    return this.http.post<any>(`${this.apiUrl}/reset`, { userId }).pipe(
      catchError((error) => {
        console.error('Error reseting card selection:', error);
        return throwError(() => new Error('Failed to reset card selection.'));
      })
    );
  }
}
