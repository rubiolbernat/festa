import { Component, ViewChild, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-week',
  templateUrl: './chart-week.component.html',
  styleUrls: ['./chart-week.component.css']
})
export class ChartWeekComponent implements AfterViewInit, OnChanges {
  @ViewChild('barChart') barChart: any;
  @Input() weeklyStats: any[] = [];
  chart!: Chart;

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['weeklyStats'] && this.chart) {
      this.updateChart();
    }
  }

  createChart() {
    const ctx = this.barChart.nativeElement.getContext('2d');

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: this.getChartData(),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            stacked: false
          },
          y: {
            stacked: false,
            beginAtZero: true
          }
        }
      }
    });
  }

  updateChart() {
    this.chart.data = this.getChartData();
    this.chart.update();
  }

  getChartData() {
    const labels = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'];
    const begudes_preses = new Array(7).fill(0);
    const total_quantitat = new Array(7).fill(0);
    const total_preu = new Array(7).fill(0);
    const dies_sortits = new Array(7).fill(0);
    const mitjana_preu = new Array(7).fill(0);
    const mitjana_quantitat = new Array(7).fill(0);

    this.weeklyStats.forEach(stat => {
      const index = stat.day_of_week - 1;
      begudes_preses[index] = stat.begudes_preses;
      dies_sortits[index] = stat.dies_sortits;
      total_quantitat[index] = parseFloat(stat.total_quantitat);
      total_preu[index] = parseFloat(stat.total_preu);
      mitjana_preu[index] = parseFloat(stat.mitjana_preu);
      mitjana_quantitat[index] = parseFloat(stat.mitjana_quantitat);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Begudes Preses',
          data: begudes_preses,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Total Quantitat (L)',
          data: total_quantitat,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Mitjana Preu (€)',
          data: mitjana_preu,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Mitjana Beguda (L)',
          data: mitjana_quantitat,
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }
      ]
    };
  }

  public resizeChart(): void {
    if (this.chart) {
      this.chart.resize(); // Mètode propi de Chart.js per ajustar-se al contenidor
    }
  }
}
