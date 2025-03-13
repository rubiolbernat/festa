import { Component, OnInit } from '@angular/core';
import { DatePipe, NgIf, CommonModule } from '@angular/common'; // Importa CommonModule
import { ConcertService } from '../../../../core/services/concert_db/concert.service';
import { Concert } from '../../../../core/models/concert';
import { RouterModule } from '@angular/router';
import { CombinedDrinkUserData } from '../../../../core/models/drink-data.model';
import { DrinkingDataService } from '../../../../core/services/drinking-data/drinking-data.service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-infinite-inserts',
  standalone: true,
  imports: [DatePipe, NgIf, RouterModule, CommonModule, InfiniteScrollModule], // Afegeix CommonModule
  templateUrl: './infinite-inserts.component.html',
  styleUrl: './infinite-inserts.component.css'
})
export class InfiniteInsertsComponent implements OnInit {
  nextConcert: Concert | null = null;
  InfiniteDrinks: CombinedDrinkUserData[] = [];
  limit = 10; // Nombre de concerts a carregar per pàgina
  offset = 0; // Offset inicial
  loading = false; // Per evitar múltiples càrregues simultànies
  allInsertsLoaded = false; // Per saber si ja s'han carregat tots els concerts

  deletefirst: boolean = true;

  constructor(private concertService: ConcertService, private drinkingdataService: DrinkingDataService) { }

  ngOnInit(): void {
    this.loadInserts();
  }

  loadNextConcert(): void {
    this.concertService.getNextConcert().subscribe({
      next: concert => this.nextConcert = concert,
      error: () => this.nextConcert = null
    });
  }

  // Funció per carregar concerts
  loadInserts(): void {
    if (this.loading || this.allInsertsLoaded) return; // Evita càrregues redundants

    this.loading = true;
    console.log('Carregant dades: limit =', this.limit, ', offset =', this.offset);

    this.drinkingdataService.getInsertsPaginated(this.limit, this.offset).subscribe(
      (newDrinks: CombinedDrinkUserData[]) => { // Cambio de nombre de variable
        //console.log('Dades rebudes:', newDrinks); // Log de les dades rebudes
        if (newDrinks.length === 0) {
          this.allInsertsLoaded = true; // No hi ha més concerts per carregar
          //console.log('Totes les dades carregades.');
        } else {
          //console.log('Dades actuals a InfiniteDrinks:', this.InfiniteDrinks);
          //console.log('Afegint noves dades:', newDrinks);
          this.InfiniteDrinks = this.InfiniteDrinks.concat(newDrinks); // Afegeix els nous concerts a la llista
          this.offset += this.limit; // Incrementa l'offset per a la propera càrrega
          //console.log('Dades actualitzades a InfiniteDrinks:', this.InfiniteDrinks);
          //console.log('Nou offset:', this.offset);

          // Elimina la primera entrada si n'hi ha a InfiniteDrinks
          if (this.deletefirst === true) {
            this.deletefirst = !this.deletefirst;
            this.InfiniteDrinks.shift(); // Elimina el primer element
            //console.log('Eliminant la primera entrada de InfiniteDrinks.');
          }
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error carregant concerts:', error);
        this.loading = false;
      }
    );
  }

  onScroll(): void {
    this.loadInserts();
  }
}
