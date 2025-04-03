import { AuthService } from './../../core/services/auth/auth.service';
import { Component, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, HostListener, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core'; // Afegit inject
import { NgFor, NgIf, JsonPipe, CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment'; // Ajusta si és necessari
import { RelativeTimePipe } from '../../core/pipes/relative-time.pipe'; // El teu pipe personalitzat

// *** Importa els nous models ***
import { StoryUserData, StorySlide, StoryDrink } from './../../core/models/stories.model'; // Ajusta la ruta
// Importa el servei si vols implementar la votació real
import { StoriesService } from '../../core/services/stories/stories.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stories', // Mantens el selector del teu component
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    JsonPipe,
    CommonModule,
    DatePipe,
    RelativeTimePipe
  ],
  templateUrl: './StoriesViewer.html',
  styleUrls: ['./StoriesViewer.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush // Descomenta si vols optimitzar el rendiment
})
export class StoriesViewer implements OnChanges, OnDestroy {

  /**
   * Array de dades d'usuaris i les seves stories.
   * Ara utilitza la interfície StoryUserData per a tipatge fort.
   */
  @Input() stories: StoryUserData[] = [];

  @Input() initialUserIndex: number = 0;
  @Output() close = new EventEmitter<void>();
  // @Output() navigateToStory = new EventEmitter<number>(); // No sembla utilitzat

  currentUserIndex: number = 0;
  currentStoryIndex: number = 0; // Índex de la slide dins de l'usuari actual

  // --- Estats del Timer i Visor ---
  timerInterval: ReturnType<typeof setInterval> | null = null;
  timerDuration: number = 7; // Duració per defecte (en segons)
  timerRemaining: number = this.timerDuration;
  hasData: boolean = false;
  isPausedByUser: boolean = false;
  private pausedTimeRemaining: number | null = null;
  private readonly updateIntervalMs = 50; // Interval d'actualització del timer (50ms)
  private timerStartTime: number = 0;

