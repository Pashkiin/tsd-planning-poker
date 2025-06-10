export interface EstimationHistory {
  _id?: string;
  userId: string;
  sessionId: string;
  storyTitle: string;
  selectedCardValue: string;
  date: string;
  teammates: string[];
  allVotes: {
    username: string;
    card: string;
    _id?: string;
  }[];
  __v?: number;
}
