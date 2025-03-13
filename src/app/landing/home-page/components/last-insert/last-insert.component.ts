import { DrinkingDataService } from './../../../../core/services/drinking-data/drinking-data.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { ConcertService } from '../../../../core/services/concert_db/concert.service';
import { CombinedDrinkUserData } from '../../../../core/models/drink-data.model';
import { Concert } from '../../../../core/models/concert';
import { RouterModule } from '@angular/router';
import JSConfetti from 'js-confetti'

@Component({
  selector: 'app-last-insert',
  standalone: true,
  imports: [DatePipe, NgIf, RouterModule],
  templateUrl: './last-insert.component.html',
  styleUrl: './last-insert.component.css'
})
export class LastInsertComponent implements OnInit, AfterViewInit {
  nextConcert: Concert | null = null;
  lastDrink: CombinedDrinkUserData | null = null;
  jsConfetti: any;

  constructor(private concertService: ConcertService, private drinkingdataService: DrinkingDataService) { }

  ngOnInit(): void {
    this.loadNextConcert();
    this.loadlastinserted();
  }
  ngAfterViewInit(): void {
    this.jsConfetti = new JSConfetti({
      canvas: document.getElementById('confetti-canvas') as HTMLCanvasElement
    });
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

  lancarConfetti() {
    if (this.jsConfetti) {
      // Llança confeti de colors
      this.jsConfetti.addConfetti({
        confettiNumber: 170, // Ajusta el número segons sigui necessari
      });

      // Llança emojis
      this.jsConfetti.addConfetti({
        emojis: ['🍺', '🥂', '🍷', '🥃', '🍻', '🍸', '🍾'],
        emojiSize: 30,
        confettiNumber: 20, // Ajusta el número segons sigui necessari
      });
    }
  }
}
