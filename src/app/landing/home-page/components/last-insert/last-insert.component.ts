import { environment } from '../../../../../environments/environment';
// Core Angular Imports
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DatePipe, NgIf, CommonModule } from '@angular/common'; // Afegit CommonModule per *ngIf al template
import { RouterModule } from '@angular/router';

// Serveis i Models
import { DrinkingDataService } from './../../../../core/services/drinking-data/drinking-data.service';
import { CombinedDrinkUserData } from '../../../../core/models/drink-data.model'; // Model de dades de la beguda rebuda
// *** Importa els NOUS models de Story ***
import { StoryUserData, StorySlide, StoryDrink } from './../../../../core/models/stories.model';
// *** ELIMINA els imports dels models antics si ja no es fan servir enlloc més ***
// import { Story, UserStoryData } from './../../../../core/models/stories.model' // <-- Eliminar

// Components
import { StoriesViewer } from '../../../stories-viewer/StoriesViewer'; // El teu component visor

// Altres
import JSConfetti from 'js-confetti';

@Component({
  selector: 'app-last-insert',
  standalone: true,
  // Assegura't que CommonModule està als imports per *ngIf, etc.
  imports: [DatePipe, NgIf, RouterModule, StoriesViewer, CommonModule],
  templateUrl: './last-insert.component.html',
  styleUrls: ['./last-insert.component.css']
})
export class LastInsertComponent implements OnInit, AfterViewInit {

  // Model per a la darrera beguda inserida (es manté)
  lastDrink: CombinedDrinkUserData | null = null; // Inicialitza a null per saber si s'ha carregat

  // Confetti (es manté)
  jsConfetti: any;

  // Control del visor
  showStory: boolean = false;

  // *** Propietat per passar al visor, ARA utilitza el NOU model ***
  storyDataForViewer: StoryUserData[] = []; // Un array que contindrà un únic StoryUserData

  // Estat de càrrega
  isLoading: boolean = true;
  errorMsg: string | null = null;

  constructor(private drinkingdataService: DrinkingDataService) { }

  ngOnInit(): void {
    this.loadlastinserted();
  }

  ngAfterViewInit(): void {
    // Inicialització de Confetti (es manté)
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
    if (canvas) {
       this.jsConfetti = new JSConfetti({ canvas });
    } else {
       console.warn('Canvas per a confetti no trobat');
    }
  }

