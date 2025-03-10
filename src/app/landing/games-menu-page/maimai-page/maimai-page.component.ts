import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- IMPORTA CommonModule
import { MaimaiDataService } from '../../../core/services/maimai-data/maimai-data.service';
import { Pregunta } from '../../../core/models/Pregunta';

@Component({
  selector: 'app-maimai-page',
  standalone: true,
  imports: [CommonModule], // <-- AFEGEIX CommonModule A Imports
  templateUrl: './maimai-page.component.html',
  styleUrls: ['./maimai-page.component.css']
})
export class MaimaiPageComponent implements OnInit {

  categories: string[] = [];
  selectedCategories: string[] = [];
  preguntas: Pregunta[] = []; // Array amb totes les preguntes
  preguntaActual: Pregunta | null = null; // La pregunta que es mostra actualment
  indicePreguntaActual: number = 0; // L'índex de la pregunta actual
  totalpreguntes: number = 0; // El total de preguntes

  constructor(private maimaiDataService: MaimaiDataService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories() {
    this.maimaiDataService.getCategories().subscribe(
      data => {
        this.categories = data;
      },
      error => {
        console.error('Error al obtenir categories:', error);
      }
    );
  }

  toggleCategory(category: string) {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    } else {
      this.selectedCategories.push(category);
    }
  }

  cargarPreguntas() {
    if (this.selectedCategories.length === 0) {
      alert('Selecciona al menys una categoria');
      return;
    }

    this.maimaiDataService.getPreguntas(this.selectedCategories).subscribe(
      data => {
        this.preguntas = data;
        this.shufflePreguntas(); // Baralla les preguntes quan es carreguen
        this.indicePreguntaActual = 0; // Reinicia l'índex
        this.mostrarPregunta(); // Mostra la primera pregunta
        this.totalpreguntes = this.preguntas.length; // Guarda el total de preguntes
      },
      error => {
        console.error('Error al obtenir les preguntes:', error);
        this.preguntas = []; // Limpia les preguntes en cas d'error
        this.preguntaActual = null;
      }
    );
  }

  mostrarPregunta() {
    if (this.preguntas.length > 0 && this.indicePreguntaActual < this.preguntas.length) {
      this.preguntaActual = this.preguntas[this.indicePreguntaActual];
      this.cdRef.detectChanges(); // <-- Força la detecció de canvis
      console.log("Pregunta actual:", this.preguntaActual);
    } else {
      this.preguntaActual = null;
    }
  }

  preguntaSeguent() {
    if (this.preguntas.length === 0) {
      return; // No hi ha preguntes
    }

    this.indicePreguntaActual++; // Incrementa l'índex

    if (this.indicePreguntaActual >= this.preguntas.length) {
      this.indicePreguntaActual = 0; // Torna al principi si arriba al final
      alert('Has acabat totes les preguntes! Reiniciant...');
      this.shufflePreguntas(); // Torna a barrejar les preguntes
    }

    this.mostrarPregunta(); // Mostra la següent pregunta
  }

  shufflePreguntas() {
    // Algoritme Fisher-Yates per barrejar les preguntes
    for (let i = this.preguntas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.preguntas[i], this.preguntas[j]] = [this.preguntas[j], this.preguntas[i]];
    }
  }
}
