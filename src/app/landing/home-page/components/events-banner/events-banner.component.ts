import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DrinkEventsService } from '../../../../core/services/drink-events.service';
import { DrinkEvent, EventUser, EventParticipants } from '../../../../core/models/v2_drink-events.model';
import { catchError, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { BannerComponent } from './components/banner/banner.component';
import { RouterLinkActive, RouterModule, Router, RouterLink } from '@angular/router';
import { BreakingBannerComponent } from './components/breaking-banner/breaking-banner.component';

@Component({
  selector: 'app-events-banner',
  imports: [CommonModule, BannerComponent, BreakingBannerComponent, RouterLink],
  templateUrl: './events-banner.component.html',
  styleUrl: './events-banner.component.css'
})
export class EventsBannerComponent {
  eventsService = inject(DrinkEventsService);
  userService = inject(AuthService);

  userEvents: DrinkEvent[] = [];
  activeEvents: DrinkEvent[] = [];
  isloggedIn$: boolean = false;
  noActiveEvents: boolean = false;
  breakingEventsBanner: boolean = false;

  ngOnInit() {
    this.isloggedIn$ = this.userService.isLoggedIn();

    if (this.isloggedIn$) {
      const userId = this.userService.getUser()?.id ?? 0;
      this.eventsService.getEventsByUser(userId).subscribe((events: DrinkEvent[]) => {
        this.userEvents = events;
        console.log('User events:', events);

        if (this.userEvents.length === 0) {
          // No hi ha esdeveniments per aquest usuari → carregar breaking events
          this.loadBreakingEvents();
        } else {
          this.noActiveEvents = true;
        }
      }, error => {
        console.error('Error carregant esdeveniments de l\'usuari:', error);
        this.loadBreakingEvents();
      });
    } else {
      // No està loggejat → carregar breaking events directament
      this.loadBreakingEvents();
    }
  }

  loadBreakingEvents() {
    this.breakingEventsBanner = true;
    this.eventsService.getEvents().subscribe((events: DrinkEvent[]) => {
      this.activeEvents = events;
      console.log('Breaking events:', events);
    }, error => {
      console.error('Error carregant breaking events:', error);
    });
  }

}
