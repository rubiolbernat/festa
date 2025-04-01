import { Component, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges, HostListener, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
// Eliminat RelativeTimePipe dels imports
import { NgFor, NgIf, JsonPipe, CommonModule, DatePipe } from '@angular/common'; // Afegit DatePipe
import { environment } from '../../../environments/environment';

// Si no fas servir HammerModule globalment, importa'l aquí si cal
// import { HammerModule } from '@angular/platform-browser';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    JsonPipe,
    CommonModule,
    DatePipe // *** AFEGIT DatePipe Natiu d'Angular ***
    // HammerModule // Afegeix si no és global
    // RelativeTimePipe // ELIMINAT
  ],
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush // Opcional
})
export class StoriesComponent implements OnChanges, OnDestroy {

  @Input() stories: any[] = [];
  @Input() initialUserIndex: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() navigateToStory = new EventEmitter<number>();

  currentUserIndex: number = 0;
  currentStoryIndex: number = 0;
  timerInterval: ReturnType<typeof setInterval> | null = null;
  timerDuration: number = 5;
  timerRemaining: number = this.timerDuration;
  hasData: boolean = false;

  private isPausedByUser: boolean = false;
  private pausedTimeRemaining: number | null = null;
  private readonly updateIntervalMs = 50;
  private timerStartTime: number = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  // --- HostListener per a ESC ---
  @HostListener('window:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    console.log('ESC pressed - Closing stories');
    this.closeStories();
  }

  // --- Cicle de Vida ---
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stories'] && changes['stories'].currentValue) {
      this.stories = changes['stories'].currentValue || [];

