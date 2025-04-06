import { AuthService } from './../../core/services/auth/auth.service';
// Imports necessaris per a HammerJS i ViewChild
import {
  Component, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges,
  HostListener, ChangeDetectorRef, ChangeDetectionStrategy, inject,
  ViewChild, ElementRef, AfterViewInit, NgZone // Afegits ViewChild, ElementRef, AfterViewInit, NgZone
} from '@angular/core';
import { NgFor, NgIf, JsonPipe, CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { RelativeTimePipe } from '../../core/pipes/relative-time.pipe';
import { StoryUserData, StorySlide, StoryDrink } from './../../core/models/stories.model';
import { StoriesService } from '../../core/services/stories/stories.service';
import { Router } from '@angular/router';

// Importa Hammer (principalment per a tipus i instanciació manual)
import Hammer from 'hammerjs';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [
    NgFor, NgIf, JsonPipe, CommonModule, DatePipe, RelativeTimePipe
  ],
  templateUrl: './StoriesViewer.html',
  styleUrls: ['./StoriesViewer.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush // Descomenta per optimitzar
})
export class StoriesViewer implements OnChanges, OnDestroy, AfterViewInit { // Afegeix AfterViewInit

  @Input() stories: StoryUserData[] = [];
  @Input() initialUserIndex: number = 0;
  @Output() close = new EventEmitter<void>();

  currentUserIndex: number = 0;
  currentStoryIndex: number = 0;

  timerInterval: ReturnType<typeof setInterval> | null = null;
  timerDuration: number = 7;
  timerRemaining: number = this.timerDuration;
  hasData: boolean = false;
  isPausedByUser: boolean = false;
  private pausedTimeRemaining: number | null = null;
  private readonly updateIntervalMs = 50;
  private timerStartTime: number = 0;

