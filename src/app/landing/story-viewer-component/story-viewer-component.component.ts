import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Subscription, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-story-viewer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './story-viewer-component.component.html',
    styleUrls: ['./story-viewer-component.component.css']
})
export class StoryViewerComponent implements OnInit, OnDestroy {

    @Input() userId: number | undefined;
    @Input() imageUrls: string[] | undefined;
    @Input() imageUrl: string | undefined;
    stories: any[] = [];
    currentStoryIndex: number = 0;
    isLiked: boolean = false; // Per controlar si l'usuari ha votat la imatge
    loading: boolean = false;
    private timerSubscription: Subscription | undefined;
    storyDuration: number = 5; // Duració de cada story en segons

    constructor(private drinkingDataService: DrinkingDataService, private router: Router) { }

    ngOnInit(): void {
        this.loadStories();
        this.startTimer();
    }

    // Removed duplicate ngOnDestroy method

    loadStories() {
        this.loading = true;
        if (this.userId) {
            this.loadStoriesByUser();
        } else if (this.imageUrls) {
            this.stories = this.imageUrls.map(url => ({ image_url: environment.assetsUrl + url }));
            this.loading = false;
        } else if (this.imageUrl) {
            this.stories = [{ image_url: environment.assetsUrl + this.imageUrl }];
            this.loading = false;
        }
    }

    loadStoriesByUser() {
        this.drinkingDataService.getStoriesByUser(this.userId!).subscribe(
            (stories: any[]) => {
                this.stories = stories;
                this.loading = false;
            },
            (error: any) => {
                console.error('Error al carregar les stories:', error);
                this.loading = false;
            }
        );
    }

    nextStory() {
        this.currentStoryIndex = (this.currentStoryIndex + 1) % this.stories.length;
    }

    previousStory() {
        this.currentStoryIndex = (this.currentStoryIndex - 1 + this.stories.length) % this.stories.length;
    }

    toggleLike() {
        this.isLiked = !this.isLiked;
        // Aquí pots afegir la lògica per enviar la votació al backend
    }

    get currentStory() {
        return this.stories[this.currentStoryIndex];
    }

    startTimer() {
        this.timerSubscription = interval(this.storyDuration * 1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                if (this.stories.length > 1) {
                    this.nextStory();
                } else {
                    this.closeStory();
                }
            });
    }

    stopTimer() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    closeStory() {
        this.router.navigate(['/']); // Redirigeix a la pàgina principal o a on sigui apropiat
    }

    destroy$ = new Subject<void>();

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
