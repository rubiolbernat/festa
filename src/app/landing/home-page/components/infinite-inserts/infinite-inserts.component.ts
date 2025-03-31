import { Component, OnInit } from '@angular/core';
import { DatePipe, NgIf, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

// Core Imports
import { ConcertService } from '../../../../core/services/concert_db/concert.service';
import { Concert } from '../../../../core/models/concert';
import { CombinedDrinkUserData } from '../../../../core/models/drink-data.model';
import { DrinkingDataService } from '../../../../core/services/drinking-data/drinking-data.service';

// Stories Imports
import { Story, UserStoryData } from './../../../../core/models/stories.model'; // Assegura't que Story té originalDrinkId?
import { StoriesComponent } from './../../../stories-component/stories.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-infinite-inserts',
  standalone: true,
  imports: [
    DatePipe,
    NgIf,
    RouterModule,
    CommonModule,
    InfiniteScrollModule,
    StoriesComponent
  ],
  templateUrl: './infinite-inserts.component.html',
  styleUrls: ['./infinite-inserts.component.css']
})
export class InfiniteInsertsComponent implements OnInit {

  // --- Propietats Existents ---
  nextConcert: Concert | null = null;
  InfiniteDrinks: CombinedDrinkUserData[] = [];
  limit = 10;
  offset = 0;
  loading = false;
  allInsertsLoaded = false;
  deletefirst: boolean = true;

  // --- Propietats per a Stories ---
  showStoriesViewer: boolean = false;
  allStoriesForViewer: UserStoryData[] = [];
  initialStoryIndexForViewer: number = 0;

  constructor(
    private concertService: ConcertService,
    private drinkingdataService: DrinkingDataService
  ) { }

  ngOnInit(): void {
    this.loadInserts();
  }

  // --- Funció per carregar inserts (modificada per transformar TOTES les dades) ---
  loadInserts(): void {
    if (this.loading || this.allInsertsLoaded) return;
    this.loading = true;

    this.drinkingdataService
      .getInsertsPaginated(this.limit, this.offset)
      .subscribe({
        next: (newDrinks: CombinedDrinkUserData[]) => {
          if (newDrinks.length === 0) {
            this.allInsertsLoaded = true;
          } else {
            // IMPORTANT: Parseja PRIMER
            const parsedDrinks = newDrinks.map(drink => this.parseDrinkData(drink));

            // Afegeix els parsejats a la llista principal
            this.InfiniteDrinks = this.InfiniteDrinks.concat(parsedDrinks);
            this.offset += this.limit;

            if (this.deletefirst) {
              // Assegura't que hi hagi elements abans de fer shift
              if (this.InfiniteDrinks.length > 0) {
                this.InfiniteDrinks.shift();
              }
              this.deletefirst = false;
            }

            // Transforma TOT l'array actualitzat a format Story
            this.allStoriesForViewer = this.transformDrinksToStories(this.InfiniteDrinks);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error carregant inserts:', error);
          this.loading = false;
        },
      });
  }

  // --- Funció auxiliar per parsejar dades (IMPLEMENTACIÓ COMPLETA) ---
  parseDrinkData(drink: any): CombinedDrinkUserData {
    // Assegura't que retornes un objecte que compleix la interfície
    // Inclou 'id' si l'API l'envia i és part del model CombinedDrinkUserData
    const parsedId = parseInt(drink.id, 10);
    return {
      id: isNaN(parsedId) ? 0 : parsedId, // <-- Assumeix que 'id' existeix i és part del model
      latitude: parseFloat(drink.latitude) || 0,
      longitude: parseFloat(drink.longitude) || 0,
      price: parseFloat(drink.price) || 0,
      quantity: parseFloat(drink.quantity) || 0.33,
      num_drinks: parseInt(drink.num_drinks, 10) || 1,
      user_id: parseInt(drink.user_id, 10) || 0,
      image_url: drink.image_url || '',
      user_name: drink.user_name || '',
      user_email: drink.user_email || '',
      date: drink.date || '',
      timestamp: drink.timestamp || '', // Assegura timestamp si és part del model
      day_of_week: parseInt(drink.day_of_week, 10) || 0,
      location: drink.location || '',
      drink: drink.drink || '',
      others: drink.others || '',
      // Afegeix altres camps si són part de CombinedDrinkUserData
    };
  }


  // --- Funció auxiliar per construir URL de miniatures (sense canvis) ---
  getThumbnailUrl(relativePath: string | undefined | null): string {
    if (!relativePath) { return 'https://joc.feritja.cat/image.png'; }
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) { return relativePath; }
    const baseUrl = environment.assetsUrl.endsWith('/') ? environment.assetsUrl : environment.assetsUrl + '/';
    const imagePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return baseUrl + imagePath;
  }

