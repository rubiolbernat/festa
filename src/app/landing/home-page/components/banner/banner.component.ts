import { StatsData } from './../../../../core/models/stats-data.model';
// Importa 'signal'
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DrinkingDataService } from '../../../../core/services/drinking-data/drinking-data.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
// Ja no necessitem ChangeDetectorRef
// import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone: true, // Assegura't que el component és standalone si uses aquesta sintaxi
  imports: [RouterModule, CommonModule], // Deixa RouterModule si el fas standalone
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent implements OnInit {

  // Declarem les propietats com a Signals
  // Usem el tipus StatsData | null per indicar que pot estar carregant o no tenir dades
  statsData = signal<any | null>(null);
  isLoggedIn = signal<boolean>(false);

  // Injectem els serveis, ja NO injectem ChangeDetectorRef
  constructor(
    private drinkingDataService: DrinkingDataService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Podem cridar loadStatsData o directament el contingut aquí
    this.loadStatsData();
  }

  loadStatsData(): void {
    // Actualitzem el signal isLoggedIn usant .set()
    this.isLoggedIn.set(this.authService.isLoggedIn());

    this.drinkingDataService.getStatsDataDates('2025-02-01', '2025-04-06')
      .subscribe({ // Forma moderna de subscribe amb objecte
        next: (data: StatsData) => { // Tipa les dades rebudes si és possible
          // Actualitzem el signal statsData usant .set()
          this.statsData.set(data);
          console.log('Dades estadístiques rebudes (Signal):', this.statsData()); // Accedim al valor amb ()
        },
        error: (err: any) => {
          console.error('Error en rebre dades estadístiques:', err);
          // Opcionalment: posar statsData a null o a un estat d'error
          this.statsData.set(null);
        }
        // No cal 'complete' si no fas res especial
      });
      // Ja NO necessitem this.cdr.detectChanges();
  }
}
