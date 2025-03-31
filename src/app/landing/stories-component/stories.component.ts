import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-stories',
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.css']
})
export class StoriesComponent implements OnInit, OnDestroy {

  @Input() stories: any[] = []; // Array d'usuaris amb les seves històries
  @Input() initialUserIndex: number = 0; // Índex de l'usuari inicial a mostrar
  @Output() close = new EventEmitter<void>(); // Event per notificar que es tanca
  @Output() navigateToStory = new EventEmitter<number>(); // Event per tornar a la llista amb l'index.

  storiesExample: any[] = [
    {
      user: [
        { image: 'https://example.com/image1.jpg', votes: 10 }
      ]
    },
    {
      user: [
        { image: 'https://example.com/image2.jpg', votes: 5 },
        { image: 'https://example.com/image3.jpg', votes: 8 }
      ]
    }
  ];


  currentUserIndex: number = 0;
  currentStoryIndex: number = 0;
  timerInterval: any;
  timerDuration: number = 5; // Duració de cada història en segons
  timerRemaining: number = this.timerDuration;

  ngOnInit(): void {
    this.currentUserIndex = this.initialUserIndex;
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timerRemaining--;
      if (this.timerRemaining <= 0) {
        this.nextStory();
      }
    }, 1000);
  }

  stopTimer(): void {
    clearInterval(this.timerInterval);
  }

  resetTimer(): void {
    this.stopTimer();
    this.timerRemaining = this.timerDuration;
    this.startTimer();
  }

  nextStory(): void {
    if (this.currentStoryIndex < this.currentUser.stories.length - 1) {
      this.currentStoryIndex++;
      this.resetTimer();
    } else {
      this.nextUser();
    }
  }

  prevStory(): void {
    if (this.currentStoryIndex > 0) {
      this.currentStoryIndex--;
      this.resetTimer();
    } else {
      this.prevUser();
    }
  }

  nextUser(): void {
    if (this.currentUserIndex < this.stories.length - 1) {
      this.currentUserIndex++;
      this.currentStoryIndex = 0;
      this.resetTimer();
    } else {
      this.closeStories(); // Tanquem si no hi ha més usuaris
    }
  }

  prevUser(): void {
    if (this.currentUserIndex > 0) {
      this.currentUserIndex--;
      this.currentStoryIndex = 0;
      this.resetTimer();
    } else {
      // torna a la pàgina principal amb l'índex 0;
      this.navigateToStory.emit(0);
      this.closeStories();
    }
  }

  voteUp(): void {
    // Implementa la lògica de votació positiva aquí

  }

  voteDown(): void {
    // Implementa la lògica de votació negativa aquí

  }

  closeStories(): void {
    this.stopTimer();
    this.close.emit(); // Notifica al component pare que s'ha tancat
  }

  get currentUser(): any {
    return this.stories[this.currentUserIndex];
  }

  get currentStory(): number {
    return this.currentUser.stories[this.currentStoryIndex];
  }

  get progress(): number {
    return (this.timerDuration - this.timerRemaining) / this.timerDuration * 100;
  }

}
