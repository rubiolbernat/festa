import { DrinkingDataService } from './../../../../core/services/drinking-data/drinking-data.service';
import { Component, OnInit } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { ConcertService } from '../../../../core/services/concert_db/concert.service';
import { CombinedDrinkUserData } from '../../../../core/models/drink-data.model';
import { Concert } from '../../../../core/models/concert';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-last-insert',
  standalone: true,
  imports: [DatePipe, NgIf, RouterModule],
  templateUrl: './last-insert.component.html',
  styleUrl: './last-insert.component.css'
})
export class LastInsertComponent implements OnInit {
  nextConcert: Concert | null = null;
  lastDrink: CombinedDrinkUserData | null = null;


  constructor(private concertService: ConcertService, private drinkingdataService: DrinkingDataService) { }

  ngOnInit(): void {
    this.loadNextConcert();
    this.loadlastinserted();
  }

  loadNextConcert(): void {
    this.concertService.getNextConcert().subscribe({
      next: concert => this.nextConcert = concert,
      error: () => this.nextConcert = null
    });
  }

  loadlastinserted(): void {
    this.drinkingdataService.getlastinserted().subscribe({
      next: drink => this.lastDrink = drink,
      error: () => this.lastDrink = null
    });
  }

}