      if (this.stories.length > 0) {
        this.hasData = true;
        let validInitialIndex = -1;
        for(let i=0; i<this.stories.length; i++){
            if (this.stories[i]?.user?.stories?.length > 0){
                validInitialIndex = i;
                break;
            }
        }

        if(validInitialIndex === -1) {
            console.warn("No users with stories found.");
            this.hasData = false;
            this.stopTimer();
            // this.cdr.markForCheck(); // Si uses OnPush
            return;
        }

        const suggestedIndexIsValid = this.initialUserIndex >= 0 && this.initialUserIndex < this.stories.length && this.stories[this.initialUserIndex]?.user?.stories?.length > 0;
        this.currentUserIndex = suggestedIndexIsValid ? this.initialUserIndex : validInitialIndex;

        this.currentStoryIndex = 0;
        this.isPausedByUser = false;
        this.pausedTimeRemaining = null;
        console.log(`Stories data received. Starting at user index: ${this.currentUserIndex}, story index: ${this.currentStoryIndex}`);
        this.resetTimer();
      } else {
        console.log("Stories data is empty.");
        this.hasData = false;
        this.isPausedByUser = false;
        this.pausedTimeRemaining = null;
        this.stopTimer();
      }
      // this.cdr.markForCheck(); // Si uses OnPush
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // --- Funció Auxiliar URL (sense canvis) ---
  private buildFullImageUrl(relativePath: string | undefined | null): string {
    if (!relativePath) { return 'https://joc.feritja.cat/image.png'; }
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) { return relativePath; }
    const baseUrl = environment.assetsUrl.endsWith('/') ? environment.assetsUrl : environment.assetsUrl + '/';
    const imagePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return baseUrl + imagePath;
  }

  // --- Getters (sense canvis) ---
  get currentUser(): any {
    if (!this.hasData || this.currentUserIndex < 0 || this.currentUserIndex >= this.stories.length) { return {}; }
    const user = this.stories[this.currentUserIndex]?.user;
    if (!user) { return {}; }
    return { ...user, profileImage: this.buildFullImageUrl(user.profileImage) };
  }
  get currentStory(): any {
    const userStories = this.stories[this.currentUserIndex]?.user?.stories;
    if (!this.hasData || !userStories || this.currentStoryIndex < 0 || this.currentStoryIndex >= userStories.length) { return {}; }
    const story = userStories[this.currentStoryIndex];
    if (!story) { return {}; }
    // *** Assegura't que uploaded_at sigui un objecte Date o timestamp numèric si vols usar DatePipe ***
    // Si ve com string de MySQL (YYYY-MM-DD HH:MM:SS), necessites convertir-lo abans o al pipe
    const storyDate = story.uploaded_at ? new Date(story.uploaded_at.replace(' ', 'T') + 'Z') : null; // Intent de conversió a Date (UTC)

    return {
        ...story,
        imageUrl: this.buildFullImageUrl(story.image_url || story.imageUrl),
        // Podries afegir la data ja convertida aquí si prefereixes
        // uploadedDate: storyDate && !isNaN(storyDate.getTime()) ? storyDate : null
       };
  }

  // --- Mètodes del Timer (sense canvis a la lògica principal) ---
  startTimer(resumeFrom?: number): void {
    if (!this.hasData || this.isPausedByUser) return;
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
      if (this.isPausedByUser) {
        this.stopTimer();
        return;
      }

      const elapsedTimeMs = Date.now() - this.timerStartTime;
      const remainingMs = Math.max(0, totalDurationMs - elapsedTimeMs);
      this.timerRemaining = remainingMs / 1000;
      // this.cdr.markForCheck(); // Si uses OnPush

      if (remainingMs <= 0) {
        this.nextStory();
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
    if (this.hasData && this.stories[this.currentUserIndex]?.user?.stories?.length > 0) {
        this.startTimer();
    } else {
        console.log("Cannot start timer, no valid story found after reset.");
    }
  }

  // --- Mètodes per Pausar/Reprendre (sense canvis) ---
  pauseTimerOnPress(event: MouseEvent | TouchEvent | PointerEvent): void {
    if (this.timerInterval && !this.isPausedByUser) {
      event.preventDefault();
      this.pausedTimeRemaining = this.timerRemaining;
      this.isPausedByUser = true;
      this.stopTimer();
    }
  }

  resumeTimerOnRelease(): void {
    if (this.isPausedByUser) {
      this.isPausedByUser = false;
      const timeToResume = this.pausedTimeRemaining;
      this.pausedTimeRemaining = null;

      if (typeof timeToResume !== 'number' || timeToResume <= 0) {
        this.startTimer();
      } else {
        this.startTimer(timeToResume);
      }
    }
  }

  // --- Mètodes de Navegació (sense canvis a la lògica principal) ---
  nextStory(): void {
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;

    const currentUserStories = this.stories[this.currentUserIndex]?.user?.stories;
    if (!this.hasData || !currentUserStories) {
        this.closeStories();
        return;
    }

    if (this.currentStoryIndex < currentUserStories.length - 1) {
        this.currentStoryIndex++;


        this.resetTimer();
    } else {
        this.nextUser();
    }
}


  prevStory(): void {
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;

    if (!this.hasData) return;

    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.resetTimer();
    } else {
      this.prevUser(true);
    }
  }

  nextUser(): void {
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;

    if (!this.hasData) return;

    let nextIndex = this.currentUserIndex + 1;
    while (nextIndex < this.stories.length && (!this.stories[nextIndex]?.user?.stories || this.stories[nextIndex].user.stories.length === 0)) {
        nextIndex++;
    }

    if (nextIndex < this.stories.length) {
      this.currentUserIndex = nextIndex;
      this.currentStoryIndex = 0;
      this.resetTimer();
    } else {
      this.closeStories();
    }
  }

  prevUser(goToLastStory: boolean = false): void {
     this.stopTimer();
     this.isPausedByUser = false;
     this.pausedTimeRemaining = null;

    if (!this.hasData) return;

    let prevIndex = this.currentUserIndex - 1;
     while (prevIndex >= 0 && (!this.stories[prevIndex]?.user?.stories || this.stories[prevIndex].user.stories.length === 0)) {
         prevIndex--;
     }

    if (prevIndex >= 0) {
      this.currentUserIndex = prevIndex;
      const prevUserStories = this.stories[this.currentUserIndex]?.user?.stories;
      this.currentStoryIndex = goToLastStory ? (prevUserStories.length - 1) : 0;
      this.resetTimer();
    } else {
      console.log("Beginning of all users with stories.");
    }
  }

  // --- Gestor de Swipes (sense canvis) ---
  handleSwipe(event: any): void {
    console.log('Swipe Detected:', event.type, 'Direction:', event.direction);
    this.stopTimer();
    this.isPausedByUser = false;
    this.pausedTimeRemaining = null;

    switch (event.type) {
      case 'swipeleft':
        this.nextUser();
        break;
      case 'swiperight':
        this.prevUser();
        break;
      case 'swipedown':
        this.closeStories();
        break;
    }
    // this.cdr.markForCheck(); // Si uses OnPush
  }

  // --- Altres Mètodes (sense canvis) ---
  voteUp(): void {
     console.log(`Vot positiu per story ID: ${this.currentStory?.id || 'N/A'}`);
     if(this.currentStory) {
         this.currentStory.votes = (this.currentStory.votes || 0) + 1;
     }
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
    if (!this.hasData || this.timerDuration <= 0) { return 0; }
    if (this.isPausedByUser && typeof this.pausedTimeRemaining === 'number') {
        const elapsedPaused = this.timerDuration - Math.max(0, this.pausedTimeRemaining);
        return Math.min(100, (elapsedPaused / this.timerDuration) * 100);
    }
    const elapsed = this.timerDuration - Math.max(0, this.timerRemaining);
    const progressPercent = Math.min(100, (elapsed / this.timerDuration) * 100);
    return progressPercent;
  }

}
