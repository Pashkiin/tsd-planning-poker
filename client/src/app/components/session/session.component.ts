import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSocketService } from '../../services/game-socket.service'; // Adjust path
import { SessionService } from '../../services/session.service'; // Adjust path
import { AuthService } from '../../services/auth.service'; // If you need authentication
import { Observable } from 'rxjs';
import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Card } from '../../models/card.model'; // Adjust path
import { Player } from '../../models/player.model'; // Adjust path
import { GameSession } from '../../models/game-session.model'; // Adjust path
import { CardService } from '../../services/card.service'; // Adjust path

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule], // Just the CommonModule here
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
})
export class SessionComponent {
  socketReady$: Observable<boolean>;
  cards$: Observable<Card[]> | undefined;
  selectedCard = new BehaviorSubject<Card | null>(null);
  isConfirmed = false;

  error: string | null = null;
  isLoadingCards = false;
  selectedCardValue: number | string | null = null;

  constructor(
    private gameSocketService: GameSocketService,
    private sessionService: SessionService,
    private authService: AuthService,
    private cardService: CardService // Adjust path
  ) {
    // Get socket connection status from GameSocketService
    this.socketReady$ = this.gameSocketService.getSessionConnected();
  }

  ngOnInit(): void {
    var sessionId;
    console.log(this.authService.getRedirectUrl());
    if (this.authService.getRedirectUrl() != null) {
      console.log('Redirect URL:', this.authService.getRedirectUrl());
      sessionId = this.authService.getSessionIdFromUrl();
      console.log('Session ID:', sessionId);
      this.authService.clearRedirectUrl();
    } else {
      sessionId = this.sessionService.getSessionId();
    }
    const userId = this.authService.getUserId();
    const username = this.authService.getUserName();

    this.joinGameSession(sessionId!, userId!, username!);
    this.loadCards();
    this.selectedCardValue = null;
  }

  joinGameSession(sessionId: string, userId: string, username: string): void {
    // Subscribe to socket connection status
    this.socketReady$.subscribe((isReady) => {
      if (isReady) {
        // Proceed with joining the session
        this.gameSocketService.joinSession(sessionId, userId, username);
      } else {
        console.log('Socket is not connected yet. Please try again later.');
      }
    });
  }

  loadCards(): void {
    this.isLoadingCards = true;
    this.error = null;
    this.cards$ = this.cardService.getCards().pipe(
      catchError((err) => {
        this.error = `Error loading cards: ${err.message}`;
        console.error(err);
        return of([]);
      })
    );
    this.cards$.subscribe(() => (this.isLoadingCards = false));
  }

  onCardSelected(value: number | string | null): void {
    this.selectedCardValue = value;
  }

  submitVote(): void {
    if (this.selectedCardValue !== null) {
      this.isConfirmed = true;
      this.gameSocketService.submitVote(this.selectedCardValue);
    }
  }

  clearVote(): void {
    this.isConfirmed = false;
    this.selectedCardValue = null;
    this.gameSocketService.clearVote();
  }
}
