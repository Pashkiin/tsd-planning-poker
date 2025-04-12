import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { CardService } from '../../services/card.service';
import { AuthService } from '../../services/auth.service';
import { GameService } from '../../services/game.service';
import { Card } from '../../models/card.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  cards$: Observable<Card[]> | undefined;
  selectedCard = new BehaviorSubject<Card | null>(null);
  isConfirmed = false;
  isLoading = false;
  error: string | null = null;

  constructor(
    private cardService: CardService,
    private authService: AuthService,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.isLoading = true;
    this.error = null;
    this.cards$ = this.cardService.getCards();
    this.cards$.subscribe({
      next: () => (this.isLoading = false),
      error: (err) => {
        this.isLoading = false;
        this.error = `Error loading cards: ${err.message}`;
        console.error(err);
      },
    });
  }

  selectCard(card: Card): void {
    if (!this.isConfirmed) {
      this.selectedCard.next(card);
      console.log('Selected card:', card);
    }
  }

  resetSelection(): void {
    if (!this.isConfirmed) {
      this.selectedCard.next(null);
      console.log('Selection reset');
      // in future call gameService.resetSelection() if backend needs immediate notification
    }
  }

  confirmSelection(): void {
    const currentSelection = this.selectedCard.getValue();
    if (currentSelection && !this.isConfirmed) {
      this.isLoading = true;
      this.error = null;
      this.gameService
        .selectCard(currentSelection.value, currentSelection.label)
        .subscribe({
          next: () => {
            console.log('Selection confirmed and sent:', currentSelection);
            this.isConfirmed = true; // Lock selection
            this.isLoading = false;
          },
          error: (err) => {
            this.isLoading = false;
            this.error = err.message || 'Failed to confirm selection.';
            console.error('Confirmation error:', err);
          },
        });
    } else if (!currentSelection) {
      this.error = 'Please select a card first.';
    }
  }

  logout(): void {
    this.authService.logout();
  }

  // Placeholder for round end logic
  endRound(): void {
    console.log('Round ended (logic not implemented)');
    this.isConfirmed = false;
    this.selectedCard.next(null);
  }
}
