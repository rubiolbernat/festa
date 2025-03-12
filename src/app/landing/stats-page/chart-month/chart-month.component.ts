import { Component, ViewChild, AfterViewInit, Input } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-month',
  templateUrl: './chart-month.component.html',
  styleUrls: ['./chart-month.component.css']
})
export class ChartMonthComponent implements AfterViewInit {
  @ViewChild('barChart') barChart: any;
  chart!: Chart;

  // Aquí tens la teva variable d'entrada per les dades
  @Input() monthlySummary: any[] = [];

  // Genera els mesos de l'any en format 'any-mes'
  private months = [
    '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
    '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12'
  ];

  // Noms dels mesos per mostrar
  private monthNames = [
    'Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny',
    'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'
  ];

  ngAfterViewInit() {
    this.createChart();
  }

  createChart() {
    const ctx = this.barChart.nativeElement.getContext('2d');

    // Mapa de les dades mensuals
    const labels = this.monthNames;  // Utilitzem els noms dels mesos per l'eix X
    const litresData = Array(12).fill(0);  // Inicialitzem totes les dades a 0
    const preuData = Array(12).fill(0);  // Inicialitzem totes les dades a 0

    // Omplim les dades reals segons les dates disponibles
    this.monthlySummary.forEach((data) => {
      const mesIndex = this.months.indexOf(data.mes);  // Trobar l'índex del mes en l'array
      if (mesIndex !== -1) {
        litresData[mesIndex] = parseFloat(data.litres);  // Assignem el valor dels litres
        preuData[mesIndex] = parseFloat(data.preu);  // Assignem el valor del preu
      }
    });

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,  // Etiquetes dels mesos
        datasets: [
          {
            label: 'Litres',
            data: litresData,  // Dades de litres
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Preu (€)',
            data: preuData,  // Dades de preu
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
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
}
