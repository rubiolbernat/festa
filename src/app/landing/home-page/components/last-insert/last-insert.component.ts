// Removed duplicate import of StoriesComponent
import { DrinkingDataService } from './../../../../core/services/drinking-data/drinking-data.service';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { ConcertService } from '../../../../core/services/concert_db/concert.service';
import { CombinedDrinkUserData } from '../../../../core/models/drink-data.model';
import { Concert } from '../../../../core/models/concert';
import { RouterModule } from '@angular/router';
import JSConfetti from 'js-confetti';
import { environment } from '../../../../../environments/environment';
import { StoriesComponent } from './../../../stories-component/stories.component';

declare var bootstrap: any;

@Component({
  selector: 'app-last-insert',
  standalone: true,
  imports: [DatePipe, NgIf, RouterModule, StoriesComponent], // Afegim StoryViewerComponent a la llista imports
  templateUrl: './last-insert.component.html',
  styleUrl: './last-insert.component.css'
})
export class LastInsertComponent implements OnInit, AfterViewInit {

  drinkDataempty: CombinedDrinkUserData = {
    user_id: 0,
    date: '',
    day_of_week: 0,
    location: '',
    latitude: 0,
    longitude: 0,
    drink: '',
    quantity: 0.33,
    num_drinks: 1,
    others: '',
    price: 0,
    user_email: '',
    user_name: '',
    image_url: ''
  };

  lastDrink: CombinedDrinkUserData = this.drinkDataempty;
  jsConfetti: any;

  showImage: boolean = false; // Afegim la propietat showImage
  showStory: boolean = false;

  @ViewChild('imageModal') imageModal!: ElementRef;

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
  }

  loadlastinserted(): void {
    this.drinkingdataService.getlastinserted().subscribe({
      next: drink => {
        console.log(drink);
        this.lastDrink = drink;
      },
      error: () => this.lastDrink = this.drinkDataempty,
    });
  }

  lancarConfetti() {
    if (this.jsConfetti) {
      this.jsConfetti.addConfetti({
        confettiNumber: 170,
      });

      this.jsConfetti.addConfetti({
        emojis: ['🍺', '🥂', '🍷', '🥃', '🍻', '🍸', '🍾'],
        emojiSize: 30,
        confettiNumber: 20,
      });
    }
  }

  // Nova funció per obrir la imatge en un modal
  openImage() {
    this.showStory = true;
  }

  closeImage() {
    this.showStory = false;
  }
}
