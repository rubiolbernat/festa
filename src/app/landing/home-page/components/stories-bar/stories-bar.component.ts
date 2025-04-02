import { environment } from './../../../../../environments/environment';
import { StoryUserData, StorySlide } from './../../../../core/models/stories.model';
import { StoriesService } from './../../../../core/services/stories/stories.service';
import { Component, OnInit } from '@angular/core'; // Importa OnInit
import { CommonModule } from '@angular/common';
import { StoriesViewer } from '../../../stories-viewer/StoriesViewer';

@Component({
  selector: 'app-stories-bar',
  standalone: true,
  imports: [
    CommonModule,
    StoriesViewer
  ],
  templateUrl: './stories-bar.component.html',
  styleUrls: ['./stories-bar.component.css']
})
export class StoriesBarComponent implements OnInit { // Implementa OnInit

  // Ja NO utilitzem @Input() per a les dades principals

  // Propietat local per guardar les dades rebudes del servei
  // Utilitza la interfície si l'has definida, sinó usa any[]
  storiesData: StoryUserData[] = []; // O any[] = [];

  // --- Estats interns per controlar el visor ---
  showStoriesViewer: boolean = false;
  initialStoryIndexForViewer: number = 0;
  // ---------------------------------------------

  // --- Estats de càrrega i error ---
  isLoading: boolean = true; // Comença carregant
  errorMsg: string | null = null; // Per mostrar missatges d'error
  // ---------------------------------

  // Injecta el servei
  constructor(private storiesService: StoriesService) { }

  /**
   * Mètode del cicle de vida: s'executa quan el component s'inicialitza.
   * Aquí és on cridem al servei per carregar les dades.
   */
  ngOnInit(): void {
    this.loadStoriesForBar();
  }

  /**
   * Mètode per carregar les dades des del servei.
   */
  loadStoriesForBar(): void {
    this.isLoading = true; // Marca com a carregant
    this.errorMsg = null;  // Reseteja missatge d'error

    this.storiesService.getStoriesForBar().subscribe({
      next: (data) => {
        // Èxit: guarda les dades rebudes
        // Si no uses interfícies, aquí reps any[]
        this.storiesData = data;
        console.log('Stories carregades per a la barra:', this.storiesData);
        this.isLoading = false; // Deixa de carregar
      },
      error: (err) => {
        // Error: gestiona l'error
        console.error('Error al carregar les stories per a la barra:', err);
        // Utilitza el missatge d'error que vam preparar al servei
        this.errorMsg = err.message || 'No s\'han pogut carregar les històries.';
        this.isLoading = false; // Deixa de carregar
      }
    });
  }


  /**
   * Mètode cridat quan es fa clic a un element de la story en la barra.
   * Obre el component visor <app-stories> passant les dades necessàries.
   * @param userIndex L'índex de l'USUARI clicat a l'array 'storiesData'.
   */
  openStoriesViewerAtIndex(userIndex: number): void {
    // Comprova que l'índex sigui vàlid per a l'array d'usuaris
    if (!this.storiesData || userIndex < 0 || userIndex >= this.storiesData.length) {
      console.error("Índex d'usuari invàlid o dades no disponibles.");
      return;
    }
    console.log(`Obrint visor per a l'usuari a l'índex: ${userIndex}`);

    // L'índex que passem al visor és l'índex de l'usuari clicat
    this.initialStoryIndexForViewer = userIndex;

    // Les dades que passem al visor són TOTES les dades carregades
    // El visor s'encarregarà de mostrar l'usuari correcte basant-se en initialStoryIndexForViewer
    // this.dataForTheViewer = this.storiesData; // No cal variable extra si el visor accepta directament storiesData

    this.showStoriesViewer = true;

    // --- Lògica per marcar com a vist ---
    // Això és més complex ara. Hauries de marcar TOTES les stories
    // d'aquest usuari com a vistes? O només la primera?
    // Potser aquesta lògica hauria d'estar dins del VISOR quan es navega.
    // De moment, ho comentem o ho adaptem si cal marcar tot l'usuari.
    /*
    const userStoryData = this.storiesData[userIndex];
    if (userStoryData && userStoryData.stories) {
       userStoryData.stories.forEach(slide => slide.hasBeenSeen = true);
       // Potser necessites forçar la detecció de canvis si modifiques l'array internament
       // this.storiesData = [...this.storiesData];
    }
    */
    // --- Fi lògica marcar com a vist ---
  }

  /**
   * Mètode cridat quan el component <app-stories> emet l'event 'close'.
   * Oculta el visor.
   */
  closeStoriesViewer(): void {
    console.log('Tancant el visor des de StoriesBarComponent.');
    this.showStoriesViewer = false;
    // Opcional: Recarregar les dades per actualitzar estats 'hasBeenSeen' si el visor no ho fa
    // this.loadStoriesForBar();
  }

  /**
   * Funció auxiliar per obtenir la URL de la miniatura de l'usuari.
   * Agafa la URL de la PRIMERA story de l'array 'stories' de l'usuari.
   * @param userData L'objecte de dades de l'usuari (StoryUserData o any).
   * @returns La URL de la miniatura o un placeholder.
   */
  getThumbnailUrl(userData: StoryUserData | any): string {
    if (userData && userData.stories && userData.stories.length > 0 && userData.stories[0].imageUrl) {
      // Retorna la URL de la primera story de l'usuari
      return environment.assetsUrl+userData.stories[0].imageUrl;
    }
    // Fallback si no hi ha stories o la primera no té imatge
    return 'https://via.placeholder.com/60/CCCCCC/FFFFFF?text=?';
  }

    /**
   * Funció auxiliar per obtenir el nom d'usuari.
   * @param userData L'objecte de dades de l'usuari (StoryUserData o any).
   * @returns El nom d'usuari.
    */
   getUserName(userData: StoryUserData | any): string {
     return userData?.userName ?? 'Usuari';
   }


  /**
   * Gestiona els errors de càrrega de les imatges miniatura (es manté igual).
   */
  handleThumbnailError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    const thumbnailDiv = imgElement.closest('.story-thumbnail');
    if (thumbnailDiv) {
      thumbnailDiv.classList.add('error');
    }
    console.error('Error loading thumbnail:', imgElement.src);
  }

   /**
    * Funció trackBy per a l'NgFor, ara utilitza l'ID de l'usuari.
    * @param index L'índex de l'element a l'array `storiesData`.
    * @param userData L'objecte de dades de l'usuari (StoryUserData o any).
    * @returns L'ID de l'usuari o l'índex.
    */
   trackById(index: number, userData: StoryUserData | any): any {
     return userData?.userId ?? index; // Usa userId com a identificador únic
   }
}
