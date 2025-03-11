import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaimaiDataService } from '../../core/services/maimai-data/maimai-data.service';
import { Pregunta } from '../../core/models/Pregunta';

@Component({
  selector: 'app-maimai-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maimai-page.component.html',
  styleUrls: ['./maimai-page.component.css']
})
export class MaimaiPageComponent implements OnInit {

  categories: string[] = [];
  selectedCategories: string[] = [];
  preguntas: Pregunta[] = [];
  preguntaActual: Pregunta | null = null;
  indicePreguntaActual: number = 0;
  totalpreguntes: number = 0;
  allCategoriesSelected: boolean = false;

  displayedQuestion: string = '';
  private typingInterval: any;
  private blinkInterval: any;
  showCursor: boolean = false; // No mostrem el cursor fins que hagi acabat d'escriure

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

  toggleAllCategories() {
    if (this.allCategoriesSelected) {
      this.selectedCategories = [];
    } else {
      this.selectedCategories = [...this.categories];
    }
    this.allCategoriesSelected = !this.allCategoriesSelected;
  }

  carregarPreguntes() {
    if (this.selectedCategories.length === 0) {
      alert('Selecciona al menys una categoria');
      return;
    }

    this.maimaiDataService.getPreguntas(this.selectedCategories).subscribe(
      data => {
        this.preguntas = data;
        this.shufflePreguntas();
        this.indicePreguntaActual = 0;
        this.mostrarPregunta();
        this.totalpreguntes = this.preguntas.length;
      },
      error => {
        console.error('Error al obtenir les preguntes:', error);
        this.preguntas = [];
        this.preguntaActual = null;
      }
    );
  }

  mostrarPregunta() {
    if (this.preguntas.length > 0 && this.indicePreguntaActual < this.preguntas.length) {
      this.preguntaActual = this.preguntas[this.indicePreguntaActual];
      this.displayedQuestion = '';
      this.showCursor = false; // Inicialment amaguem el cursor
      clearInterval(this.typingInterval);
      clearInterval(this.blinkInterval);
      this.typeWriterEffect(this.preguntaActual.question);
      this.cdRef.detectChanges();
      console.log("Pregunta actual:", this.preguntaActual);
    } else {
      this.preguntaActual = null;
    }
  }

  preguntaSeguent() {
    if (this.preguntas.length === 0) {
      return;
    }

    this.indicePreguntaActual++;

    if (this.indicePreguntaActual >= this.preguntas.length) {
      this.indicePreguntaActual = 0;
      alert('Has acabat totes les preguntes! Reiniciant...');
      this.shufflePreguntas();
    }

    this.mostrarPregunta();
  }

  shufflePreguntas() {
    // Algoritme Fisher-Yates per barrejar les preguntes
    for (let i = this.preguntas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.preguntas[i], this.preguntas[j]] = [this.preguntas[j], this.preguntas[i]];
    }
  }

  typeWriterEffect(text: string) {
    let i = 0;
    this.typingInterval = setInterval(() => {
      if (i < text.length) {
        this.displayedQuestion += text.charAt(i);
        i++;
        this.cdRef.detectChanges();
      } else {
        clearInterval(this.typingInterval);
        this.startBlinking(); // Comença a parpellejar quan acaba d'escriure
      }
    }, 15);
  }

  startBlinking() {
      this.showCursor = true;
      this.cdRef.detectChanges(); // Forçar la actualització de la vista
      this.blinkInterval = setInterval(() => {
          // No es necesario modificar showCursor, solo gestionamos la clase "blinking"
          const cursor = document.querySelector('.cursor');
          if (cursor) {
              cursor.classList.add('blinking');
          }
      }, 10);
  }
}
