import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Card } from '../../../models/card.model';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
})
export class CardsComponent {
  cards$: Observable<Card[]> = of([]);
  @Input() selectedCardValue: string | null = null;
  @Output() cardSelected = new EventEmitter<number | string | null>();

  selectCard(card: Card): void {
    this.cardSelected.emit(card.value ?? null);
  }
}
