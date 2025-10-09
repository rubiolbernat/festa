import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert/alert.service';
import { ChartWeekComponent } from './chart-week/chart-week.component'; // Assegura't que la ruta és correcta
import { ChartMonthComponent } from './chart-month/chart-month.component'; // Assegura't que la ruta és correcta
import { Chart, registerables } from 'chart.js'; // No cal importar 'Chart' si no el fas servir directament aquí, només els registerables
import { WrappedButtonComponent } from '../../shared/components/wrapped-button/wrapped-button.component';

// No cal registrar Chart.js aquí si ja ho fan els components fills (ChartWeek/ChartMonth) internament
// Chart.register(...registerables); // Comenta o elimina si els fills ja ho fan

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CommonModule, ChartWeekComponent, ChartMonthComponent, WrappedButtonComponent], // Imports per al template
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.css']
})
export class StatsPageComponent implements OnInit, OnDestroy, AfterViewInit {
  statsData: any = null; // Tipa-ho millor si tens una interfície! Ex: StatsData | null = null;
  private statsSubscription: Subscription | null = null;
  private currentFullscreenElement: HTMLElement | null = null;

  // Referències als components fills per poder cridar els seus mètodes (resizeChart)
  @ViewChild('chartWeekComponent') chartWeekComponent!: ChartWeekComponent;
  @ViewChild('chartMonthComponent') chartMonthComponent!: ChartMonthComponent;

  // Referències als elements contenidors que aniran a pantalla completa
  @ViewChild('weeklyChartContainer') weeklyChartContainer!: ElementRef<HTMLElement>;
  @ViewChild('monthlyChartContainer') monthlyChartContainer!: ElementRef<HTMLElement>;

  constructor(
    private drinkingDataService: DrinkingDataService,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef // Injecta ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadStatsData();
    this.addFullscreenListeners();
  }

  ngAfterViewInit(): void {
    // Aquest mètode s'executa després que els ViewChild estiguin disponibles.
    // Podria ser útil si necessites interactuar amb els gràfics just després de carregar-los,
    // però per al toggleFullscreen i resize, els gestionem en els seus respectius events.
    console.log('StatsPageComponent AfterViewInit: ViewChilds disponibles.');
  }

  ngOnDestroy(): void {
    // Neteja la subscripció per evitar memory leaks
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
    }
    // Neteja els listeners de pantalla completa
    this.removeFullscreenListeners();

