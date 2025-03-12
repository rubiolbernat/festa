import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AlertService } from '../../core/services/alert/alert.service';
import { registerables } from 'chart.js';
import { Chart } from 'chart.js/auto';
import { ChartWeekComponent } from './chart-week/chart-week.component';
import { ChartMonthComponent } from './chart-month/chart-month.component';

Chart.register(...registerables);

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CommonModule, ChartWeekComponent, ChartMonthComponent],
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.css']
})

export class StatsPageComponent implements OnInit {
  statsData: any;

  constructor(
    private drinkingDataService: DrinkingDataService,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadStatsData();
  }

  loadStatsData(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.alertService.showAlert('No estàs autenticat', 'danger', 3000);
      this.router.navigate(['/login']);
      return;
    }

    this.drinkingDataService.getStatsData().subscribe(
      (data: any) => {
        this.statsData = data;
      },
      (error) => {
        console.error("Error en obtenir les dades d'estadístiques:", error);
        this.alertService.showAlert("Error en obtenir les dades d'estadístiques", 'danger', 3000);
      }
    );
  }

  getDayName(dayOfWeek: string): string {
    const days = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];
    return days[parseInt(dayOfWeek) - 1] || 'Desconegut';
  }
}

