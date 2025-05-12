import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { GameComponent } from './components/game/game.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'lobby',
    component: LobbyComponent,
    canActivate: [authGuard],
  },
  {
    path: 'game/:sessionId', // Zmieniamy ścieżkę na dynamiczną
    component: GameComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect empty path to login
  { path: '**', redirectTo: '/login' }, // Redirect unknown paths to login
];
