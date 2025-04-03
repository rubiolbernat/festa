import { Component, OnInit } from '@angular/core';
import { DatePipe, NgIf, CommonModule } from '@angular/common'; // Afegit CommonModule
import { RouterModule } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

// Core Imports
// import { ConcertService } from '../../../../core/services/concert_db/concert.service'; // Comentat si no s'usa
// import { Concert } from '../../../../core/models/concert'; // Comentat si no s'usa
import { CombinedDrinkUserData } from '../../../../core/models/drink-data.model';
import { DrinkingDataService } from '../../../../core/services/drinking-data/drinking-data.service';

// *** Importa els NOUS models de Story ***
import { StoryUserData, StorySlide, StoryDrink } from '../../../../core/models/stories.model';
// *** ELIMINA els imports dels models antics ***
// import { Story, UserStoryData, StoryDrink } from './../../../../core/models/stories.model'; // <-- Eliminar si no s'usa

// Stories Imports
import { StoriesViewer } from '../../../stories-viewer/StoriesViewer';
import { environment } from '../../../../../environments/environment'; // Necessari per getThumbnailUrl

@Component({
  selector: 'app-infinite-inserts',
  standalone: true,
  imports: [
    DatePipe,
    NgIf,
    RouterModule,
    CommonModule, // Necessari per *ngIf, *ngFor, etc.
    InfiniteScrollModule,
    StoriesViewer
  ],
  templateUrl: './infinite-inserts.component.html',
  styleUrls: ['./infinite-inserts.component.css']
})
export class InfiniteInsertsComponent implements OnInit {

  // --- Dades de Begudes Carregades ---
  InfiniteDrinks: CombinedDrinkUserData[] = [];
  limit = 10;
  offset = 0;
  loading = false;
  allInsertsLoaded = false;
  // deletefirst: boolean = true; // Considera si realment necessites aquesta lògica

  // --- Dades per al Visor de Stories (NOU MODEL) ---
  showStoriesViewer: boolean = false;
  storyDataForViewer: StoryUserData[] = []; // <-- Tipus actualitzat
  initialStoryIndexForViewer: number = 0; // Aquest serà l'índex dins de storyDataForViewer

  // Injecta els serveis necessaris
  constructor(
    // private concertService: ConcertService, // Comentat si no s'usa
    private drinkingdataService: DrinkingDataService
  ) { }

  ngOnInit(): void {
    this.loadInserts(); // Carrega les primeres dades
  }

  // --- Funció per carregar inserts (Modificada per preparar dades per al visor) ---
  loadInserts(): void {
    if (this.loading || this.allInsertsLoaded) return;
    this.loading = true;

    this.drinkingdataService
      .getInsertsPaginated(this.limit, this.offset)
      .subscribe({
        next: (newDrinks: CombinedDrinkUserData[]) => {
          if (newDrinks.length === 0) {
            this.allInsertsLoaded = true;
            console.log("Tots els inserts carregats.");
          } else {
            // 1. Parseja les noves begudes rebudes
            const parsedDrinks = newDrinks.map(drink => this.parseDrinkData(drink));
            console.log(`Carregats ${parsedDrinks.length} nous inserts.`);

            // 2. Afegeix les noves begudes parsejades a l'array principal
            this.InfiniteDrinks = this.InfiniteDrinks.concat(parsedDrinks);

            // 3. Actualitza l'offset per a la propera càrrega
            this.offset += newDrinks.length; // Incrementa per la quantitat real rebuda

            // 4. Prepara/Actualitza TOTES les dades per al visor de stories
            //    a partir de TOTES les begudes carregades fins ara
            this.prepareAllStoriesForViewer(this.InfiniteDrinks);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error carregant inserts:', error);
          this.loading = false;
        },
      });
  }

  /** Funció auxiliar per parsejar dades de beguda (assegura tipus) */
  parseDrinkData(drink: any): CombinedDrinkUserData {
    // Assegura't que el model CombinedDrinkUserData té 'id'
    const parsedId = parseInt(drink.id, 10);
    const userId = parseInt(drink.user_id, 10);
    return {
      id: isNaN(parsedId) ? 0 : parsedId, // ID del registre drink_data
      user_id: isNaN(userId) ? 0 : userId,
      date: drink.date || '',
      timestamp: drink.timestamp || new Date().toISOString(), // Fallback a data actual si no ve timestamp
      day_of_week: parseInt(drink.day_of_week, 10) || 0,
      location: drink.location || '',
      latitude: parseFloat(drink.latitude) || 0,
      longitude: parseFloat(drink.longitude) || 0,
      drink: drink.drink || '',
      quantity: parseFloat(drink.quantity) || 0.33,
      others: drink.others || '',
      price: parseFloat(drink.price) || 0,
      num_drinks: parseInt(drink.num_drinks, 10) || 1,
      // Dades de l'usuari (ajusta si els noms són diferents)
      user_name: drink.user_name || 'Usuari Anònim',
      user_email: drink.user_email || '', // Opcional
      // Imatge (molt important)
      image_url: drink.image_url || null, // null si no hi ha imatge
      votes: drink.votes
    };
  }

  /**
   * Transforma TOT l'array de CombinedDrinkUserData a StoryUserData[]
   * Agrupa les stories per usuari si vols mostrar totes les d'un usuari juntes,
   * o crea una entrada StoryUserData per cada beguda amb imatge si vols que cada
   * miniatura porti directament a aquesta "story" única.
   *
   * Opció Escollida: Una entrada StoryUserData per cada beguda amb imatge.
   * Això simplifica trobar l'índex al visor.
   */
  prepareAllStoriesForViewer(allDrinks: CombinedDrinkUserData[]): void {
    this.storyDataForViewer = allDrinks
      .filter(drink => drink && drink.image_url) // Filtra només les que tenen imatge
      .map((drink, index) => { // Mapeja cada beguda amb imatge a una estructura StoryUserData
        // Crea els detalls de la beguda
        const drinkDetails: StoryDrink = {
          drinkId: drink.id ?? 0, // Fallback to 0 if drink.id is undefined
          date: drink.date,
          location: drink.location,
          name: drink.drink,
          quantity: drink.quantity,
          price: drink.price,
          count: drink.num_drinks,
          others: drink.others || ''
        };

        // Crea la única slide per a aquesta entrada
        const singleSlide: StorySlide = {
          // Usem l'ID del drink_data com a ID únic per a aquesta story/slide
          // Això és crucial per trobar-la després
          storyId: drink.id ?? 0, // Fallback to 0 if drink.id is undefined
          imageUrl: drink.image_url!, // Ja hem filtrat per !null
          uploadedAt: (drink.timestamp instanceof Date ? drink.timestamp.toISOString() : drink.timestamp) || new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Caducitat per defecte
          votes: drink.votes ?? 0, // Valor inicial
          isSaved: false,
          hasBeenSeen: false,
          drink: drinkDetails
        };

        // Crea l'entrada StoryUserData per a l'usuari d'aquesta beguda
        const userData: StoryUserData = {
          userId: drink.user_id,
          userName: drink.user_name,
          stories: [singleSlide] // Només conté aquesta slide
        };
        return userData;
      });
    console.log(`Preparades ${this.storyDataForViewer.length} stories per al visor.`);
  }


  /** Funció per construir URL de miniatures */
  getThumbnailUrl(relativePath: string | undefined | null): string {
    // Retorna placeholder si no hi ha imatge
    if (!relativePath) { return 'assets/images/default-placeholder.png'; } // Ajusta la ruta del teu placeholder
    // Retorna si ja és absoluta
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
      return relativePath;
    }
    // Construeix amb la base dels assets
    const baseUrl = environment.assetsUrl.endsWith('/') ? environment.assetsUrl : environment.assetsUrl + '/';
    const imagePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return baseUrl + imagePath;
  }

