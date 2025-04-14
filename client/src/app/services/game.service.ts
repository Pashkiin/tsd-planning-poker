import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { GameSession } from '../models/game-session.model';
import { Player } from '../models/player.model';

interface VotePayload {
  userId: string;
  cardValue: number | string | null;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private gameApiUrl = '/api/game';
  private playerApiUrl = '/api/player';

  constructor(private http: HttpClient, private authService: AuthService) {}

  vote(cardValue: number | string | null): Observable<{ message: string }> {
    // Assuming backend returns { message: 'Success' }
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User ID not found. Cannot vote.'));
    }

    const payload: VotePayload = { userId, cardValue };
    console.log('Sending vote:', payload);

    return this.http
      .post<{ message: string }>(`${this.gameApiUrl}/vote`, payload)
      .pipe(
        catchError((error) => {
          console.error('Error sending vote:', error);
          return throwError(() => new Error('Failed to send vote.'));
        })
      );
  }

  getSession(): Observable<GameSession> {
    return this.http.get<GameSession>(`${this.gameApiUrl}/session`).pipe(
      catchError((error) => {
        console.error('Error fetching game session:', error);
        return throwError(() => new Error('Failed to fetch game session.'));
      })
    );
  }

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.playerApiUrl}/players`).pipe(
      catchError((error) => {
        console.error('Error fetching players:', error);
        return throwError(() => new Error('Failed to fetch players.'));
      })
    );
  }

  setTaskName(taskName: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.gameApiUrl}/task`, { taskName })
      .pipe(
        catchError((error) => {
          console.error('Error setting task name:', error);
          return throwError(() => new Error('Failed to set task name.'));
        })
      );
  }

  // Reset backend state if needed
  resetSelection(): Observable<any> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(
        () => new Error('User ID not found. Cannot reset selection.')
      );
    }
    return this.http.post<any>(`${this.gameApiUrl}/reset`, { userId }).pipe(
      catchError((error) => {
        console.error('Error reseting card selection:', error);
        return throwError(() => new Error('Failed to reset card selection.'));
      })
    );
  }
}
