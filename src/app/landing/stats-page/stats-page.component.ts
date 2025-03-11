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

Chart.register(...registerables);

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.css']
})
export class StatsPageComponent implements OnInit, OnDestroy, AfterViewInit {
  statsData: any;
  private subscription: Subscription | undefined;

  @ViewChild('weeklyStatsChart') weeklyStatsChart!: ElementRef;
  @ViewChild('monthlySummaryChart') monthlySummaryChart!: ElementRef;
  @ViewChild('monthlySpendingChart') monthlySpendingChart!: ElementRef;

  constructor(
    private drinkingDataService: DrinkingDataService,
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.loadStatsData();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    if (this.statsData) {
      this.createCharts();
    }
  }

  loadStatsData(): void {
    const user = this.authService.getUser();
    if (!user) {
      this.alertService.showAlert('No estas autenticat', 'danger', 3000);
      this.router.navigate(['/login']);
      return;
    }

    this.subscription = this.drinkingDataService.getStatsData().subscribe(
      (data: any) => {
        this.statsData = data;
        // Espera un cicle de canvi de detecció abans de crear els gràfics
        setTimeout(() => this.createCharts(), 0);
      },
      (error) => {
        console.error('Error en obtenir les dades d\'estadístiques:', error);
        this.alertService.showAlert('Error en obtenir les dades d\'estadístiques', 'danger', 3000);
      }
    );
  }


  createCharts(): void {
    if (this.statsData.weeklyStats && this.statsData.weeklyStats.length > 0) {
      this.createWeeklyStatsChart();
    }
    if (this.statsData.monthlySummary && this.statsData.monthlySummary.length > 0) {
      this.createMonthlySummaryChart();
    }
    if (this.statsData.monthlySpending && this.statsData.monthlySpending.length > 0) {
      this.createMonthlySpendingChart();
    }
  }

  createWeeklyStatsChart(): void {
    const ctx = this.weeklyStatsChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.statsData.weeklyStats.map((row: any) => this.getDayName(row.day_of_week)),
        datasets: [{
          label: 'Mitjana de Beguda per Dia',
          data: this.statsData.weeklyStats.map((row: any) => row.mitjana_quantitat),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutBounce'
        }
      }
    });
  }

  createMonthlySummaryChart(): void {
    const ctx = this.monthlySummaryChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.statsData.monthlySummary.map((row: any) => row.mes),
        datasets: [{
          label: 'Litres Consumits per Mes',
          data: this.statsData.monthlySummary.map((row: any) => row.litres),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          fill: true
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutCubic'
        }
      }
    });
  }

  createMonthlySpendingChart(): void {
    const ctx = this.monthlySpendingChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.statsData.monthlySpending.map((row: any) => row.mes),
        datasets: [{
          label: 'Despesa per Mes',
          data: this.statsData.monthlySpending.map((row: any) => row.despesa),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: 1500,
          easing: 'easeOutQuint'
        }
      }
    });
  }

  getDayName(dayOfWeek: string): string {
    const days = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];
    return days[parseInt(dayOfWeek) - 1] || 'Desconegut';
  }
}
