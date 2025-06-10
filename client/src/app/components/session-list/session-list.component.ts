import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { EstimationHistory } from '../../models/session-history.model';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-list.component.html',
  styleUrl: './session-list.component.scss',
})
export class SessionListComponent implements OnInit {
  estimationHistory: EstimationHistory[] = [];
  loading = false;
  error: string | null = null;
  deletingItemId: string | null = null;
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEstimationHistory();
  }

  loadEstimationHistory(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error =
        'Nie jesteś zalogowany. Nie można pobrać historii estymacji.';
      return;
    }
    this.sessionService.getEstimationHistory(userId).subscribe({
      next: (history) => {
        this.estimationHistory = history;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania historii:', err);
        this.error = 'Nie udało się pobrać historii estymacji';
      },
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getVotesSummary(allVotes: any[]): string {
    const voteCounts = allVotes.reduce((acc, vote) => {
      acc[vote.card] = (acc[vote.card] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(voteCounts)
      .map(([card, count]) => `${card}: ${count}`)
      .join(', ');
  }
  navigateToSessionList() {
    this.router.navigate(['/lobby']);
  }

  logout(): void {
    this.authService.logout();
  }

  confirmDelete(item: EstimationHistory): void {
    const confirmed = confirm(
      `Czy na pewno chcesz usunąć estymację dla "${item.storyTitle}"?\n\nTa akcja jest nieodwracalna.`
    );

    if (confirmed && item._id) {
      this.deleteEstimation(item._id);
    }
  }

  deleteEstimation(itemId: string): void {
    this.deletingItemId = itemId;

    this.sessionService.deleteEstimationHistory(itemId).subscribe({
      next: () => {
        // Usuń element z lokalnej tablicy
        this.estimationHistory = this.estimationHistory.filter(
          (item) => item._id !== itemId
        );
        this.deletingItemId = null;
        console.log('Estymacja została usunięta');
      },
      error: (err) => {
        console.error('Błąd podczas usuwania estymacji:', err);
        this.deletingItemId = null;
        alert('Nie udało się usunąć estymacji. Spróbuj ponownie.');
      },
    });
  }

  isDeleting(itemId: string): boolean {
    return this.deletingItemId === itemId;
  }
}