  /** Funció per gestionar l'scroll (crida a loadInserts) */
  onScroll(): void {
    console.log("Scroll detectat, intentant carregar més...");
    this.loadInserts();
  }

  /**
   * Mètode per Obrir el Visor indicant l'índex de la BEGUDA clicada.
   * Troba l'índex corresponent dins de storyDataForViewer.
   */
  openStoriesViewerAtIndex(indexInInfiniteDrinks: number): void {
    // 1. Obtenir la beguda clicada des de l'array original
    const clickedDrink = this.InfiniteDrinks[indexInInfiniteDrinks];

    // 2. Comprovar si té imatge i ID (necessari per buscar)
    if (!clickedDrink || !clickedDrink.image_url || typeof clickedDrink.id === 'undefined') {
      console.error("L'element clicat no té imatge o ID vàlid:", indexInInfiniteDrinks, clickedDrink);
      return; // No obrir el visor si no es pot buscar
    }

    // 3. Trobar l'índex a l'array preparat per al visor (storyDataForViewer)
    //    Busquem l'entrada on la 'storyId' de la primera (i única) slide
    //    coincideixi amb l'ID de la beguda clicada.
    const viewerIndex = this.storyDataForViewer.findIndex(userData =>
      userData.stories && userData.stories.length > 0 && userData.stories[0].storyId === clickedDrink.id
    );

    // 4. Comprovar si s'ha trobat l'índex
    if (viewerIndex === -1) {
      console.error(`No s'ha trobat la story corresponent al visor per a drink.id: ${clickedDrink.id} (índex original: ${indexInInfiniteDrinks}). Comprova la lògica de 'prepareAllStoriesForViewer'.`);
      // Considera mostrar un missatge a l'usuari
      return;
    }

    // 5. Establir l'índex inicial per al visor i mostrar-lo
    this.initialStoryIndexForViewer = viewerIndex;
    this.showStoriesViewer = true;
    console.log(`Obrint visor a l'índex (del visor): ${viewerIndex} (correspon a l'índex original: ${indexInInfiniteDrinks})`);
  }

  /** Mètode per Tancar el Visor */
  closeStoriesViewer(): void {
    this.showStoriesViewer = false;
    this.initialStoryIndexForViewer = 0; // Reseteja l'índex
    console.log('Visor de stories tancat.');
  }

  /** Funció TrackBy per a l'NgFor (utilitza l'ID de la beguda) */
  trackById(index: number, item: CombinedDrinkUserData): number {
    // Retorna l'ID de la beguda si existeix, sinó l'índex com a fallback
    return item?.id ?? index;
  }

  /** Gestor d'errors per a miniatures */
  handleThumbnailError(event: Event): void {
    const imageElement = event.target as HTMLImageElement;
    if (imageElement) {
      // Opcional: Assignar un placeholder directament
      // imageElement.src = 'assets/images/placeholder-error.png';
      // O Amagar la imatge trencada
      imageElement.style.display = 'none';
      // Intentar afegir classe d'error al pare per mostrar un fons o icona CSS
      if (imageElement.parentElement) {
        imageElement.parentElement.classList.add('thumbnail-error'); // Afegeix una classe CSS que defineixis
      }
    }
  }
}