    // Si estem en pantalla completa quan el component es destrueix, intenta sortir
    if (this.currentFullscreenElement || document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.error("Error sortint de fullscreen a ngOnDestroy:", err));
      }
      // Afegeix aquí les versions amb prefix si cal per a navegadors antics
    }
  }

  private addFullscreenListeners(): void {
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange);
    document.addEventListener('mozfullscreenchange', this.onFullscreenChange);
    document.addEventListener('MSFullscreenChange', this.onFullscreenChange);
  }

  private removeFullscreenListeners(): void {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.onFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.onFullscreenChange);
  }

  loadStatsData(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.alertService.showAlert('No estàs autenticat', 'danger', 3000);
      this.router.navigate(['/login']);
      return;
    }

    // Cancel·la subscripció anterior si n'hi ha
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
    }

    this.statsSubscription = this.drinkingDataService.getStatsData().subscribe({
      next: (data: any) => { // Tipa millor les dades!
        this.statsData = data;
        console.log('Dades estadístiques rebudes:', this.statsData);
        this.cdRef.detectChanges(); // Notifica Angular que les dades han canviat
      },
      error: (error) => {
        console.error("Error en obtenir les dades d'estadístiques:", error);
        this.alertService.showAlert("Error en obtenir les dades d'estadístiques: " + (error.error?.message || error.message), 'danger', 5000);
        this.statsData = null; // Posa a null per amagar contingut i mostrar possible error
        this.cdRef.detectChanges(); // Notifica Angular
      }
    });
  }

  // Assumeix que dayOfWeek ve com a string '1' (Dilluns) a '7' (Diumenge)
  getDayName(dayOfWeek: string | number): string {
    const days = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];
    const index = typeof dayOfWeek === 'string' ? parseInt(dayOfWeek, 10) - 1 : dayOfWeek - 1; // Converteix a índex 0-6

    if (index >= 0 && index < days.length) {
      return days[index];
    }
    return 'Desconegut'; // Retorna un valor per defecte si l'índex no és vàlid
  }

  /**
   * Entra o surt del mode de pantalla completa per a l'element proporcionat.
   */
  toggleFullscreen(element: HTMLElement): void {
    const isDocumentFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement);

    if (!isDocumentFullscreen) {
      // --- Entra a pantalla completa ---
      this.currentFullscreenElement = element; // Guarda la referència de l'element que VOLEM posar fullscreen
      element.classList.add('chart-container-fullscreen'); // Afegeix classe abans d'entrar

      const requestPromise = element.requestFullscreen ? element.requestFullscreen() :
        (element as any).mozRequestFullScreen ? (element as any).mozRequestFullScreen() :
          (element as any).webkitRequestFullscreen ? (element as any).webkitRequestFullscreen() :
            (element as any).msRequestFullscreen ? (element as any).msRequestFullscreen() : null;

      if (requestPromise && typeof requestPromise.catch === 'function') {
        requestPromise?.catch((err: { message: string; name: string }) => {
          console.error(`Error en activar pantalla completa: ${err.message} (${err.name})`);
          // Neteja si hi ha error
          if (this.currentFullscreenElement === element) {
            element.classList.remove('chart-container-fullscreen');
            this.currentFullscreenElement = null;
            this.cdRef.detectChanges(); // Notifica el canvi
          }
        });
      } else if (!requestPromise) {
        console.warn('La API Fullscreen no sembla estar suportada en aquest navegador.');
        alert('El mode de pantalla completa no és compatible amb el teu navegador.');
        element.classList.remove('chart-container-fullscreen');
        this.currentFullscreenElement = null;
        this.cdRef.detectChanges(); // Notifica el canvi
      }
      // Nota: l'event 'fullscreenchange' s'encarregarà de cridar el resize si té èxit.

    } else if (document.fullscreenElement === element) {
      // --- Surt de pantalla completa (l'element actual ÉS el que està fullscreen) ---
      const exitPromise = document.exitFullscreen ? document.exitFullscreen() :
        (document as any).mozCancelFullScreen ? (document as any).mozCancelFullScreen() :
          (document as any).webkitExitFullscreen ? (document as any).webkitExitFullscreen() :
            (document as any).msExitFullscreen ? (document as any).msExitFullscreen() : null;

      if (exitPromise && typeof exitPromise.catch === 'function') {
        exitPromise.catch((err: { message: string; name: string }) => console.error(`Error en sortir de pantalla completa: ${err.message} (${err.name})`));
      } else if (!exitPromise) {
        console.warn('La API per sortir de Fullscreen no sembla estar suportada.');
      }
      // Nota: l'event 'fullscreenchange' s'encarregarà de treure la classe i cridar el resize.

    } else {
      // Un altre element està en pantalla completa, o estat inesperat.
      console.warn('Ja hi ha un element en pantalla completa o estat inesperat.');
      // Podries optar per sortir primer del fullscreen existent si vols forçar el canvi,
      // però pot ser confús per a l'usuari. Millor no fer res o mostrar avís.
      // alert('Si us plau, tanca primer la pantalla completa actual.');
    }
  }

  /**
   * Funció que s'executa quan canvia l'estat de pantalla completa (entrada/sortida/ESC).
   * S'utilitza una arrow function per mantenir el context 'this'.
   */
  onFullscreenChange = (): void => {
    const isCurrentlyFullscreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
    const actualFullscreenElement = document.fullscreenElement as HTMLElement | null;

    if (isCurrentlyFullscreen && actualFullscreenElement) {
      // Hem entrat a pantalla completa
      console.log('Entrat en pantalla completa (listener):', actualFullscreenElement);
      // Comprova si l'element que ha entrat és el que esperàvem
      if (this.currentFullscreenElement !== actualFullscreenElement) {
        console.warn("L'element en pantalla completa no és el que s'esperava.");
        // Podries intentar sincronitzar l'estat si cal
        this.currentFullscreenElement = actualFullscreenElement;
      }
      // Assegura't que la classe hi és (potser ja l'hem afegit a toggleFullscreen)
      if (this.currentFullscreenElement && !this.currentFullscreenElement.classList.contains('chart-container-fullscreen')) {
        this.currentFullscreenElement.classList.add('chart-container-fullscreen');
      }
      this.triggerChartResize(this.currentFullscreenElement); // Redibuixa el gràfic

    } else if (!isCurrentlyFullscreen && this.currentFullscreenElement) {
      // Hem sortit de pantalla completa i teníem un element marcat
      console.log('Sortit de pantalla completa (listener) de:', this.currentFullscreenElement);
      this.currentFullscreenElement.classList.remove('chart-container-fullscreen'); // Treu la classe
      const elementThatExited = this.currentFullscreenElement;
      this.currentFullscreenElement = null; // Neteja la referència
      this.triggerChartResize(elementThatExited); // Redibuixa el gràfic en la seva mida original
    } else {
      // Canvi d'estat però no sabem quin element estava implicat (potser un altre element de la pàgina)
      console.log('Canvi de fullscreen detectat, però sense element actiu conegut gestionat per aquest component.');
      // Podria ser necessari netejar l'estat per si de cas
      if (this.currentFullscreenElement) {
        this.currentFullscreenElement.classList.remove('chart-container-fullscreen');
        this.currentFullscreenElement = null;
      }
    }
    this.cdRef.detectChanges(); // Notifica a Angular els canvis (classe CSS, visibilitat botó)
  }

  /**
   * Dispara el redibuixat del gràfic corresponent a l'element donat.
   */
  private triggerChartResize(element: HTMLElement | null): void {
    if (!element) return;

    // Espera un petit instant perquè el DOM s'actualitzi completament
    setTimeout(() => {
      let resized = false;
      try {
        // Comprova quin contenidor és i truca al mètode del fill corresponent
        if (this.weeklyChartContainer && element === this.weeklyChartContainer.nativeElement && this.chartWeekComponent) {
          if (typeof this.chartWeekComponent.resizeChart === 'function') {
            console.log('Redibuixant gràfic setmanal...');
            this.chartWeekComponent.resizeChart();
            resized = true;
          } else {
            console.warn('ChartWeekComponent no té el mètode resizeChart().');
          }
        } else if (this.monthlyChartContainer && element === this.monthlyChartContainer.nativeElement && this.chartMonthComponent) {
          if (typeof this.chartMonthComponent.resizeChart === 'function') {
            console.log('Redibuixant gràfic mensual...');
            this.chartMonthComponent.resizeChart();
            resized = true;
          } else {
            console.warn('ChartMonthComponent no té el mètode resizeChart().');
          }
        }
      } catch (error) {
        console.error("Error cridant resizeChart() al component fill:", error);
      }

      // Workaround: Si no s'ha pogut redibuixar específicament, dispara 'resize' global
      if (!resized) {
        console.log("No s'ha pogut redibuixar el gràfic específicament, disparant window resize event...");
        window.dispatchEvent(new Event('resize'));
      }
    }, 150); // Un retard petit (ex: 150ms) sol ser suficient i més segur que 100ms
  }
}