  // --- Funció per transformar l'array de Drinks a UserStoryData[] (CORREGIDA) ---
  transformDrinksToStories(drinks: CombinedDrinkUserData[]): UserStoryData[] {
    const profilePlaceholder = 'assets/images/default-profile.png'; // Ajusta ruta

    return drinks
      .filter(drink => drink && drink.image_url) // Filtra els que tenen imatge
      .map(drink => {
        const userStory: UserStoryData = {
          user: {
            name: drink.user_name?.split(' ')[0] || 'Usuari',
            id: drink.user_id,
            profileImage: profilePlaceholder,
            stories: [
              {
                imageUrl: drink.image_url || '',
                // !!! Assegura't que 'drink.id' existeix i és un número !!!
                // Si CombinedDrinkUserData no té 'id', no pots posar originalDrinkId
                // o l'has de treure d'un altre lloc (potser l'índex?)
                originalDrinkId: drink.id // <-- Dependent de CombinedDrinkUserData tenint 'id'
              }
            ]
          }
        };
        return userStory;
      });
  }


  // --- Funció per gestionar l'scroll (sense canvis) ---
  onScroll(): void {
    this.loadInserts();
  }

  // --- Mètode per Obrir el Visor indicant l'ÍNDEX (CORREGIT) ---
  openStoriesViewerAtIndex(index: number): void {
    const clickedDrink = this.InfiniteDrinks[index];
    // Comprovació extra per assegurar que clickedDrink i el seu id existeixen
    if (!clickedDrink || !clickedDrink.image_url || typeof clickedDrink.id === 'undefined') {
      console.error("L'element clicat no té imatge o ID:", index, clickedDrink);
      return;
    }

    // Troba l'índex a l'array transformat comparant l'ID original
    const viewerIndex = this.allStoriesForViewer.findIndex(storyData =>
      storyData.user.stories[0]?.originalDrinkId === clickedDrink.id
    );

    if (viewerIndex === -1) {
      console.error(`No s'ha trobat la story corresponent al visor per a l'ID: ${clickedDrink.id} (índex original: ${index})`);
      // Considera què fer aquí: mostrar un error, no obrir res...
      return;
    }

    this.initialStoryIndexForViewer = viewerIndex;
    this.showStoriesViewer = true;
  }

  // --- Mètode per Tancar el Visor (sense canvis) ---
  closeStoriesViewer(): void {
    this.showStoriesViewer = false;
    this.initialStoryIndexForViewer = 0;
  }

  // --- Funció TrackBy (sense canvis, però depèn de 'id') ---
  trackById(index: number, item: CombinedDrinkUserData): number {
    // !!! Assegura't que 'item.id' existeix i és un número a CombinedDrinkUserData !!!
    return item.id ?? index; // Usa '??' per fallback a index si id és null/undefined
  }

  handleThumbnailError(event: Event): void {
    const imageElement = event.target as HTMLImageElement; // Type assertion

    if (imageElement) {
      // Amaga la pròpia imatge que ha fallat
      imageElement.style.display = 'none';

      // Intenta afegir la classe 'error' a l'element pare (el div.story-thumbnail)
      if (imageElement.parentElement) {
        imageElement.parentElement.classList.add('error');
      } else {
        console.warn('handleThumbnailError: No s\'ha trobat parentElement per afegir la classe d\'error', imageElement);
      }
    } else {
      console.warn('handleThumbnailError: L\'event d\'error no prové d\'un element esperat', event);
    }
  }
}
