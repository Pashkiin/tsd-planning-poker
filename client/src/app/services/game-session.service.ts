import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameSession } from '../models/game-session.model'; // Assuming you have the GameSession model

@Injectable({
  providedIn: 'root',
})
export class GameSessionService {
  private currentSessionSubject: BehaviorSubject<GameSession | null>;

  constructor() {
    // Initialize the session with any data you might have stored, for example, from localStorage
    const storedSession = localStorage.getItem('currentSession');
    this.currentSessionSubject = new BehaviorSubject<GameSession | null>(
      storedSession ? JSON.parse(storedSession) : null
    );
  }

  // Getter for the current session as an observable
  get currentSession$() {
    return this.currentSessionSubject.asObservable();
  }

  // Getter for the current session value
  get currentSession(): GameSession | null {
    return this.currentSessionSubject.value;
  }

  // Set a new session (e.g., after the user joins a session)
  setCurrentSession(session: GameSession): void {
    this.currentSessionSubject.next(session);
    this.persistSession(session);
  }

  // Reset the current session (e.g., when logging out or when session ends)
  resetSession(): void {
    this.currentSessionSubject.next(null);
    localStorage.removeItem('currentSession'); // Remove the session from localStorage
  }

  // Persist the session data to localStorage
  private persistSession(session: GameSession): void {
    localStorage.setItem('currentSession', JSON.stringify(session));
  }
}
