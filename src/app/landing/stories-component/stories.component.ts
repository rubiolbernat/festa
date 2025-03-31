import { Component, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { NgFor, NgIf, JsonPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [NgFor, NgIf, JsonPipe],
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.css']
})
export class StoriesComponent implements OnChanges, OnDestroy {

  // ... (Inputs, Outputs, índexs, timerDuration, hasData - sense canvis) ...
  @Input() stories: any[] = [];
  @Input() initialUserIndex: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() navigateToStory = new EventEmitter<number>();

  currentUserIndex: number = 0;
  currentStoryIndex: number = 0;
  timerInterval: any = null; // Inicialitza a null
  timerDuration: number = 5; // EXEMPLE: Posat a 5s per provar
  timerRemaining: number = this.timerDuration;
  hasData: boolean = false;

  // ---- Noves propietats per la pausa ----
  private isPausedByUser: boolean = false; // Indica si la pausa és per pressió de l'usuari
  private pausedTimeRemaining: number | null = null; // Guarda el temps restant quan es pausa
  // Freqüència d'actualització visual (si s'usa l'opció d'interval ràpid)
  private readonly updateIntervalMs = 100;
  private timerStartTime: number = 0; // Hora d'inici de l'interval actual


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stories'] && changes['stories'].currentValue) {
      this.stories = changes['stories'].currentValue || [];
      if (this.stories.length > 0) {
        this.hasData = true;
        this.currentUserIndex = this.initialUserIndex < this.stories.length ? this.initialUserIndex : 0;
        this.currentStoryIndex = 0;
        this.isPausedByUser = false; // Assegura que no estigui pausat al canviar dades
        this.pausedTimeRemaining = null;
        this.resetTimer();
      } else {
        this.hasData = false;
        this.isPausedByUser = false;
        this.pausedTimeRemaining = null;
        this.stopTimer();
      }
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // --- Funció Auxiliar URL (sense canvis) ---
  private buildFullImageUrl(relativePath: string | undefined | null): string {
    // ... (codi igual) ...
    if (!relativePath) { return 'https://joc.feritja.cat/image.png'; }
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) { return relativePath; }
    const baseUrl = environment.assetsUrl.endsWith('/') ? environment.assetsUrl : environment.assetsUrl + '/';
    const imagePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return baseUrl + imagePath;
  }

  // --- Getters (sense canvis) ---
  get currentUser(): any {
    if (!this.hasData || this.currentUserIndex >= this.stories.length) { return {}; }
    const user = this.stories[this.currentUserIndex]?.user;
    if (!user) { return {}; }
    return { ...user, profileImage: this.buildFullImageUrl(user.profileImage) };
  }
  get currentStory(): any {
    const user = this.currentUser;
    if (!this.hasData || !user?.stories || this.currentStoryIndex >= user.stories.length) { return {}; }
    const story = user.stories[this.currentStoryIndex];
    if (!story) { return {}; }
    return { ...story, imageUrl: this.buildFullImageUrl(story.imageUrl) };
  }

  // --- Mètodes del Timer MODIFICATS ---

  startTimer(resumeFrom?: number): void {
    if (!this.hasData || this.isPausedByUser) return; // No comencis si no hi ha dades o està pausat per l'usuari

    this.stopTimer(); // Atura qualsevol timer anterior

    // Determina el temps restant inicial: si reprenem, usem el valor passat, sinó la duració total
    const initialRemaining = typeof resumeFrom === 'number' ? resumeFrom : this.timerDuration;
    this.timerRemaining = initialRemaining; // Estableix el valor visual inicial

    // Si el temps restant ja és zero o menys, no cal iniciar l'interval
    if (initialRemaining <= 0) {
        // Podríem avançar directament? Millor deixar que la lògica de nextStory ho gestioni si cal
        // console.log('Intentant iniciar timer amb temps restant 0 o menys.');
        // this.nextStory(); // Això podria causar bucles si no es gestiona bé
        return; // No iniciïs l'interval si ja s'ha acabat el temps
    }

    this.timerStartTime = Date.now();
    const totalDurationMs = initialRemaining * 1000; // La durada *d'aquest* interval

    // console.log(`Timer iniciat/représ. Durada interval: ${initialRemaining.toFixed(2)}s`);

    this.timerInterval = setInterval(() => {
      // Comprova si mentrestant s'ha pausat
      if (this.isPausedByUser) {
          this.stopTimer(); // Atura si l'usuari ha pausat
          return;
      }

      const elapsedTimeMs = Date.now() - this.timerStartTime;
      const remainingMs = Math.max(0, totalDurationMs - elapsedTimeMs);
      this.timerRemaining = remainingMs / 1000;

      if (remainingMs <= 0) {
        // console.log('Interval completat, cridant nextStory');
        // Important: Atura l'interval ABANS de cridar nextStory per evitar execucions múltiples
        // si nextStory triga una mica o hi ha canvis d'estat ràpids.
        // stopTimer(); // nextStory cridarà resetTimer, que inclou stopTimer. No cal aquí.
        this.nextStory();
      }
    }, this.updateIntervalMs);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      // console.log('Aturant interval del timer.');
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    // No resetejem isPausedByUser aquí, només ho fa resumeTimerOnRelease o resetTimer
  }

  resetTimer(): void {
    // console.log('Resetejant timer completament.');
    this.stopTimer();
    this.isPausedByUser = false; // Assegura que no estigui en estat de pausa d'usuari
    this.pausedTimeRemaining = null;
    this.startTimer(); // Comença des del principi (sense argument 'resumeFrom')
  }

  // --- Nous Mètodes per Pausar/Reprendre ---

  pauseTimerOnPress(event: MouseEvent | TouchEvent): void {
    // Només pausa si el timer està actiu i no està ja pausat per l'usuari
    if (this.timerInterval && !this.isPausedByUser) {
        // console.log('Pausant timer per pressió d\'usuari.');
        event.preventDefault(); // Evita comportaments per defecte (selecció, scroll tàctil)
        this.pausedTimeRemaining = this.timerRemaining; // Guarda el temps restant actual
        this.isPausedByUser = true;
        // Aturem l'interval *després* de guardar el temps i posar el flag
        this.stopTimer();
    }
  }

  resumeTimerOnRelease(): void {
    // Només reprèn si estava pausat per l'usuari
    if (this.isPausedByUser) {
        // console.log(`Reprenent timer des de ${this.pausedTimeRemaining?.toFixed(2)}s`);
        this.isPausedByUser = false;
        const timeToResume = this.pausedTimeRemaining;
        this.pausedTimeRemaining = null; // Neteja el temps guardat

        // Si per alguna raó no teníem temps guardat, o era 0, reinicia completament
        if (typeof timeToResume !== 'number' || timeToResume <= 0) {
            console.warn('Intent de reprendre sense temps restant vàlid, reiniciant.');
            this.resetTimer(); // O potser nextStory()? Depèn del comportament desitjat.
        } else {
            this.startTimer(timeToResume); // Reprèn des del temps guardat
        }
    }
  }

  // --- Mètodes de Navegació (ara només criden resetTimer) ---
  nextStory(): void {
    const user = this.currentUser;
    if (!this.hasData || !user?.stories) return;
    if (this.currentStoryIndex < user.stories.length - 1) {
      this.currentStoryIndex++;
      this.resetTimer(); // Correcte
    } else {
      this.nextUser();
    }
  }

  prevStory(): void {
     if (!this.hasData) return;
     const user = this.currentUser;
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.resetTimer(); // Correcte
    } else {
      this.prevUser();
    }
  }

  nextUser(): void {
     if (!this.hasData) return;
    if (this.currentUserIndex < this.stories.length - 1) {
      this.currentUserIndex++;
      this.currentStoryIndex = 0;
      this.resetTimer(); // Correcte
    } else {
      this.closeStories();
    }
  }

  prevUser(): void {
    if (!this.hasData) return;
    if (this.currentUserIndex > 0) {
      this.currentUserIndex--;
      this.currentStoryIndex = 0;
      this.resetTimer(); // Correcte
    } else {
      this.navigateToStory.emit(0);
      this.closeStories();
    }
  }

  // --- Altres Mètodes ---
  voteUp(): void { /* ... (sense canvis) ... */ }
  voteDown(): void { /* ... (sense canvis) ... */ }

  closeStories(): void {
    this.stopTimer(); // Atura el timer
    this.isPausedByUser = false; // Assegura que es neteja l'estat de pausa
    this.pausedTimeRemaining = null;
    this.close.emit();
  }

  // Getter progress (sense canvis, depèn de timerRemaining)
  get progress(): number {
    if (!this.hasData || this.timerDuration <= 0) { return 0; }
    const elapsed = this.timerDuration - Math.max(0, this.timerRemaining);
    const progressPercent = Math.min(100, (elapsed / this.timerDuration) * 100);
    return progressPercent;
  }
}