  // Injecta ChangeDetectorRef per a possible ús amb OnPush
  // Injecta StoriesService si vols implementar la votació real
  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private storiesService: StoriesService // Injecta el servei
  ) { }

  // --- HostListener per a ESC (sense canvis) ---
  @HostListener('window:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.closeStories();
  }

  // --- Cicle de Vida: ngOnChanges ---
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stories'] && changes['stories'].currentValue) {
      this.stories = changes['stories'].currentValue as StoryUserData[] || []; // Tipus aplicat

      if (this.stories.length > 0) {
        this.hasData = true;

        // Troba el primer usuari amb stories vàlides
        let validInitialIndex = this.stories.findIndex(userData => userData.stories && userData.stories.length > 0);

        if (validInitialIndex === -1) {
          console.warn("Cap usuari amb stories vàlides trobat.");
          this.hasData = false;
          this.stopTimer();
          this.cdr.markForCheck(); // Actualitza vista si uses OnPush
          return;
        }

        // Comprova si l'índex inicial suggerit és vàlid
        const suggestedIndexIsValid = this.initialUserIndex >= 0 &&
          this.initialUserIndex < this.stories.length &&
          this.stories[this.initialUserIndex]?.stories?.length > 0;

        this.currentUserIndex = suggestedIndexIsValid ? this.initialUserIndex : validInitialIndex;
        this.currentStoryIndex = 0;
        this.isPausedByUser = false;
        this.pausedTimeRemaining = null;
        console.log(`Stories data rebuda. Començant a user index: ${this.currentUserIndex}, story index: ${this.currentStoryIndex}`);
        this.resetTimer();

      } else {
        console.log("L'array de stories rebut està buit.");
        this.hasData = false;
        this.isPausedByUser = false;
        this.pausedTimeRemaining = null;
        this.stopTimer();
      }
      this.cdr.markForCheck(); // Actualitza vista si uses OnPush
    }
  }

  // --- Cicle de Vida: ngOnDestroy (sense canvis) ---
  ngOnDestroy(): void {
    this.stopTimer();
  }

  // --- Funció Auxiliar URL (sense canvis) ---
  private buildFullImageUrl(relativePath: string | undefined | null): string {
    if (!relativePath) { return 'https://joc.feritja.cat/image.png'; }
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
      return relativePath;
    }
    const baseUrl = environment.assetsUrl.endsWith('/') ? environment.assetsUrl : environment.assetsUrl + '/';
    const imagePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return baseUrl + imagePath;
  }

  // --- Getters (Actualitzats per al nou model) ---

  /** Retorna dades bàsiques de l'usuari actual per a la capçalera */
  get currentUserHeaderData(): { userId: number, userName: string, profileImageUrl: string } | null {
    if (!this.hasData || this.currentUserIndex < 0 || this.currentUserIndex >= this.stories.length) return null;
    const userData = this.stories[this.currentUserIndex];
    if (!userData) return null;
    const profileImageUrl = this.buildFullImageUrl(userData.stories?.[0]?.imageUrl); // Imatge de la primera story com a perfil
    return {
      userId: userData.userId,
      userName: userData.userName,
      profileImageUrl: profileImageUrl
    };
  }

  /** Retorna la slide de story actual completa */
  get currentStorySlide(): StorySlide | null {
    if (!this.hasData) return null;
    const currentUserSlides = this.stories[this.currentUserIndex]?.stories;
    if (!currentUserSlides || this.currentStoryIndex < 0 || this.currentStoryIndex >= currentUserSlides.length) return null;
    const storySlide = currentUserSlides[this.currentStoryIndex];
    if (!storySlide) return null;
    return {
      ...storySlide,
      imageUrl: this.buildFullImageUrl(storySlide.imageUrl)
    };
  }

  /** Retorna l'array de slides per a l'usuari actual (per a les barres de progrés) */
  get currentUserSlidesForProgress(): StorySlide[] {
    return this.stories[this.currentUserIndex]?.stories || [];
  }

  // --- Mètodes del Timer ---
  startTimer(resumeFrom?: number): void {
    if (!this.hasData || this.isPausedByUser || !this.currentStorySlide) return; // No inicia si no hi ha story
    this.stopTimer();

    const initialRemaining = typeof resumeFrom === 'number' ? Math.max(0, resumeFrom) : this.timerDuration;
    this.timerRemaining = initialRemaining;

    if (initialRemaining <= 0) {
      // Si el temps és 0 o menys, passa a la següent immediatament (fora de l'interval)
      setTimeout(() => this.nextStory(), 0);
      return;
    }

    this.timerStartTime = Date.now();
    const totalDurationMs = initialRemaining * 1000;

    this.timerInterval = setInterval(() => {
      if (this.isPausedByUser) { // Comprova si s'ha pausat mentrestant
        this.stopTimer();
        return;
      }

      const elapsedTimeMs = Date.now() - this.timerStartTime;
      const remainingMs = Math.max(0, totalDurationMs - elapsedTimeMs);
      this.timerRemaining = remainingMs / 1000;
      this.cdr.markForCheck(); // Actualitza la barra de progrés (si uses OnPush)

      if (remainingMs <= 0) {
        this.nextStory(); // Canvia d'story quan s'acaba el temps
      }
    }, this.updateIntervalMs);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer(): void {
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;
    // Només inicia si hi ha dades i una story vàlida actual
    if (this.hasData && this.currentStorySlide) {
      this.startTimer();
    } else {
      console.log("No s'ha pogut reiniciar el timer: no hi ha story vàlida.");
    }
  }

  // --- Mètodes per Pausar/Reprendre ---
  pauseTimerOnPress(event: MouseEvent | TouchEvent | PointerEvent): void {
    // Comprova que el timer estigui actiu i no estigui ja pausat per l'usuari
    if (this.timerInterval && !this.isPausedByUser) {
      event.preventDefault(); // Evita altres accions (com selecció de text)
      this.pausedTimeRemaining = this.timerRemaining; // Guarda el temps restant
      this.isPausedByUser = true; // Marca com a pausat
      this.stopTimer(); // Atura l'interval
      console.log("Timer paused by user.");
    }
  }

  resumeTimerOnRelease(): void {
    // Només reprèn si estava pausat per l'usuari
    if (this.isPausedByUser) {
      this.isPausedByUser = false; // Desmarca com a pausat
      const timeToResume = this.pausedTimeRemaining; // Recupera el temps guardat
      this.pausedTimeRemaining = null; // Neteja el temps guardat

      console.log(`Timer resumed. Remaining: ${timeToResume}`);
      // Reinicia el timer, des del temps guardat si és vàlid, sinó des del principi
      if (typeof timeToResume === 'number' && timeToResume > 0) {
        this.startTimer(timeToResume);
      } else {
        // Si no hi havia temps guardat o era 0, simplement inicia
        this.startTimer();
      }
    }
  }

  // --- Mètodes de Navegació (Adaptats al model) ---
  nextStory(): void {
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;

    if (!this.hasData) return; // Comprovació inicial

    const currentUserSlides = this.stories[this.currentUserIndex]?.stories;
    if (!currentUserSlides) { // Si per alguna raó no hi ha slides per l'usuari actual
      this.nextUser(); // Intenta passar al següent usuari
      return;
    }

    // Comprova si hi ha més stories (slides) per a l'usuari actual
    if (this.currentStoryIndex < currentUserSlides.length - 1) {
      this.currentStoryIndex++;
      console.log(`Navigating to next story. User: ${this.currentUserIndex}, Story: ${this.currentStoryIndex}`);
      this.resetTimer(); // Reinicia el timer per la nova story
    } else {
      // Si era l'última story de l'usuari, passa al següent usuari
      console.log(`Last story for user ${this.currentUserIndex}. Navigating to next user.`);
      this.nextUser();
    }
    this.cdr.markForCheck(); // Si uses OnPush
  }

  prevStory(): void {
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;

    if (!this.hasData) return;

    // Comprova si no estem a la primera story de l'usuari actual
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      console.log(`Navigating to previous story. User: ${this.currentUserIndex}, Story: ${this.currentStoryIndex}`);
      this.resetTimer(); // Reinicia timer per la story anterior
    } else {
      // Si estem a la primera story, intentem anar a l'usuari anterior
      console.log(`First story for user ${this.currentUserIndex}. Navigating to previous user.`);
      this.prevUser(true); // true per anar a l'última story de l'usuari anterior
    }
    this.cdr.markForCheck(); // Si uses OnPush
  }

  nextUser(): void {
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;

    if (!this.hasData) return;

    // Busca el següent índex d'usuari que tingui stories
    let nextIndex = this.currentUserIndex + 1;
    while (nextIndex < this.stories.length && (!this.stories[nextIndex]?.stories || this.stories[nextIndex].stories.length === 0)) {
      nextIndex++;
    }

    // Si s'ha trobat un usuari vàlid
    if (nextIndex < this.stories.length) {
      this.currentUserIndex = nextIndex;
      this.currentStoryIndex = 0; // Comença per la primera story del nou usuari
      console.log(`Navigating to next user: ${this.currentUserIndex}`);
      this.resetTimer(); // Reinicia timer
    } else {
      // Si no hi ha més usuaris, tanca el visor
      console.log("End of all stories. Closing viewer.");
      this.closeStories();
    }
    this.cdr.markForCheck(); // Si uses OnPush
  }

  prevUser(goToLastStory: boolean = false): void {
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;

    if (!this.hasData) return;

    // Busca l'índex anterior d'usuari que tingui stories
    let prevIndex = this.currentUserIndex - 1;
    while (prevIndex >= 0 && (!this.stories[prevIndex]?.stories || this.stories[prevIndex].stories.length === 0)) {
      prevIndex--;
    }

    // Si s'ha trobat un usuari vàlid
    if (prevIndex >= 0) {
      this.currentUserIndex = prevIndex;
      // Determina a quina story anar (la primera o l'última)
      const prevUserStories = this.stories[this.currentUserIndex].stories; // Ja sabem que té stories
      this.currentStoryIndex = goToLastStory ? (prevUserStories.length - 1) : 0;
      console.log(`Navigating to previous user: ${this.currentUserIndex}. Story index: ${this.currentStoryIndex}`);
      this.resetTimer(); // Reinicia timer
    } else {
      // Si no hi ha usuaris anteriors amb stories
      console.log("Beginning of all users with stories.");
      // Podries decidir tancar aquí o simplement no fer res
    }
    this.cdr.markForCheck(); // Si uses OnPush
  }

  // --- Gestor de Swipes (sense canvis, crida els mètodes ja adaptats) ---
  handleSwipe(event: any): void {
    // Assegura't que tens la lògica per detectar 'swipeleft', 'swiperight', 'swipedown'
    // i que cridi a nextUser(), prevUser(), closeStories() respectivament.
    // Això normalment ve d'una llibreria externa (HammerJS) o implementació manual.
    console.log('Swipe Detected:', event.type, 'Direction:', event.direction);
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;

    switch (event.type) { // Ajusta segons com rebis l'event
      case 'swipeleft':
        this.nextUser();
        break;
      case 'swiperight':
        this.prevUser();
        break;
      case 'swipedown':
      case 'swipeup': // Opcionalment, swipe up també pot tancar
        this.closeStories();
        break;
    }
    this.cdr.markForCheck(); // Si uses OnPush
  }

  // --- Altres Mètodes ---

  /** Placeholder per votar (requereix crida a l'API) */
  voteUp(): void {
    const story = this.currentStorySlide;
    if (!story) return; // No fa res si no hi ha story actual

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
    // --- Implementació real amb API ---
    // 1. Obtenir l'ID de l'usuari que vota (hauria de venir d'un servei d'autenticació)
    const user = this.authService.getUser();
    const votingUserId = user?.id || 0; // **EXEMPLE**: Substituir per l'ID de l'usuari real

    console.log(`Votant per story ID: ${story.storyId} per usuari ${votingUserId}`);

    // Optimistic UI Update (opcional): Incrementa el comptador localment abans de la crida
    story.votes++; // Assumeix que story és una referència mutable dins de this.stories
    // Marcar que l'usuari ha votat (si tens aquesta propietat)
    // story.hasVoted = true;
    this.cdr.markForCheck(); // Actualitza la UI si uses OnPush


    // Crida al servei
    this.storiesService.voteStory(story.storyId, votingUserId).subscribe({
      next: (response) => {
        console.log('Vot enviat correctament:', response);
        // Opcional: Actualitzar el comptador amb la resposta del servidor si és diferent
        // if (response.newVoteCount !== undefined) {
        //    story.votes = response.newVoteCount;
        //    this.cdr.markForCheck();
        // }
      },
      error: (err) => {
        console.error('Error al votar la story:', err);
        // Revertir l'actualització optimista si falla
        story.votes--;
        // story.hasVoted = false;
        this.cdr.markForCheck();
        // Mostrar un missatge d'error a l'usuari?
      }
    });
    // --- Fi Implementació real amb API ---

    // Implementació simple (només incrementa localment)
    // if(this.currentStorySlide) {
    //    this.currentStorySlide.votes++; // Modifica directament (pot no funcionar amb OnPush sense markForCheck)
    //    console.log(`Votes (local): ${this.currentStorySlide.votes}`);
    //    this.cdr.markForCheck(); // Si uses OnPush
    // }
  }

  /** Tanca el visor */
  closeStories(): void {
    console.log("Closing stories component.");
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;
    this.close.emit(); // Emet l'event per al component pare
  }

  // --- Getter Progress (sense canvis a la lògica de càlcul) ---
  get progress(): number {
    if (!this.hasData || this.timerDuration <= 0) { return 0; }
    // Calcula el progrés basat en si està pausat o no
    if (this.isPausedByUser && typeof this.pausedTimeRemaining === 'number') {
      const elapsedPaused = this.timerDuration - Math.max(0, this.pausedTimeRemaining);
      return Math.min(100, (elapsedPaused / this.timerDuration) * 100);
    }
    const elapsed = this.timerDuration - Math.max(0, this.timerRemaining);
    const progressPercent = Math.min(100, (elapsed / this.timerDuration) * 100);
    return progressPercent;
  }
}
