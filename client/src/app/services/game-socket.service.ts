import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameSocketService {
  private socketConnectedSubject = new BehaviorSubject<boolean>(false);
  public socketConnected$ = this.socketConnectedSubject.asObservable();

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
}
