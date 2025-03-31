import { DrinkingDataService } from './../../../../core/services/drinking-data/drinking-data.service';
import { Component, OnInit, AfterViewInit } from '@angular/core'; // Eliminat ElementRef, ViewChild si no es fan servir
import { DatePipe, NgIf } from '@angular/common';
import { CombinedDrinkUserData } from '../../../../core/models/drink-data.model';
import { RouterModule } from '@angular/router';
import JSConfetti from 'js-confetti';
// Eliminat environment si ja no el fas servir aquí directament per construir la URL
// import { environment } from '../../../../../environments/environment';
import { StoriesComponent } from './../../../stories-component/stories.component';
import { Story, UserStoryData } from './../../../../core/models/stories.model'

@Component({
  selector: 'app-last-insert',
  standalone: true,
  imports: [DatePipe, NgIf, RouterModule, StoriesComponent],
  templateUrl: './last-insert.component.html',
  styleUrls: ['./last-insert.component.css']
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
    image_url: '' // Aquesta és la que ens interessa
  };

  lastDrink: CombinedDrinkUserData = this.drinkDataempty;
  jsConfetti: any;
  showStory: boolean = false;
  storyDataForComponent: UserStoryData[] = [];

  constructor(private drinkingdataService: DrinkingDataService) { }

  ngOnInit(): void {
    this.loadlastinserted();
  }

  ngAfterViewInit(): void {
    const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
    if (canvas) {
       this.jsConfetti = new JSConfetti({ canvas });
    } else {
       console.warn('Confetti canvas not found');
    }
  }

  loadlastinserted(): void {
    this.drinkingdataService.getlastinserted().subscribe({
      next: drink => {
        console.log('Last drink received:', drink);
        // Parseja les dades (converteix a números si cal)
        this.lastDrink = this.parseDrinkData(drink);
        // Prepara les dades per a StoriesComponent SENSE afegir la URL base aquí
        this.prepareStoryData(this.lastDrink);
      },
      error: (err) => {
        console.error("Error loading last inserted drink:", err);
        this.lastDrink = this.drinkDataempty;
        this.storyDataForComponent = [];
      }
    });
  }

  parseDrinkData(drink: any): CombinedDrinkUserData {
      // Assegura que les propietats numèriques siguin números
      return {
          ...drink,
          latitude: parseFloat(drink.latitude) || 0,
          longitude: parseFloat(drink.longitude) || 0,
          price: parseFloat(drink.price) || 0,
          quantity: parseFloat(drink.quantity) || 0.33,
          num_drinks: parseInt(drink.num_drinks, 10) || 1,
          user_id: parseInt(drink.user_id, 10) || 0,
          // image_url es manté com string (relatiu o absolut, com vingui de l'API)
          image_url: drink.image_url || ''
      };
  }


  // --- MODIFICAT ---
  prepareStoryData(drink: CombinedDrinkUserData): void {
    // Comprovació bàsica de dades
    if (!drink || !drink.user_id || !drink.image_url) {
      console.warn("Incomplete drink data received, cannot prepare story.");
      this.storyDataForComponent = [];
      return;
    }

    // PASSA LA image_url DIRECTAMENT (sense prefixar)
    // El component StoriesComponent s'encarregarà d'afegir environment.assetsUrl si cal
    const storyImageUrl = drink.image_url;

    // Utilitza el placeholder local per a la imatge de perfil
    // StoriesComponent també intentarà prefixar-la. La seva funció buildFullImageUrl
    // hauria de detectar 'assets/' o ser prou intel·ligent per no prefixar-la.
    const profilePlaceholder = 'assets/images/default-profile.png'; // Ruta al teu placeholder local

    // Crea l'estructura de dades per a StoriesComponent
    const userStory: UserStoryData = {
      user: {
        name: drink.user_name?.split(' ')[0] || 'Usuari', // Només el primer nom
        id: drink.user_id,
        profileImage: profilePlaceholder, // Passa la ruta del placeholder
        stories: [
          {
            // Passa la URL de la imatge SENSE modificar
            imageUrl: storyImageUrl,
            // Valors per defecte per als vots (ja que no vénen de l'API aquí)
            votes: 0,
            votsPositius: 0,
            votsNegatius: 0
          }
        ]
      }
    };

    // Assigna les dades preparades
    this.storyDataForComponent = [userStory];
    console.log('Prepared story data for component (passing relative URLs):', this.storyDataForComponent);
  }


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

  openImage() {
    if (this.storyDataForComponent.length > 0) {
       this.showStory = true;
       // console.log('Opening story viewer...');
    } else {
       console.warn("No story data available to show.");
    }
  }

  closeImage() {
    this.showStory = false;
    // console.log('Closing story viewer...');
  }
}
