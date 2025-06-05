import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, CreateCardDto } from '../models/card.model';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  // Base API URL
  private apiUrl = '/api/cards';

  constructor(private http: HttpClient) {}

  // Get all cards
  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(this.apiUrl);
  }

  // Get a single card by ID
  // getCardById(id: string): Observable<Card> {
  //   return this.http.get<Card>(`<span class="math-inline">\{this\.apiUrl\}/</span>{id}`);
  // }

  // Create a new card
  // createCard(cardData: CreateCardDto): Observable<Card> {
  //   return this.http.post<Card>(this.apiUrl, cardData);
  // }

  // Update a card
  // updateCard(id: string, cardData: Partial<CreateCardDto>): Observable<Card> {
  //   return this.http.put<Card>(`<span class="math-inline">\{this\.apiUrl\}/</span>{id}`, cardData);
  // }

  // Delete a card
  // deleteCard(id: string): Observable<void> { // Or Observable<{}> depending on API response
  //   return this.http.delete<void>(`<span class="math-inline">\{this\.apiUrl\}/</span>{id}`);
  // }
}
