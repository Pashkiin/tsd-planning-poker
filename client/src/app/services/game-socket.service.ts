import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';
import { GameSession, Player } from '../models/session-state.model'; // Adjust path

@Injectable({
  providedIn: 'root',
})
export class GameSocketService {
  private socketConnectedSubject = new BehaviorSubject<boolean>(false);
  public socketConnected$ = this.socketConnectedSubject.asObservable();

  private playerIdSubject = new BehaviorSubject<string | null>(null); // Store playerId
  public playerId$ = this.playerIdSubject.asObservable();

  private sessionStateSubject = new BehaviorSubject<GameSession | null>(null); // Store session state
  public sessionState$ = this.sessionStateSubject.asObservable();

  constructor(private socket: Socket) {
    // Check if the socket is connected
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socketConnectedSubject.next(true);
    });

    // Handle socket disconnection
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.socketConnectedSubject.next(false);
    });

    this.socket.on(
      'joinedSession',
      (data: {
        message: string;
        sessionId: string;
        playerId: string;
        sessionState: GameSession;
      }) => {
        console.log('Successfully joined session:', data.message);
        console.log('Session ID:', data.sessionState);
        this.playerIdSubject.next(data.playerId); // Store playerId
        this.sessionStateSubject.next(data.sessionState); // Update sessionState
      }
    );

    this.socket.on('sessionUpdate', (sessionState: GameSession) => {
      this.sessionStateSubject.next(sessionState); // Update sessionState
    });
  }

  // Emit joinSession event to the server
  joinSession(sessionId: string, userId: string, username: string): void {
    this.socket.emit('joinSession', {
      sessionId,
      userId,
      username,
    });
  }

  getSessionConnected() {
    return this.socketConnected$;
  }

  submitVote(selectedCardValue: number | string | null): void {
    if (selectedCardValue !== null) {
      this.socket.emit('submitVote', {
        cardValue: selectedCardValue,
      });
    }
  }

  clearVote(): void {
    this.socket.emit('clearMyVote');
  }
}
