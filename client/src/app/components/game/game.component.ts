import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  Subscription,
  timer,
  switchMap,
  catchError,
  of,
  map,
} from 'rxjs';
import { CardService } from '../../services/card.service';
import { AuthService } from '../../services/auth.service';
import { GameService } from '../../services/game.service';
import { Card } from '../../models/card.model';
import { Player } from '../../models/player.model';
import { GameSession } from '../../models/game-session.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  cards$: Observable<Card[]> | undefined;
  selectedCard = new BehaviorSubject<Card | null>(null);
  isConfirmed = false;
  isLoading = false;
  isLoadingCards = false;
  isLoadingSession = false;
  error: string | null = null;

  sessionData = new BehaviorSubject<GameSession | null>(null);
  currentUserId: string | null = null;
  pollingInterval = 3000;
  sessionSubscription: Subscription | undefined;
  voteSubscription: Subscription | undefined;
  averageVote$: Observable<number | null>;

  constructor(
    private cardService: CardService,
    private authService: AuthService,
    private gameService: GameService
  ) {
    this.averageVote$ = this.sessionData.pipe(
      map((session) => {
        if (!session || !session.players || session.players.length === 0) {
          return null;
        }

        const numericVotes = session.players
          .map((player) => player.selectedCard)
          .filter((value): value is number => typeof value === 'number');

        if (numericVotes.length === 0) {
          return null;
        }

        const sum = numericVotes.reduce((acc, value) => acc + value, 0);
        const average = sum / numericVotes.length;
        return average;
      })
    );
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadCards();
    this.startPollingSession();
  }

  ngOnDestroy(): void {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
    if (this.voteSubscription) {
      this.voteSubscription.unsubscribe();
    }
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

  startPollingSession(): void {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
    this.isLoadingSession = true;
    this.sessionSubscription = timer(0, this.pollingInterval)
      .pipe(
        switchMap(() => this.gameService.getSession()),
        catchError((err) => {
          this.error = `Error polling session: ${err.message}`;
          console.error(err);
          return of(this.sessionData.getValue()); // Return last known value on error
        })
      )
      .subscribe((session) => {
        this.isLoadingSession = false;
        this.sessionData.next(session);
        // check if current user's vote was reset by backend
        const currentUserData: Player | undefined = session?.players.find(
          (p: Player) => p.id === this.currentUserId
        );
        if (
          currentUserData?.selectedCard === null &&
          this.selectedCard.getValue() !== null &&
          this.isConfirmed
        ) {
          this.selectedCard.next(null);
          this.isConfirmed = false;
        }
      });
  }

  selectCard(card: Card): void {
    if (!this.isConfirmed) {
      this.selectedCard.next(card);
      console.log('Staged selection:', card);
    }
  }

  resetSelection(): void {
    if (!this.isConfirmed && !this.isLoading) {
      const previousSelection = this.selectedCard.getValue();
      this.selectedCard.next(null);
      this.isConfirmed = false;
      console.log('Selection reset locally');
    }
  }

  confirmSelection(): void {
    const currentSelection = this.selectedCard.getValue();
    if (currentSelection && !this.isConfirmed && !this.isLoading) {
      this.sendVote(currentSelection.value);
    } else if (!currentSelection) {
      this.error = 'Please select a card first.';
    }
  }

  private sendVote(value: number | string | null): void {
    this.isLoading = true;
    this.error = null;

    if (this.voteSubscription) {
      this.voteSubscription.unsubscribe();
    }

    this.voteSubscription = this.gameService.vote(value).subscribe({
      next: (response) => {
        console.log('Vote successful:', response.message);
        this.isConfirmed = true;
        this.isLoading = false;
        // Refresh session data after voting
        this.gameService
          .getSession()
          .subscribe((session) => this.sessionData.next(session));
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.message || 'Failed to send vote.';
        this.isConfirmed = false;
        console.error('Vote error:', err);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }

  // Placeholder for next round/reset logic
  startNewRound(): void {
    console.log('Starting new round (logic needed)');
    this.isConfirmed = false;
    this.selectedCard.next(null);
    this.gameService
      .getSession()
      .subscribe((session) => this.sessionData.next(session));
  }
}