  /** Carrega l'últim registre de beguda */
  loadlastinserted(): void {
    this.isLoading = true;
    this.errorMsg = null;
    this.lastDrink = null; // Reseteja les dades anteriors
    this.storyDataForViewer = []; // Reseteja les dades per al visor

    this.drinkingdataService.getlastinserted().subscribe({
      next: drink => {
        console.log('Darrera beguda rebuda:', drink);
        if (drink && drink.user_id) { // Comprova si realment s'ha rebut alguna dada vàlida
          this.lastDrink = this.parseDrinkData(drink); // Parseja (converteix números)
          this.prepareStoryDataForViewer(this.lastDrink); // Prepara les dades per al visor
        } else {
          console.warn("No s'ha rebut l'última beguda o no té dades d'usuari.");
           this.errorMsg = "No s'ha trobat l'últim registre."; // O un missatge més amigable
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error al carregar l'última beguda:", err);
        this.errorMsg = "No s'ha pogut carregar l'últim registre.";
        this.isLoading = false;
        this.lastDrink = null;
        this.storyDataForViewer = [];
      }
    });
  }

  /** Funció per parsejar les dades rebudes (assegura tipus numèrics) - Es manté similar */
  parseDrinkData(drink: any): CombinedDrinkUserData {
      return {
          ...drink,
          id: parseInt(drink.id, 10) || 0, // Guarda l'ID del registre drink_data si ve
          latitude: parseFloat(drink.latitude) || 0,
          longitude: parseFloat(drink.longitude) || 0,
          price: parseFloat(drink.price) || 0,
          quantity: parseFloat(drink.quantity) || 0.33,
          num_drinks: parseInt(drink.num_drinks, 10) || 1,
          user_id: parseInt(drink.user_id, 10) || 0,
          image_url: drink.image_url || null // Guarda null si no hi ha imatge
      };
  }

  /**
   * Prepara l'estructura de dades StoryUserData[] que espera el component StoriesViewer,
   * a partir de les dades d'una única beguda (lastDrink).
   */
  prepareStoryDataForViewer(drink: CombinedDrinkUserData | null): void {
    // Comprova si tenim dades vàlides i una URL d'imatge
    if (!drink || !drink.user_id || !drink.image_url) {
      console.warn("Dades de beguda incompletes o sense imatge, no es pot preparar la story.");
      this.storyDataForViewer = []; // Assegura que l'array estigui buit
      return;
    }

    // 1. Crea l'objecte StoryDrink a partir de CombinedDrinkUserData
    const drinkDetails: StoryDrink = {
      drinkId: drink.id ?? 0, // Usa l'ID del registre drink_data si existeix
      date: drink.date,
      location: drink.location,
      name: drink.drink,
      quantity: drink.quantity,
      price: drink.price,
      count: drink.num_drinks,
      others: drink.others || ''
    };

    // 2. Crea l'únic objecte StorySlide
    const singleSlide: StorySlide = {
      storyId: drink.id ?? 0, // Pots reutilitzar l'ID de drink_data o un valor per defecte
      imageUrl: drink.image_url, // Passa la URL tal com ve de l'API
      uploadedAt: (drink.timestamp instanceof Date ? drink.timestamp.toISOString() : drink.timestamp) || new Date().toISOString(), // Usa el timestamp si ve, sinó data actual
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Caducitat per defecte 24h
      votes: drink.votes ?? 0, // Valor per defecte, no tenim vots aquí
      isSaved: false, // Valor per defecte
      hasBeenSeen: false, // Valor per defecte
      drink: drinkDetails // Assigna els detalls de la beguda
    };

    // 3. Crea l'objecte StoryUserData per a aquest usuari
    const userData: StoryUserData = {
      userId: drink.user_id,
      userName: drink.user_name || 'Usuari', // Nom d'usuari
      stories: [singleSlide] // Array amb la única slide creada
      // No definim thumbnailUrl aquí, el visor pot agafar-la de la primera story
    };

    // 4. Assigna l'estructura final a la propietat que s'enviarà al visor
    // Ha de ser un array que contingui l'objecte de l'usuari
    this.storyDataForViewer = [userData];

    console.log('Dades preparades per al visor:', JSON.stringify(this.storyDataForViewer));
  }

  /** Funció per construir URL completa (similar a la del visor) */
  buildFullImageUrl(relativePath: string | undefined | null): string {
    if (!relativePath) { return 'assets/images/default-placeholder.png'; } // Fallback diferent?
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
      return relativePath;
    }
    const baseUrl = environment.assetsUrl.endsWith('/') ? environment.assetsUrl : environment.assetsUrl + '/';
    const imagePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return baseUrl + imagePath;
  }

  /** Getter per obtenir la URL de la miniatura per al template */
  get lastDrinkThumbnailUrl(): string | null {
      if (this.lastDrink && this.lastDrink.image_url) {
          return this.buildFullImageUrl(this.lastDrink.image_url);
      }
      return null; // Retorna null si no hi ha imatge
  }


  /** Llança confetti (es manté) */
  lancarConfetti() {
    if (this.jsConfetti) {
      this.jsConfetti.addConfetti({ confettiNumber: 170 });
      this.jsConfetti.addConfetti({
        emojis: ['🍺', '🥂', '🍷', '🥃', '🍻', '🍸', '🍾'],
        emojiSize: 30,
        confettiNumber: 20,
      });
    } else {
       console.warn("jsConfetti no està inicialitzat.");
    }
  }

  /** Obre el visor de stories */
  openImage() {
    // Comprova si hi ha dades preparades per al visor
    if (this.storyDataForViewer && this.storyDataForViewer.length > 0) {
       this.showStory = true;
       console.log('Obrint visor de stories...');
    } else {
       console.warn("No hi ha dades de story disponibles per mostrar.");
       // Podries intentar preparar-les de nou si lastDrink existeix?
       // if (this.lastDrink) this.prepareStoryDataForViewer(this.lastDrink);
       // if (this.storyDataForViewer.length > 0) this.showStory = true;
    }
  }

  /** Tanca el visor de stories */
  closeImage() {
    this.showStory = false;
    console.log('Tancant visor de stories...');
  }
}
