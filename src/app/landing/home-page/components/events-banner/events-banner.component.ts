import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DrinkEventsService } from '../../../../core/services/drink-events.service';
import { DrinkEvent, EventUser, EventParticipants } from '../../../../core/models/v2_drink-events.model';
import { catchError, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { BannerComponent } from './components/banner/banner.component';
import { RouterLinkActive, RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-events-banner',
  imports: [CommonModule, BannerComponent, RouterModule],
  templateUrl: './events-banner.component.html',
  styleUrl: './events-banner.component.css'
})
export class EventsBannerComponent {
  eventsService = inject(DrinkEventsService);
  userService = inject(AuthService);

  events: DrinkEvent[] = [];
  isloggedIn$: boolean = false;

  ngOnInit() {
    this.isloggedIn$ = this.userService.isLoggedIn();
    if (this.isloggedIn$) {
      const userId = this.userService.getUser()?.id ?? 0;
      this.eventsService.getEventsByUser(userId).subscribe((events: DrinkEvent[]) => {
        this.events = events;
        console.log('Events:', events);
      });
    } else {
      this.eventsService.getEvents().subscribe((events: DrinkEvent[]) => {
        this.events = events;
        console.log('Events:', events);
      });
    }
  }
}
