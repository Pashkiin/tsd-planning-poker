import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();

    if (this.userId) {
      this.sessionService.getAllSessions().subscribe({
        next: (sessions: SessionSummary[]) => {
          this.sessions = sessions;
        },
        error: (err) => {
          console.error('Błąd podczas pobierania sesji:', err);
        },
      });
    } else {
      console.error('Brak identyfikatora użytkownika!');
      this.router.navigate(['/login']);
    }

    this.sessionForm = this.fb.group({
      sessionName: ['', Validators.required],
      taskName: ['', Validators.required],
      taskDescription: ['', Validators.required],
    });
  }

  createSession(): void {
    const modal = new bootstrap.Modal(
      document.getElementById('createSessionModal')!
    );
    modal.show();
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
        bootstrap.Modal.getInstance(
          document.getElementById('createSessionModal')!
        )?.hide();
        this.sessionService
          .getAllSessions()
          .subscribe((sessions) => (this.sessions = sessions));
      },
      error: (err) => console.error(err),
    });
    this.router.navigate([`/session/${this.sessionService.getSessionId()}`]);
  }
}
