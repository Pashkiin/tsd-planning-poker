import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CreateSessionResponse } from '../models/create-session-response.model';
import { SessionSummary } from '../models/session-summary.model';
import { AuthService } from './auth.service';

interface CreateSessionRequest {
  creatorId: string;
  sessionName: string;
  tasks?: { name: string; description?: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private baseUrl = '/api/sessions';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Pobierz listę aktywnych sesji
  getSessions(): Observable<SessionSummary[]> {
    return this.http.get<SessionSummary[]>(this.baseUrl).pipe(
      catchError((error) => {
        console.error('Błąd podczas pobierania sesji:', error);
        return throwError(() => new Error('Nie udało się pobrać sesji.'));
      })
    );
  }

  // Utwórz nową sesję
  createSession(
    payload: CreateSessionRequest
  ): Observable<CreateSessionResponse> {
    return this.http.post<CreateSessionResponse>(this.baseUrl, payload).pipe(
      catchError((error) => {
        console.error('Błąd podczas tworzenia sesji:', error);
        return throwError(() => new Error('Nie udało się utworzyć sesji.'));
      })
    );
  }
}
