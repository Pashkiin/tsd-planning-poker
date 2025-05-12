import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSocketService } from '../../services/game-socket.service'; // Adjust path
import { SessionService } from '../../services/session.service'; // Adjust path
import { AuthService } from '../../services/auth.service'; // If you need authentication
import { Observable } from 'rxjs';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule], // Just the CommonModule here
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
})
export class SessionComponent {
  socketReady$: Observable<boolean>;

  constructor(
    private gameSocketService: GameSocketService,
    private sessionService: SessionService,
    private authService: AuthService
  ) {
    // Get socket connection status from GameSocketService
    this.socketReady$ = this.gameSocketService.getSessionConnected();
  }

  ngOnInit(): void {
    var sessionId;
    if (this.authService.getRedirectUrl() != null) {
      console.log('Redirect URL:', this.authService.getRedirectUrl());
      sessionId = this.authService.getSessionId();
      this.authService.clearRedirectUrl();
    } else {
      sessionId = this.sessionService.getSessionId();
    }
    const userId = this.authService.getUserId();
    const username = this.authService.getUserName();

    this.joinGameSession(sessionId!, userId!, username!);
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
}
