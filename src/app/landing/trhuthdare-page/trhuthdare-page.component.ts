import { Component, OnInit } from '@angular/core';
import { TruthDareModel } from '../../core/models/TruthDareModel.model';
import { TruthdareService } from '../../core/services/thuthdare/truthdare.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../core/services/alert/alert.service';

@Component({
  selector: 'app-trhuthdare-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './trhuthdare-page.component.html',
  styleUrl: './trhuthdare-page.component.css'
})
export class TrhuthdarePageComponent implements OnInit {

  categories: string[] = [];
  selectedCategories: string[] = [];
  allCategoriesSelected: boolean = false;
  dificultats: string[] = ['Fàcil', 'Mitjà', 'Difícil'];
  selectedDificultat: string = '';
  gameStarted: boolean = false;
  currentQuestion: TruthDareModel | null = null;
  addQuestionForm: FormGroup;
  showAddQuestionForm: boolean = false;
  formSubmitted: boolean = false;

  truthQuestions: TruthDareModel[] = [];
  dareQuestions: TruthDareModel[] = [];
  truthCount: number = 0;
  dareCount: number = 0;

  truthAnswered: number = 0;
  dareAnswered: number = 0;
  totalQuestionsAnswered: number = 0;
  initialTruthCount: number = 0; // Track initial truth question count
  initialDareCount: number = 0;   // Track initial dare question count

