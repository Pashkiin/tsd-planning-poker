export interface Card {
  _id: string;
  value: number;
  label: string;
  description?: string;
  isSpecial?: boolean;
  color?: string;
}

export type CreateCardDto = Omit<Card, '_id'>;
