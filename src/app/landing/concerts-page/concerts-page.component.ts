import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor} from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ConcertService } from '../../core/services/concert_db/concert.service';
import { Concert } from '../../core/models/concert';

@Component({
  selector: 'app-concerts-page',
  imports: [DatePipe, NgFor, InfiniteScrollModule],
  templateUrl: './concerts-page.component.html',
  styleUrls: ['./concerts-page.component.css']
})
export class ConcertsPageComponent implements OnInit {
  concerts: Concert[] = []; // Llista de concerts
  limit = 10; // Nombre de concerts a carregar per pàgina
  offset = 0; // Offset inicial
  loading = false; // Per evitar múltiples càrregues simultànies
  allConcertsLoaded = false; // Per saber si ja s'han carregat tots els concerts

  constructor(private concertService: ConcertService) { }

  ngOnInit(): void {
    this.loadConcerts(); // Carrega els primers concerts
  }

  // Funció per carregar concerts
  loadConcerts(): void {
    if (this.loading || this.allConcertsLoaded) return; // Evita càrregues redundants

    this.loading = true;
    this.concertService.getConcertsPaginated(this.limit, this.offset).subscribe(
      (newConcerts: Concert[]) => {
        if (newConcerts.length === 0) {
          this.allConcertsLoaded = true; // No hi ha més concerts per carregar
        } else {
          this.concerts = this.concerts.concat(newConcerts); // Afegeix els nous concerts a la llista
          this.offset += this.limit; // Incrementa l'offset per a la propera càrrega
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error carregant concerts:', error);
        this.loading = false;
      }
    );
  }

  // Funció que es crida quan l'usuari fa scroll fins al final
  onScroll(): void {
    this.loadConcerts();
  }
}
