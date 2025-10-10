import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, AfterViewInit, Renderer2, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';
import { HeatmapComponent } from './heatmap/heatmap.component';

@Component({
  selector: 'app-wrapped-cards',
  imports: [CommonModule, HeatmapComponent],
  templateUrl: './wrapped-cards.component.html',
  styleUrl: './wrapped-cards.component.css'
})
export class WrappedCardsComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly Math = Math;

  currentStoryIndex: number = 0;
  totalStories: number = 0;
  timerInterval: any;
  timeLeft: number = 5; // 5 segundos por story
  storyDuration: number = 50; // Duración de cada historia en segundos
  timeLeftDisplay: number = 5;

  private updateFrequencyMs: number = 50;

  // Inventa les dades per veure com queda
  stories: any[] = [
    {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      progressFillColor: '#0f3460',
      iconBg: '#0f3460',
      iconColor: '#ffde7d',
      icon: 'bi bi-cup-straw',
      title: 'El Teu Any de Festa',
      titleColor: '#ffde7d',
      subtitle: 'Resum de les teves nits amb amics',
      statValueColor: '#ffde7d',
      stats: [
        { label: 'Nits totals', value: '78' },
        { label: 'Amics diferents', value: '24' },
        { label: 'Locals visitats', value: '15' }
      ]
    },
    {
      background: 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)',
      progressFillColor: '#533483',
      iconBg: '#533483',
      iconColor: '#ffb6b6',
      icon: 'bi bi-wine-bottle',
      title: 'Litres Beguts',
      titleColor: '#ffb6b6',
      subtitle: 'El que has consumit aquest any',
      highlight: '142 Litres',
      highlightColor: '#ffb6b6',
      statValueColor: '#ffb6b6',
      stats: [
        { label: 'Cerveses', value: '87L' },
        { label: 'Vi', value: '32L' },
        { label: 'Còctels', value: '23L' }
      ]
    },
    {
      background: 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)',
      progressFillColor: '#533483',
      iconBg: '#533483',
      iconColor: '#ffb6b6',
      icon: 'bi bi-geo-alt',
      title: 'Heatmap',
      titleColor: '#ffb6b6',
      highlightColor: '#ffb6b6',
      statValueColor: '#ffb6b6',
      component: HeatmapComponent

    },
    {
      background: 'linear-gradient(135deg, #533483 0%, #0f3460 100%)',
      progressFillColor: '#e94560',
      iconBg: '#e94560',
      iconColor: '#533483',
      icon: 'bi bi-currency-euro',
      title: 'Despesa Total',
      titleColor: '#533483',
      subtitle: 'El que has invertit en diversió',
      highlight: '1.847€',
      highlightColor: '#533483',
      statValueColor: '#533483',
      stats: [
        { label: 'Mitjana per nit', value: '23,68€' },
        { label: 'Nit més cara', value: '127€' },
        { label: 'Estalvis possibles', value: '~420€' }
      ]
    },
    {
      background: 'linear-gradient(135deg, #e94560 0%, #533483 100%)',
      progressFillColor: '#ff7c7c',
      iconBg: '#ff7c7c',
      iconColor: '#0f3460',
      icon: 'bi bi-calendar-event',
      title: 'Dies de Sortida',
      titleColor: '#0f3460',
      subtitle: 'Els teus moments preferits',
      highlight: 'Divendres',
      highlightColor: '#0f3460',
      statValueColor: '#0f3460',
      stats: [
        { label: 'Dies que més surts', value: 'Divendres (32)' },
        { label: 'Hora mitjana d\'inici', value: '21:47' },
        { label: 'Hora mitjana de tornada', value: '03:26' }
      ]
    },
    {
      background: 'linear-gradient(135deg, #ff7c7c 0%, #e94560 100%)',
      progressFillColor: '#ffb6b6',
      iconBg: '#ffb6b6',
      iconColor: '#e94560',
      icon: 'bi bi-ticket-perforated',
      title: 'Events Especials',
      titleColor: '#e94560',
      subtitle: 'Celebracions inoblidables',
      highlight: '15 Events',
      highlightColor: '#e94560',
      statValueColor: '#e94560',
      stats: [
        { label: 'Aniversaris', value: '6' },
        { label: 'Concerts', value: '4' },
        { label: 'Festes temàtiques', value: '5' }
      ]
    },
    {
      background: 'linear-gradient(135deg, #ffb6b6 0%, #ff7c7c 100%)',
      progressFillColor: '#ffde7d',
      iconBg: '#ffde7d',
      iconColor: '#1a1a2e',
      icon: 'bi bi-trophy',
      title: 'El Teu Any',
      titleColor: '#1a1a2e',
      subtitle: 'En xifres',
      statValueColor: '#1a1a2e',
      stats: [
        { label: 'Nits eivissenques', value: '7' },
        { label: 'Amics nous', value: '11' },
        { label: 'Fotos amb amics', value: '284' },
        { label: 'Històries divertides', value: 'Infinites' }
      ],
      footerSubtitle: 'Gràcies per un any increïble!'
    }
  ];

  @ViewChildren('story') storyElements!: QueryList<ElementRef>;
  @ViewChildren('progressBarFill') progressBarFills!: QueryList<ElementRef>;

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit(): void {
    this.totalStories = this.stories.length;
    this.startTimer();
    this.generateBackgroundElements();
    // this.loadStoriesFromService(); // Comentat: Descomentar per carregar dades reals
  }

  ngAfterViewInit(): void {
    // Es pot utilitzar si necessites accedir a elements del DOM que es creen amb *ngFor
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  // Comentat: Exemple de com carregar dades d'un servei
  // loadStoriesFromService() {
  //   this.storyService.getStories().subscribe(data => {
  //     this.stories = data;
  //     this.totalStories = this.stories.length;
  //     this.resetTimer();
  //   });
  // }

  generateBackgroundElements(): void {
    const backgroundContainer = this.el.nativeElement.querySelector('.background-elements');
    this.renderer.setProperty(backgroundContainer, 'innerHTML', ''); // Netejar elements existents

    // Colors per als elements de fons, basats en els colors de les stories
    const storyColors = this.stories.map(s => s.progressFillColor);

    for (let i = 0; i < 15; i++) {
      const element = this.renderer.createElement('div');
      this.renderer.addClass(element, 'element');

      // Asignar colors segons la story actual o una iteració
      const colorIndex = i % this.totalStories;
      this.renderer.setStyle(element, 'background', storyColors[this.currentStoryIndex]); // Usar el color de la story actual

      const size = Math.random() * 120 + 30;
      this.renderer.setStyle(element, 'width', `${size}px`);
      this.renderer.setStyle(element, 'height', `${size}px`);
      this.renderer.setStyle(element, 'top', `${Math.random() * 100}%`);
      this.renderer.setStyle(element, 'left', `${Math.random() * 100}%`);

      const duration = Math.random() * 30 + 15;
      this.renderer.setStyle(element, 'animationDuration', `${duration}s`);
      this.renderer.setStyle(element, 'animationDelay', `${Math.random() * 5}s`);

      this.renderer.appendChild(backgroundContainer, element);
    }
  }

  updateBackgroundElements(): void {
    this.generateBackgroundElements();
  }

  getProgressBarWidth(index: number): string {
    if (index < this.currentStoryIndex) {
      return '100%';
    } else if (index === this.currentStoryIndex) {
      // Càlcul basat en el temps transcorregut amb precisió decimal
      const elapsed = this.storyDuration - this.timeLeft;
      const percentage = (elapsed / this.storyDuration) * 100;
      return `${percentage}%`;
    }
    return '0%';
  }

  startTimer(): void {
    clearInterval(this.timerInterval);
    this.timeLeft = this.storyDuration; // Reinicia el temps amb la durada completa
    this.timeLeftDisplay = this.storyDuration; // Reinicia el display del temps

    this.timerInterval = setInterval(() => {
      // Decrementem el temps en funció de la freqüència d'actualització
      this.timeLeft -= (this.updateFrequencyMs / 1000);
      this.timeLeftDisplay = Math.max(0, this.timeLeft); // Assegura que no mostra valors negatius

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval); // Atura l'interval actual abans de passar a la següent història
        if (this.currentStoryIndex < this.totalStories - 1) {
          this.nextStory();
        } else {
          this.currentStoryIndex = 0; // Torna a la primera story
          this.resetTimer(); // Reinicia el temporitzador per a la primera història
        }
      }
    }, this.updateFrequencyMs); // L'interval s'executa cada `updateFrequencyMs` milisegons
  }

  resetTimer(): void {
    clearInterval(this.timerInterval);
    this.startTimer();
  }

  changeStory(newIndex: number): void {
    if (newIndex >= 0 && newIndex < this.totalStories) {
      this.currentStoryIndex = newIndex;
      this.updateBackgroundElements();
      this.resetTimer();
    }
  }

  previousStory(): void {
    this.changeStory(this.currentStoryIndex - 1);
  }

  nextStory(): void {
    this.changeStory(this.currentStoryIndex + 1);
  }

  async takeScreenshot(): Promise<void> {
    // Necessitaràs importar html2canvas al teu projecte Angular
    // npm install html2canvas
    // i després afegir `declare var html2canvas: any;` al teu `typings.d.ts` o directament aquí si no hi ha conflictes
    // o fer un import dinàmic `import('html2canvas').then(html2canvas => { ... });`

    const storyContainer = this.el.nativeElement.querySelector('.story-container');
    this.renderer.addClass(storyContainer, 'screenshot-mode');

    // Utilitzem un setTimeout per assegurar-nos que el CSS s'aplica abans de la captura
    setTimeout(async () => {
      // @ts-ignore
      if (typeof html2canvas !== 'undefined') {
        // @ts-ignore
        const canvas = await html2canvas(this.el.nativeElement.querySelector('.story.active'));
        const link = this.renderer.createElement('a');
        link.download = `la-meva-nit-${this.currentStoryIndex + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        console.warn('html2canvas no està carregat. No es pot fer la captura de pantalla.');
      }
      this.renderer.removeClass(storyContainer, 'screenshot-mode');
      this.startTimer();
    }, 100);
  }

  // Gestió de navegació amb el teclat
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.previousStory();
    } else if (event.key === 'ArrowRight') {
      this.nextStory();
    } else if (event.key === 'c' || event.key === 'C') {
      this.takeScreenshot();
    }
  }

  // Gestió de navegació amb swipe (per a mòbils)
  private touchStartX: number = 0;
  private touchEndX: number = 0;

  @HostListener('document:touchstart', ['$event'])
  handleTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  @HostListener('document:touchend', ['$event'])
  handleTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    if (this.touchEndX < this.touchStartX - 50) {
      this.nextStory(); // Swipe izquierda
    }
    if (this.touchEndX > this.touchStartX + 50) {
      this.previousStory(); // Swipe derecha
    }
  }
}
