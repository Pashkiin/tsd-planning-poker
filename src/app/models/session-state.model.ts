export interface Player {
  id: string;
  username: string;
  selectedCardValue: number | null | 'Voted';
  hasLockedVote: boolean;
}

export interface Task {
  id: string;
  name: string;
  status: 'active' | 'estimated';
  averageEstimation: number | null;
  revealed: boolean;
}

export interface GameSession {
  sessionId: string;
  sessionName: string;
  creatorId: string; // PlayerModel.id of the creator
  players: Player[];
  tasks: Task[];
  currentTaskId: string;
  currentTaskName: string;
  currentTaskStatus: 'active' | 'estimated';
  lockedVotesCount: number;
  totalPlayers: number;
  areVotesRevealedForCurrentTask: boolean;
  currentTaskEstimations: { [playerId: string]: number };
}
