import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSocketService } from '../../services/game-socket.service'; // Adjust path
import { SessionService } from '../../services/session.service'; // Adjust path
import { AuthService } from '../../services/auth.service'; // If you need authentication
import { Observable } from 'rxjs';
import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Card } from '../../models/card.model'; // Adjust path
import { CardService } from '../../services/card.service'; // Adjust path
import { GameSession, Player, Task } from '../../models/session-state.model'; // Adjust path
import { EstimationHistory } from '../../models/session-history.model'; // Adjust path

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

  playerId: string | null = null;
  sessionState: GameSession | null = null;
  isCreator: boolean = false;
  sessionEnded = false;

  showLink = false;
  currentGameLink: string = '';

  isSavingEstimation: boolean = false;
  estimationSaved: boolean = false;

  constructor(
    private gameSocketService: GameSocketService,
    private sessionService: SessionService,
    private authService: AuthService,
    private cardService: CardService // Adjust path
  ) {
    // Get socket connection status from GameSocketService
    this.socketReady$ = this.gameSocketService.getSessionConnected();

    this.gameSocketService.playerId$.subscribe((playerId) => {
      if (playerId) {
        this.playerId = playerId; // Store playerId once received
        console.log('Player ID:', playerId);
      }
    });

    this.gameSocketService.sessionState$.subscribe((sessionState) => {
      if (sessionState) {
        this.sessionState = sessionState; // Store initial session state once received
        console.log('Session State:', sessionState);
        this.isCreator =
          this.authService.getUserId() === this.sessionState?.creatorId;
        console.log('Session Creator ID:', this.sessionState?.creatorId);
        console.log('current User ID:', this.authService.getUserId());
        console.log('Player ID:', this.playerId);
        console.log('Is Creator:', this.isCreator);
      }
      this.checkVotesAndEndSession();
    });
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
    this.gameSocketService.connectToSocket();
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

  getCurrentTask() {
    return this.sessionState?.tasks.find(
      (task) => task.id === this.sessionState?.currentTaskId
    );
  }
  // Request to reveal all estimations for the current task
  requestRevealEstimations() {
    this.gameSocketService.requestRevealEstimations();
  }

  // Set a new current task for voting
  setCurrentTask(taskId: string) {
    this.gameSocketService.setCurrentTask(taskId);
  }

  // Move to the next task in the session's task list
  nextTask() {
    this.gameSocketService.nextTask();
  }

  // Reset votes for the current task
  resetCurrentTaskVotes() {
    this.gameSocketService.resetCurrentTaskVotes();
  }

  // Add a new task to the session's task list
  addNewTask() {
    const newTaskName = prompt('Enter the new task name:');
    const newTaskDescription = prompt('Enter the task description (optional):');

    if (newTaskName) {
      this.gameSocketService.addNewTask(newTaskName, newTaskDescription!);
    }
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Pomocnicza metoda, aby zwrócić pary [klucz, wartość]
  objectEntries(obj: any): [string, number][] {
    return Object.entries(obj);
  }

  checkVotesAndEndSession(): void {
    if (this.sessionState?.areVotesRevealedForCurrentTask) return;

    const allVoted =
      this.sessionState?.totalPlayers === this.sessionState?.lockedVotesCount;

    if (allVoted) {
      this.requestRevealEstimations();
    }
  }

  copyLinkToClipboard(): void {
    // Możesz dynamicznie tworzyć link – np. na podstawie ID rozgrywki
    const sessionId = this.sessionState?.sessionId || '123'; // Zakładam, że masz sessionState.id
    this.currentGameLink = `${window.location.origin}/session/${sessionId}`;

    navigator.clipboard
      .writeText(this.currentGameLink)
      .then(() => {
        console.log('Link skopiowany do schowka');
      })
      .catch((err) => {
        console.error('Nie udało się skopiować linku', err);
      });
  }

  toggleLinkVisibility(): void {
    this.showLink = !this.showLink;
  }

  logout(): void {
    if (!this.sessionState || !this.playerId) {
      console.error(
        'Nie można usunąć gracza z sesji, brak danych sesji lub gracza.'
      );
      return;
    }
    // Remove player from session and then log out
    console.log('Removing player from session:', this.playerId);
    console.log('Session ID:', this.sessionState.sessionId);
    console.log('Logging out user:', this.playerId);
    this.gameSocketService.removePlayerFromSession(
      this.sessionState?.sessionId || '',
      this.playerId || ''
    );
    this.authService.logout();
  }

  exportTasksToCsv(): void {
    if (!this.sessionState || !this.sessionState.tasks) {
      console.error('No tasks to export.');
      return;
    }

    this.sessionService.exportTasksToCsv(this.sessionState.tasks).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Błąd eksportu CSV:', err.message);
      },
    });
  }

  saveEstimation(): void {
    if (!this.sessionState || !this.sessionState.tasks) {
      console.error('No tasks to save.');
      return;
    }

    const estimationHistory: EstimationHistory = {
      userId: this.authService.getUserId() || '',
      sessionId: this.sessionState.sessionId,
      storyTitle: this.getCurrentTask()?.name || '',
      selectedCardValue:
        this.selectedCardValue !== null ? String(this.selectedCardValue) : '',
      date: new Date().toISOString(),
      teammates: this.sessionState.players.map((player) => player.username),
      allVotes: this.sessionState.players.map((player) => ({
        username: player.username,
        card:
          player.selectedCardValue !== null
            ? String(player.selectedCardValue)
            : '',
      })),
    };

    this.sessionService.saveEstimationHistory(estimationHistory).subscribe({
      next: (response) => {
        console.log('Estimation saved successfully:', response);
      },
      error: (err) => {
        console.error('Błąd zapisu estymacji:', err.message);
      },
    });
  }

  endSession(): void {
    if (!this.sessionState || !this.playerId) {
      console.error('Nie można zakończyć sesji, brak danych sesji lub gracza.');
      return;
    }
    // End the session
    this.gameSocketService.endSession(this.sessionState.sessionId);
    this.sessionEnded = true;
  }

  saveCurrentTaskEstimation(): void {
    if (!this.sessionState || !this.getCurrentTask()) {
      console.error('Brak aktualnego zadania do zapisania.');
      return;
    }

    const currentTask = this.getCurrentTask();
    if (currentTask?.status !== 'estimated') {
      console.error('Zadanie nie jest w stanie "estimated".');
      return;
    }

    this.isSavingEstimation = true;
    this.estimationSaved = false;

    // Znajdź głos aktualnego użytkownika
    const currentPlayer = this.sessionState.players.find(
      (player) => player.id === this.playerId
    );
    const userVote = currentPlayer?.selectedCardValue;

    const estimationHistory: EstimationHistory = {
      userId: this.authService.getUserId() || '',
      sessionId: this.sessionState.sessionId,
      storyTitle: currentTask.name,
      selectedCardValue:
        userVote !== null && userVote !== undefined ? String(userVote) : '',
      date: new Date().toISOString(),
      teammates: this.sessionState.players
        .filter((player) => player.id !== this.playerId)
        .map((player) => player.username),
      allVotes: this.sessionState.players.map((player) => ({
        username: player.username,
        card:
          player.selectedCardValue !== null &&
          player.selectedCardValue !== undefined
            ? String(player.selectedCardValue)
            : 'brak głosu',
      })),
    };

    this.sessionService.saveEstimationHistory(estimationHistory).subscribe({
      next: (response) => {
        console.log('Estimation saved successfully:', response);
        this.isSavingEstimation = false;
        this.estimationSaved = true;

        // Ukryj komunikat o sukcesie po 3 sekundach
        setTimeout(() => {
          this.estimationSaved = false;
        }, 3000);
      },
      error: (err) => {
        console.error('Błąd zapisu estymacji:', err.message);
        this.isSavingEstimation = false;
        // Możesz dodać obsługę błędu w UI
      },
    });
  }
}
