import { NgFor } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-stories',
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.css'],
  imports: [NgFor]
})
export class StoriesComponent implements OnInit, OnDestroy {

  @Input() singleStory: any = null; // Accepta una única història si es passa
  @Input() stories: any[] = []; // Array d'usuaris amb les seves històries
  @Input() initialUserIndex: number = 0; // Índex de l'usuari inicial a mostrar
  @Output() close = new EventEmitter<void>(); // Event per notificar que es tanca
  @Output() navigateToStory = new EventEmitter<number>(); // Event per tornar a la llista amb l'index.

  currentUserIndex: number = 0;
  currentStoryIndex: number = 0;
  timerInterval: any;
  timerDuration: number = 5; // Duració de cada història en segons
  timerRemaining: number = this.timerDuration;

  ngOnInit(): void {
    // Si es rep una història individual, la transformem en un array de stories amb un únic usuari
    if (this.singleStory) {
      this.stories = [{
        user: {
          name: this.singleStory.user_name || 'Usuari desconegut',
          profileImage: this.singleStory.profileImage || 'https://joc.feritja.cat/image.png '
        },
        stories: [{
          imageUrl: this.singleStory.image_url,
          votes: this.singleStory.votes || 0,
          votsPositius: this.singleStory.votsPositius || 0,
          votsNegatius: this.singleStory.votsNegatius || 0
        }]
      }];
      this.initialUserIndex = 0; // Ens assegurem que comenci des del primer (i únic) usuari
    }

    this.currentUserIndex = this.initialUserIndex;
    this.currentStoryIndex = 0;
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer(): void {
    this.stopTimer(); // Assegura que no hi ha un altre interval actiu
    this.timerRemaining = this.timerDuration;
    this.timerInterval = setInterval(() => {
      this.timerRemaining--;
      if (this.timerRemaining <= 0) {
        this.nextStory();
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  resetTimer(): void {
    this.stopTimer();
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
      this.navigateToStory.emit(0);
      this.closeStories();
    }
  }

  voteUp(): void {
    this.currentStory.votes++;
  }

  voteDown(): void {
    if (this.currentStory.votes > 0) {
      this.currentStory.votes--;
    }
  }

  closeStories(): void {
    this.stopTimer();
    this.close.emit(); // Notifica al component pare que s'ha tancat
  }

  get currentUser(): any {
    return this.stories[this.currentUserIndex]?.user || {};
  }

  get currentStory(): any {
    return this.currentUser?.stories?.[this.currentStoryIndex] || {};
  }

  get progress(): number {
    return ((this.timerDuration - this.timerRemaining) / this.timerDuration) * 100;
  }
}
