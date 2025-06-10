import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { CommonModule } from '@angular/common';
import { SessionSummary } from '../../models/session-summary.model';
import { SessionCreate } from '../../models/session-create.model';
import { Invitation } from '../../models/invitation.model';
import { AuthService } from '../../services/auth.service';
import * as bootstrap from 'bootstrap';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { filter } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-lobby',
  standalone: true, // Dodano dla obsługi imports bez NgModule
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit {
  sessions: SessionSummary[] = [];
  invitations: Invitation[] = [];
  userId: string | null = null;

  sessionForm!: FormGroup;
  private sessionPollingSubscription?: Subscription;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();

    if (!this.userId) {
      console.error('Brak identyfikatora użytkownika!');
      this.router.navigate(['/login']);
      return;
    }

    this.loadSessions();

    this.sessionForm = this.fb.group({
      sessionName: ['', Validators.required],
      taskName: ['', Validators.required],
      taskDescription: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.sessionPollingSubscription?.unsubscribe();
  }

  loadSessions(): void {
    this.sessionService.getAllSessions().subscribe({
      next: (sessions: SessionSummary[]) => {
        this.sessions = sessions;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania sesji:', err);
      },
    });
  }

  createSession(): void {
    const modal = new bootstrap.Modal(
      document.getElementById('createSessionModal')!
    );
    modal.show();
  }

  joinSession(sessionId: string): void {
    if (!this.userId) return;
    this.sessionService.setSessionId(sessionId);
    this.router.navigate([`/session/${sessionId}`]);
  }

  onSubmitSessionForm(): void {
    if (!this.userId) return;

    const form = this.sessionForm.value;
    const sessionData: SessionCreate = {
      creatorId: this.userId,
      sessionName: form.sessionName,
      tasks: [
        {
          name: form.taskName,
          description: form.taskDescription,
        },
      ],
    };

    this.sessionService.updateSessionCreate(sessionData);

    this.sessionService.createSession(this.userId).subscribe({
      next: (res) => {
        // Zakładam, że res zawiera nowe sessionId
        const newSessionId =
          res.sessionId || this.sessionService.getSessionId();

        bootstrap.Modal.getInstance(
          document.getElementById('createSessionModal')!
        )?.hide();

        document.body.classList.remove('modal-open');
        document.querySelector('.modal-backdrop')?.remove();

        this.sessionService
          .getAllSessions()
          .subscribe((sessions) => (this.sessions = sessions));

        if (newSessionId) {
          this.joinSession(newSessionId);
        } else {
          console.error('No session ID returned');
        }
      },
      error: (err) => console.error(err),
    });
  }

  copyLinkToClipboard(sessionId: string): void {
    const currentGameLink = `${window.location.origin}/session/${sessionId}`;

    navigator.clipboard
      .writeText(currentGameLink)
      .then(() => {
        console.log('Link skopiowany do schowka');
      })
      .catch((err) => {
        console.error('Nie udało się skopiować linku', err);
      });
  }
  logout(): void {
    this.authService.logout();
  }

  navigateToSessionList(): void {
    this.router.navigate(['/sessionList']);
  }
}
