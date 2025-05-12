import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { CommonModule } from '@angular/common';
import { SessionSummary } from '../../models/session-summary.model';
import { Invitation } from '../../models/invitation.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-lobby',
  imports: [CommonModule],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {
  sessions: SessionSummary[] = [];
  invitations: Invitation[] = []; // Zmieniamy `any[]` na `Invitation[]` dla bezpieczeństwa typów
  userId: string | null = null;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (this.userId) {
      this.loadSessions();
    } else {
      // Jeśli użytkownik nie jest zalogowany, przekieruj go do strony logowania
      console.error('Brak identyfikatora użytkownika!');
      this.router.navigate(['/login']);
    }
  }

  loadSessions(): void {
    this.sessionService.getSessions().subscribe({
      next: (data) => {
        this.sessions = data;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania sesji:', err);
      },
    });
  }

  createSession(): void {
    if (this.userId === null) {
      console.error('Brak identyfikatora użytkownika!');
      return;
    }

    const payload = {
      creatorId: this.userId, // Gwarantujemy, że userId nie jest null
      sessionName: `Nowa sesja od ${this.userId}`,
      tasks: [], // Możesz dodać zadania, jeśli chcesz
    };

    this.sessionService.createSession(payload).subscribe({
      next: (res) => {
        console.log('Stworzono sesję:', res);
        // Przekierowanie do strony gry po stworzeniu sesji
        this.router.navigate([`/game/${res.sessionId}`]);
      },
      error: (err) => {
        console.error('Błąd podczas tworzenia sesji:', err);
      },
    });
  }

  invitePlayer(session: SessionSummary): void {
    console.log('Wysyłanie zaproszenia do sesji:', session.sessionId);
    // Tu możesz dodać logikę wysyłania zaproszeń do gracza
  }

  acceptInvitation(invitation: Invitation): void {
    console.log('Zaakceptowano zaproszenie do sesji:', invitation.sessionId);
    // Usuwamy zaproszenie z listy
    this.invitations = this.invitations.filter((i) => i.id !== invitation.id);
    // Przekierowanie do gry po zaakceptowaniu zaproszenia
    this.router.navigate([`/game/${invitation.sessionId}`]);
  }

  declineInvitation(invitation: Invitation): void {
    // Usuwamy zaproszenie z listy, gdy jest odrzucone
    this.invitations = this.invitations.filter((i) => i.id !== invitation.id);
  }
}