  constructor(private TruthdareService: TruthdareService, private fb: FormBuilder, private alertService: AlertService) {
    this.addQuestionForm = this.fb.group({
      text: ['', Validators.required],
      tipus: [true],
      dificultat: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.TruthdareService.getCategories().subscribe(
      (categories) => {
        this.categories = categories;
      },
      (error) => {
        console.error('Error loading categories:', error);
      }
    );
  }

  toggleCategory(category: string): void {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    } else {
      this.selectedCategories = [...this.selectedCategories, category];
    }
    this.updateAllCategoriesSelectedState();
  }

  toggleAllCategories(): void {
    if (this.allCategoriesSelected) {
      this.selectedCategories = [];
    } else {
      this.selectedCategories = [...this.categories];
    }
    this.updateAllCategoriesSelectedState();
  }

  updateAllCategoriesSelectedState(): void {
    this.allCategoriesSelected = this.selectedCategories.length === this.categories.length;
  }

  startGame(): void {
    if (this.selectedCategories.length > 0 && this.selectedDificultat) {
      this.gameStarted = true;
      this.loadQuestions();
      this.truthAnswered = 0;
      this.dareAnswered = 0;
      this.totalQuestionsAnswered = 0;
    } else {
      this.alertService.showAlert('Selecciona almenys una categoria i una dificultat abans de començar.', 'warning', 3000)
      //alert('Selecciona almenys una categoria i una dificultat abans de començar.');
    }
  }

  loadQuestions(): void {
    const dificultatNumber = this.dificultats.indexOf(this.selectedDificultat) + 1;

    this.TruthdareService.getTruth(this.selectedCategories, dificultatNumber).subscribe(
      (truthData) => {
        this.truthQuestions = truthData;
        this.truthCount = truthData.length;
        this.initialTruthCount = truthData.length; // Store initial count
        this.shuffleArray(this.truthQuestions);
        this.TruthdareService.getDare(this.selectedCategories, dificultatNumber).subscribe(
          (dareData) => {
            this.dareQuestions = dareData;
            this.dareCount = dareData.length;
            this.initialDareCount = dareData.length; // Store initial count
            this.shuffleArray(this.dareQuestions);
          },
          (error) => {
            console.error('Error loading dare questions:', error);
            alert('Error al carregar les preguntes de repte.');
          }
        );
      },
      (error) => {
        console.error('Error loading truth questions:', error);
        alert('Error al carregar les preguntes de veritat.');
      }
    );
  }

  getNextQuestion(type: boolean): void {
    let newQuestion: TruthDareModel | null = null; // Local variable to hold the next question

    if (type) {
      if (this.truthQuestions.length > 0) {
        newQuestion = this.truthQuestions.shift()!; // Get the next question
        this.truthCount = this.truthQuestions.length;
        this.truthAnswered++; // Increment if a new question is found
        newQuestion.tipus = true;
      } else {
        this.currentQuestion = null;
        this.alertService.showAlert('No hi ha més preguntes de veritat.', 'warning', 3000)
        //alert('No hi ha més preguntes de veritat.');
        return;
      }
    } else {
      if (this.dareQuestions.length > 0) {
        newQuestion = this.dareQuestions.shift()!; // Get the next question
        this.dareCount = this.dareQuestions.length;
        this.dareAnswered++; // Increment if a new question is found
        newQuestion.tipus = false;
      } else {
        this.currentQuestion = null;
        this.alertService.showAlert('No hi ha més preguntes de repte.', 'warning', 3000)
        //alert('No hi ha més preguntes de repte.');
        return;
      }
    }
    // Update the total count ONLY if a new question was loaded
    if (newQuestion) {
      this.totalQuestionsAnswered = this.truthAnswered + this.dareAnswered;
      this.currentQuestion = newQuestion; // Set current question AFTER incrementing
    } else {
      this.currentQuestion = null;
    }
  }
  getpassQuestion(type: boolean): void {
    let newQuestion: TruthDareModel | null = null; // Local variable to hold the next question

    if (type) {
      if (this.truthQuestions.length > 0) {
        newQuestion = this.truthQuestions.shift()!; // Get the next question
        newQuestion.tipus = true;
      } else {
        this.currentQuestion = null;
        alert('No hi ha més preguntes de veritat.');
        return;
      }
    } else {
      if (this.dareQuestions.length > 0) {
        newQuestion = this.dareQuestions.shift()!; // Get the next question
      } else {
        this.currentQuestion = null;
        alert('No hi ha més preguntes de repte.');
        return;
      }
    }
    // Update the total count ONLY if a new question was loaded
    if (newQuestion) {
      this.totalQuestionsAnswered = this.truthAnswered + this.dareAnswered;
      this.currentQuestion = newQuestion; // Set current question AFTER incrementing
    } else {
      this.currentQuestion = null;
    }
  }

  passQuestion(): void {
    if (!this.currentQuestion) {
      return; // Do nothing if there is no current question
    }

    const question = this.currentQuestion; // Store the question locally BEFORE setting to null
    this.currentQuestion = null; // Clear the current question *before* getting the next one

    if (question.tipus) {
      // Add it to the end of the truthQuestions array
      this.truthQuestions.push(question);
      this.shuffleArray(this.truthQuestions);
      this.truthCount++;
    } else {
      // Add it to the end of the dareQuestions array
      this.dareQuestions.push(question);
      this.shuffleArray(this.dareQuestions);
    }

    // Call getNextQuestion with the type of the passed question
    const nextQuestionType: boolean = question.tipus === true;
    this.getpassQuestion(nextQuestionType);
  }

  shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  toggleAddQuestionForm(): void {
    this.showAddQuestionForm = !this.showAddQuestionForm;
    this.addQuestionForm.reset();
    this.formSubmitted = false;
  }

  onSubmitAddQuestion(): void {
    this.formSubmitted = true;
    if (this.addQuestionForm.valid) {
      const formValues = this.addQuestionForm.value;
      const tipus = formValues.tipus ? 1 : 0;
      const dificultatNumber = this.dificultats.indexOf(formValues.dificultat) + 1;

      this.TruthdareService.addQuestion(
        formValues.text,
        formValues.category,
        tipus,
        dificultatNumber
      ).subscribe(
        (response) => {
          console.log('Question added:', response);
          this.alertService.showAlert('Pregunta afegida correctament!', 'success', 3000);
          //alert('Pregunta afegida correctament!');
          this.toggleAddQuestionForm();
          this.formSubmitted = false;
        },
        (error) => {
          console.error('Error adding question:', error);
          this.alertService.showAlert('Error adding question:', 'danger', 3000)
          //alert('Error al afegir la pregunta.');
          this.formSubmitted = false;
        }
      );
    }
  }

  get form() { return this.addQuestionForm.controls; }

  // Helper method to calculate the total questions
  get totalQuestions(): number {
    return this.initialTruthCount + this.initialDareCount;
  }
}
