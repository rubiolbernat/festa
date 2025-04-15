import { environment } from '../environments/environment';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertComponent } from './shared/components/alert/alert.component';
import { StoriesService } from './core/services/stories/stories.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AlertComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'festa';
  private deleteSub: Subscription | null = null;

  constructor(private storiesService: StoriesService) {}

  ngOnInit(): void {
    console.log(`Iniciant neteja de stories més antigues de ${environment.storyExpirationHours} hores.`);

    // Cridem al mètode passant les hores des d'environment
    this.deleteSub = this.storiesService.deleteExpiredStories(environment.storyExpirationHours)
      .subscribe({
        next: (response) => {
          // El log ja es fa dins del servei amb el tap, però pots afegir més lògica aquí si cal
          //console.log('Neteja automàtica completada des del component.');
        },
        error: (error) => {
          //console.error('Error en la neteja automàtica des del component:', error);
        }
    });
  }
}
