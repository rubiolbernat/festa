import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, AfterViewInit, Renderer2, ElementRef, ViewChildren, QueryList, HostListener, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HeatmapComponent } from './heatmap/heatmap.component';
import { WrappedService } from '../../core/services/wrapped/wrapped.service';
import { UserStatsResponse } from '../../core/services/wrapped/wrapped.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-wrapped-cards',
  imports: [CommonModule, HeatmapComponent, CommonModule],
  templateUrl: './wrapped-cards.component.html',
  styleUrl: './wrapped-cards.component.css'
})
export class WrappedCardsComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly Math = Math;

  private wrappedService = inject(WrappedService);
  wrappedData: UserStatsResponse | null = null;
  isLoading: boolean = true;

  currentStoryIndex: number = 0;
  totalStories: number = 0;
  timerInterval: any;
  timeLeft: number = 5; // 5 segundos por story
  storyDuration: number = 5; // Duración de cada historia en segundos
  timeLeftDisplay: number = 5;
  pauseStory = signal<boolean>(false);
  private destroy$ = new Subject<void>(); // Per desubscriure's automàticament
  stories: any[] = [];


  private updateFrequencyMs: number = 50;

  // Inventa les dades per veure com queda
  private buildStories(): void {
    const maxDayData = this.wrappedService.getMaxDayOfWeek();
    const maxDayName = this.wrappedService.getMaxDayName();

    // 🔹 Helper per limitar decimals
    const formatNum = (value: any): string => {
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toFixed(2);
    };

    this.stories = [
      {
        display: true,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        progressFillColor: '#0f3460',
        iconBg: '#0f3460',
        iconColor: '#ffde7d',
        icon: 'bi bi-cup-straw',
        title: 'El Teu Any de Festa',
        titleColor: '#ffde7d',
        statValueColor: '#ffde7d',
        subtitle: 'Nerviós per saber què veuràs?',
        footerSubtitle: 'Tindràs un problema amb el fetge?'
      },
      {
        display: !!this.wrappedData?.mostConsumedDrinks?.length, // només si hi ha dades
        background: 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)',
        progressFillColor: '#533483',
        iconBg: '#533483',
        iconColor: '#ffb6b6',
        icon: 'bi bi-flask',
        title: 'Litres Beguts',
        titleColor: '#ffb6b6',
        subtitle: 'Tens un fetge de ferro:',
        highlight: this.wrappedData?.generalStats?.total_litres + ' Litres',
        highlightColor: '#ffb6b6',
        statValueColor: '#ffb6b6',
        stats: this.wrappedData?.mostConsumedDrinks.map(d => ({
          label: d.drink,
          value: d.total_litres + 'L',
          detail: d.num_vegades_pres + " Unitats " + d.total_preu + "€"
        }))
      },
      {
        display: true,
        background: 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)',
        progressFillColor: '#533483',
        iconBg: '#533483',
        iconColor: '#ffb6b6',
        icon: 'bi bi-geo-alt',
        title: 'Heatmap',
        titleColor: '#ffb6b6',
        highlightColor: '#ffb6b6',
        statValueColor: '#ffb6b6',
        subtitle: 'T\'has mogut com una baldufa',
        component: HeatmapComponent
      },
      {
        display: true,
        background: 'linear-gradient(135deg, #533483 0%, #0f3460 100%)',
        progressFillColor: '#e94560',
        iconBg: '#e94560',
        iconColor: '#533483',
        icon: 'bi bi-currency-euro',
        title: 'Despesa Total',
        titleColor: '#533483',
        subtitle: 'El que has invertit en diversió',
        highlight: this.wrappedData?.generalStats?.total_preu ?? '',
        highlightColor: '#533483',
        statValueColor: '#533483',
        stats: [
          {
            label: 'Nit més cara',
            value: this.wrappedData?.topSpendingDay?.sum_preu ?? '' + '€',
            detail: 'Això va ser el: ' + this.wrappedData?.topSpendingDay?.date + ' i vas beure' + this.wrappedData?.topSpendingDay?.sum_quantitat + ' L'
          },
          {
            label: 'Lloc més car',
            value: this.wrappedData?.topLocationBySpending?.location ?? '' + '€',
            detail: 'Thas gastat: ' + this.wrappedData?.topLocationBySpending?.sum_preu + ' i vas beure' + this.wrappedData?.topLocationBySpending?.sum_quantitat + ' L'
          },
          {
            label: 'La beguda més cara (avg)',
            value: `${Number(this.wrappedData?.topDrinkByAveragePrice?.average_price ?? 0).toFixed(2)}€`,
            detail: `Ha estat: ${this.wrappedData?.topDrinkByAveragePrice?.drink ?? ''}`
          }
        ]
      },
      {
        display: true,
        background: 'linear-gradient(135deg, #e94560 0%, #533483 100%)',
        progressFillColor: '#ff7c7c',
        iconBg: '#ff7c7c',
        iconColor: '#0f3460',
        icon: 'bi bi-calendar-event',
        title: 'Dies de Sortida',
        titleColor: '#0f3460',
        subtitle: 'El teu dia preferit',
        highlight: maxDayName ?? '',
        highlightColor: '#0f3460',
        statValueColor: '#e94560',
        stats: [
          { label: 'Vegades que has sortit', value: maxDayData?.dies_sortits ?? '' },
          { label: 'Begudes preses', value: maxDayData?.begudes_preses ?? '' },
          { label: 'Total quantitat', value: formatNum(maxDayData?.total_quantitat) + 'L' },
          { label: 'Total preu', value: formatNum(maxDayData?.total_preu) + '€' },
          { label: 'Mitjana quantitat', value: formatNum(maxDayData?.mitjana_quantitat) + 'L' },
          { label: 'Mitjana preu', value: formatNum(maxDayData?.mitjana_preu) + '€' }
        ]
      },
      {
        display: (this.wrappedData?.userEvents?.length ?? 0) > 0,
        background: 'linear-gradient(135deg, #ff7c7c 0%, #e94560 100%)',
        progressFillColor: '#ffb6b6',
        iconBg: '#ffb6b6',
        iconColor: '#e94560',
        icon: 'bi bi-ticket-perforated',
        title: 'Events Especials',
        titleColor: '#e94560',
        subtitle: 'Celebracions inoblidables',
        highlight: this.wrappedData?.userEvents?.length ?? '0' + ' Events',
        highlightColor: '#e94560',
        statValueColor: '#e94560',
        stats: this.wrappedData?.userEvents.map(d => ({
          label: d.nom,
          value: d.user_stats.litres_consumits_event + 'L - ' + d.user_stats.preu_gastat_event + ' €',
        }))
      },
      {
        display: true,
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
          { label: 'N rànquing', value: this.wrappedData?.userDrinkerRank.rank ?? '' },
          { label: 'Begudes totals', value: this.wrappedData?.generalStats?.begudes_totals ?? '' },
          {
            label: 'Mitjana consumició', value: (this.wrappedData?.generalStats?.total_preu != null && this.wrappedData?.generalStats?.begudes_totals
              ? ((this.wrappedData.generalStats.total_preu / this.wrappedData.generalStats.begudes_totals).toFixed(2) + '€')
              : '1.2€')
          }
        ],
        footerSubtitle: 'Gràcies per aquest temps increïble!'
      }
    ];
    // Filtra les stories que no s'han de mostrar
    this.stories = this.stories.filter(story => story.display);
    // Actualitza el total de stories
    this.totalStories = this.stories.length;
  }

  @ViewChildren('story') storyElements!: QueryList<ElementRef>;
  @ViewChildren('progressBarFill') progressBarFills!: QueryList<ElementRef>;
  constructor(private renderer: Renderer2, private el: ElementRef, private router: Router) { }

  ngOnInit(): void {
    this.wrappedService.wrappedData$
      .pipe(takeUntil(this.destroy$)) // Evita memory leaks
      .subscribe(data => {
        this.wrappedData = data;
        this.isLoading = false;
        // Si no hi ha dades i no estem carregant, potser cal redirigir o mostrar un missatge
        if (!data && !this.isLoading) {
          // Opcional: Redirigir si no hi ha dades, o mostrar un missatge més informatiu
          console.warn('Wrapped data is null. The user might have accessed this page directly without selecting options.');
          // this.router.navigate(['/wrapped/select']);
        }
        if (data) {
          this.buildStories();
        }
        console.log('Wrapped data on init:', this.wrappedData);
      });

    // En cas que l'usuari arribi directament a aquesta ruta sense que les dades s'hagin carregat,
    // podem optar per mostrar un estat de càrrega o redirigir.
    // Si el BehaviorSubject ja té dades (perquè es van carregar prèviament), el subscribe ja les rebrà.
    // Si és null, es mantindrà null fins que es carreguin.
    if (!this.wrappedData && !this.isLoading) {
      // Si no hi ha dades i no estem en procés de càrrega (perquè ja hauríem d'haver rebut alguna cosa),
      // potser és un accés directe i hauríem de redirigir o mostrar un error.
      // this.router.navigate(['/wrapped/select']); // Descomenta si vols redirigir automàticament
    }

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
      if (this.pauseStory()) {
        return; // Si està pausat, no decrementa el temps ni fa res
      }
      // Decrementem el temps en funció de la freqüència d'actualització
      this.timeLeft -= (this.updateFrequencyMs / 1000);
      this.timeLeftDisplay = Math.max(0, this.timeLeft); // Assegura que no mostra valors negatius

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval); // Atura l'interval actual abans de passar a la següent història
        if (this.currentStoryIndex < this.totalStories - 1) {
          this.nextStory();
        } else {
          // this.router.navigate(['/la_gran_aventura-stats']);
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

  togglePause(): void {
    this.pauseStory.set(!this.pauseStory());
    console.log('Pause?', this.pauseStory());
  }

  changeStory(newIndex: number): void {
    if (newIndex >= 0 && newIndex < this.stories.length) {
      this.currentStoryIndex = newIndex;
      this.updateBackgroundElements();
      this.resetTimer();
    } else {
      this.router.navigate(['/la_gran_aventura-stats']);
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