  // ViewChild per referenciar l'element que gestionarà els gestos
  @ViewChild('storyContent') storyContentRef!: ElementRef<HTMLDivElement>;
  private hammerManager: HammerManager | null = null; // Instància de Hammer

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private storiesService: StoriesService,
    private zone: NgZone // Injecta NgZone
  ) { }

  @HostListener('window:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.closeStories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // --- Lògica existent per gestionar canvis a 'stories' ---
    if (changes['stories'] && changes['stories'].currentValue) {
      this.stories = changes['stories'].currentValue as StoryUserData[] || [];

      if (this.stories.length > 0) {
        this.hasData = true;
        let validInitialIndex = this.stories.findIndex(userData => userData.stories && userData.stories.length > 0);
        if (validInitialIndex === -1) {
          console.warn("Cap usuari amb stories vàlides trobat.");
          this.hasData = false;
          this.stopTimer();
          this.cdr.markForCheck();
          return;
        }
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
      this.cdr.markForCheck();
       // Reconfigura Hammer si les dades canvien i la vista ja està inicialitzada
       if (this.storyContentRef?.nativeElement) {
           this.setupHammer();
       }
    }
  }

  ngAfterViewInit(): void {
    // Configura HammerJS quan l'element del DOM estigui llest
    this.setupHammer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
    // Neteja la instància de Hammer per evitar memory leaks
    if (this.hammerManager) {
      this.hammerManager.destroy();
      this.hammerManager = null;
      console.log("Hammer instance destroyed.");
    }
  }

  // --- Configuració de HammerJS ---
  private setupHammer(): void {
    if (!this.storyContentRef?.nativeElement) {
      console.error("StoriesViewer: No s'ha trobat #storyContent per configurar HammerJS.");
      return;
    }

    // Destrueix instància anterior si existeix
    if (this.hammerManager) {
      this.hammerManager.destroy();
    }

    console.log("Configurant HammerJS...");
    this.zone.runOutsideAngular(() => { // Executa fora de la zona Angular per rendiment
      this.hammerManager = new Hammer(this.storyContentRef.nativeElement);

      // Habilita Swipe en totes direccions
      this.hammerManager.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
      // Habilita Pan en totes direccions (per pausar)
      this.hammerManager.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 5 }); // Afegit threshold petit

      // --- Assigna Listeners ---
      this.hammerManager.on('swipeleft', (ev) => this.zone.run(() => this.handleHammerSwipe('left')));
      this.hammerManager.on('swiperight', (ev) => this.zone.run(() => this.handleHammerSwipe('right')));
      this.hammerManager.on('swipedown', (ev) => this.zone.run(() => this.handleHammerSwipe('down')));
      this.hammerManager.on('swipeup', (ev) => this.zone.run(() => this.handleHammerSwipe('up'))); // Opcional

      // Listeners per Pausar/Reprendre
      this.hammerManager.on('panstart', (ev) => this.pauseTimerOnPress(ev.srcEvent)); // No cal zone.run aquí
      this.hammerManager.on('panend pancancel', (ev) => this.resumeTimerOnRelease()); // No cal zone.run aquí
    });
  }

  // --- Gestor d'events de Hammer ---
  private handleHammerSwipe(direction: 'left' | 'right' | 'down' | 'up'): void {
    console.log(`Hammer swipe detected: ${direction}`);
    // Atura timer i estat de pausa sempre en un swipe
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;

    switch (direction) {
      case 'left':
        this.nextUser();
        break;
      case 'right':
        this.prevUser();
        break;
      case 'down':
      case 'up': // Si vols que swipe up també tanqui
        this.closeStories();
        break;
    }
    // No cal markForCheck aquí perquè zone.run ho gestiona
  }

  // --- Funció Auxiliar URL (sense canvis) ---
  private buildFullImageUrl(relativePath: string | undefined | null): string {
    if (!relativePath) { return 'https://joc.feritja.cat/image.png'; } // Imatge per defecte
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
      return relativePath;
    }
    const baseUrl = environment.assetsUrl.endsWith('/') ? environment.assetsUrl : environment.assetsUrl + '/';
    const imagePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return baseUrl + imagePath;
  }

  // --- Getters (sense canvis) ---
  get currentUserHeaderData(): { userId: number, userName: string, profileImageUrl: string } | null {
    if (!this.hasData || this.currentUserIndex < 0 || this.currentUserIndex >= this.stories.length) return null;
    const userData = this.stories[this.currentUserIndex];
    if (!userData) return null;
    const profileImageUrl = this.buildFullImageUrl(userData.stories?.[0]?.imageUrl);
    return {
      userId: userData.userId,
      userName: userData.userName,
      profileImageUrl: profileImageUrl
    };
  }

  get currentStorySlide(): StorySlide | null {
    if (!this.hasData) return null;
    const currentUserSlides = this.stories[this.currentUserIndex]?.stories;
    if (!currentUserSlides || this.currentStoryIndex < 0 || this.currentStoryIndex >= currentUserSlides.length) return null;
    const storySlide = currentUserSlides[this.currentStoryIndex];
    if (!storySlide) return null;
    return { ...storySlide, imageUrl: this.buildFullImageUrl(storySlide.imageUrl) };
  }

  get currentUserSlidesForProgress(): StorySlide[] {
    return this.stories[this.currentUserIndex]?.stories || [];
  }

  // --- Mètodes del Timer (sense canvis) ---
  startTimer(resumeFrom?: number): void {
    if (!this.hasData || this.isPausedByUser || !this.currentStorySlide) return;
    this.stopTimer();
    const initialRemaining = typeof resumeFrom === 'number' ? Math.max(0, resumeFrom) : this.timerDuration;
    this.timerRemaining = initialRemaining;
    if (initialRemaining <= 0) {
      setTimeout(() => this.nextStory(), 0);
      return;
    }
    this.timerStartTime = Date.now();
    const totalDurationMs = initialRemaining * 1000;
    this.timerInterval = setInterval(() => {
      if (this.isPausedByUser) { this.stopTimer(); return; }
      const elapsedTimeMs = Date.now() - this.timerStartTime;
      const remainingMs = Math.max(0, totalDurationMs - elapsedTimeMs);
      this.timerRemaining = remainingMs / 1000;
      this.cdr.markForCheck();
      if (remainingMs <= 0) { this.nextStory(); }
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
    if (this.hasData && this.currentStorySlide) {
      this.startTimer();
    } else {
      console.log("No s'ha pogut reiniciar el timer: no hi ha story vàlida.");
    }
  }

  // --- Mètodes Pausar/Reprendre (Ara cridats per Hammer) ---
  pauseTimerOnPress(event: any): void { // Event original de Hammer
    if (this.timerInterval && !this.isPausedByUser) {
      // No cal preventDefault aquí
      this.pausedTimeRemaining = this.timerRemaining;
      this.isPausedByUser = true;
      this.stopTimer();
      console.log("Timer paused by user (Hammer panstart).");
      this.cdr.markForCheck(); // Per actualitzar UI si mostra estat pausa
    }
  }

  resumeTimerOnRelease(): void {
    if (this.isPausedByUser) {
      this.isPausedByUser = false;
      const timeToResume = this.pausedTimeRemaining;
      this.pausedTimeRemaining = null;
      console.log(`Timer resumed (Hammer panend/pancancel). Remaining: ${timeToResume}`);
      if (typeof timeToResume === 'number' && timeToResume > 0) {
        this.startTimer(timeToResume);
      } else {
        this.startTimer();
      }
      this.cdr.markForCheck(); // Per actualitzar UI
    }
  }

  // --- Mètodes de Navegació (sense canvis a la lògica interna) ---
  nextStory(): void {
    this.stopTimer(); this.isPausedByUser = false; this.pausedTimeRemaining = null;
    if (!this.hasData) return;
    const currentUserSlides = this.stories[this.currentUserIndex]?.stories;
    if (!currentUserSlides) { this.nextUser(); return; }
    if (this.currentStoryIndex < currentUserSlides.length - 1) {
      this.currentStoryIndex++;
      this.resetTimer();
    } else {
      this.nextUser();
    }
    this.cdr.markForCheck();
  }

  prevStory(): void {
    this.stopTimer(); this.isPausedByUser = false; this.pausedTimeRemaining = null;
    if (!this.hasData) return;
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.resetTimer();
    } else {
      this.prevUser(true);
    }
    this.cdr.markForCheck();
  }

  nextUser(): void {
    this.stopTimer(); this.isPausedByUser = false; this.pausedTimeRemaining = null;
    if (!this.hasData) return;
    let nextIndex = this.currentUserIndex + 1;
    while (nextIndex < this.stories.length && (!this.stories[nextIndex]?.stories || this.stories[nextIndex].stories.length === 0)) {
      nextIndex++;
    }
    if (nextIndex < this.stories.length) {
      this.currentUserIndex = nextIndex;
      this.currentStoryIndex = 0;
      this.resetTimer();
    } else {
      this.closeStories();
    }
    this.cdr.markForCheck();
  }

  prevUser(goToLastStory: boolean = false): void {
    this.stopTimer(); this.isPausedByUser = false; this.pausedTimeRemaining = null;
    if (!this.hasData) return;
    let prevIndex = this.currentUserIndex - 1;
    while (prevIndex >= 0 && (!this.stories[prevIndex]?.stories || this.stories[prevIndex].stories.length === 0)) {
      prevIndex--;
    }
    if (prevIndex >= 0) {
      this.currentUserIndex = prevIndex;
      const prevUserStories = this.stories[this.currentUserIndex].stories;
      this.currentStoryIndex = goToLastStory ? (prevUserStories.length - 1) : 0;
      this.resetTimer();
    } else {
      console.log("Beginning of all users with stories.");
    }
    this.cdr.markForCheck();
  }

  // --- Mètode handleSwipe anterior (eliminat/no necessari) ---

  // --- Altres Mètodes (sense canvis) ---
  voteUp(): void {
    const story = this.currentStorySlide;
    if (!story) return;
    if (!this.authService.isLoggedIn()) { this.router.navigate(['/login']); return; } // Redirigeix si no està logat
    const user = this.authService.getUser();
    const votingUserId = user?.id;
    if (!votingUserId) { console.error("No s'ha pogut obtenir l'ID de l'usuari per votar."); return; }

    console.log(`Votant per story ID: ${story.storyId} per usuari ${votingUserId}`);
    story.votes++; // Optimistic update
    this.cdr.markForCheck();

    this.storiesService.voteStory(story.storyId, votingUserId).subscribe({
      next: (response) => console.log('Vot enviat correctament:', response),
      error: (err) => {
        console.error('Error al votar la story:', err);
        story.votes--; // Revertir
        this.cdr.markForCheck();
      }
    });
  }

  closeStories(): void {
    console.log("Closing stories component.");
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;
    this.close.emit();
  }

  // --- Getter Progress (sense canvis) ---
  get progress(): number {
    if (!this.hasData || this.timerDuration <= 0) return 0;
    if (this.isPausedByUser && typeof this.pausedTimeRemaining === 'number') {
      const elapsedPaused = this.timerDuration - Math.max(0, this.pausedTimeRemaining);
      return Math.min(100, (elapsedPaused / this.timerDuration) * 100);
    }
    const elapsed = this.timerDuration - Math.max(0, this.timerRemaining);
    return Math.min(100, (elapsed / this.timerDuration) * 100);
  }
}
