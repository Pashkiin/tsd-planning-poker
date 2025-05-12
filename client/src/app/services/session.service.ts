import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SessionCreateResponse } from '../models/session-create-response.model';
import { SessionCreate } from '../models/session-create.model';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private apiUrl = '/api/sessions';
  private sessionKey = 'game_session_id';

  private SessionCreate: SessionCreate = {
    creatorId: localStorage.getItem(this.sessionKey) || '',
    sessionName: 'New Session',
    tasks: [
      {
        name: 'Task 1',
        description: 'Description for Task 1',
      },
    ],
  };

  private currentSessionSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(this.getSessionId());
  currentSessionId$ = this.currentSessionSubject.asObservable();

  private currentSessionDetailsSubject: BehaviorSubject<SessionCreateResponse | null> =
    new BehaviorSubject<SessionCreateResponse | null>(null);
  currentSessionDetails$ = this.currentSessionDetailsSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private hasSessionId(): boolean {
    return !!localStorage.getItem(this.sessionKey);
  }

  getSessionId(): string | null {
    return localStorage.getItem(this.sessionKey);
  }

  getSessionCreate(): SessionCreate {
    return this.SessionCreate;
  }

  updateSessionCreate(data: SessionCreate): void {
    this.SessionCreate = data;
  }

  getSessionDetails(): Observable<SessionCreateResponse | null> {
    return this.currentSessionDetails$;
  }

  setSessionDetails(details: SessionCreateResponse): void {
    this.currentSessionDetailsSubject.next(details);
  }

  createSession(userId: string): Observable<SessionCreateResponse> {
    if (!userId) {
      return throwError(() => new Error('User ID is required.'));
    }

    this.SessionCreate.creatorId = userId;

    return this.http
      .post<SessionCreateResponse>(this.apiUrl, this.SessionCreate)
      .pipe(
        tap((response) => {
          if (response && response.sessionId) {
            localStorage.setItem(this.sessionKey, response.sessionId);
            this.currentSessionSubject.next(response.sessionId);
            this.currentSessionDetailsSubject.next(response); // 🟢 Set session details
            console.log(
              'Session created successfully, sessionId:',
              response.sessionId
            );
          } else {
            throw new Error(
              'Session creation failed: Invalid response from server.'
            );
          }
        }),
        catchError((error) => {
          console.error('Session creation error:', error);
          return throwError(
            () =>
              new Error(
                'Session creation failed. Please check user ID or server status.'
              )
          );
        })
      );
  }

  getAllSessions(): Observable<SessionCreateResponse[]> {
    return this.http.get<SessionCreateResponse[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching sessions:', error);
        return throwError(() => new Error('Failed to fetch sessions.'));
      })
    );
  }

  getSession(sessionId: string): Observable<SessionCreateResponse> {
    return this.http
      .get<SessionCreateResponse>(`${this.apiUrl}/${sessionId}`)
      .pipe(
        tap((sessionDetails) => {
          this.currentSessionDetailsSubject.next(sessionDetails); // 🟢 Update session details
        }),
        catchError((error) => {
          console.error('Error fetching session:', error);
          return throwError(() => new Error('Failed to fetch session.'));
        })
      );
  }
}
