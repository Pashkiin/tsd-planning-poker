import { Player } from './player.model';

export interface GameSession {
  taskName: string;
  players: Player[];
}
