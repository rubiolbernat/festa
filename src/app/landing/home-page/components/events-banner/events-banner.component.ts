import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DrinkEventsService } from '../../../../core/services/drink-events.service';
import { DrinkEvent, EventUser, EventParticipants } from '../../../../core/models/v2_drink-events.model';
import { catchError, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-events-banner',
  imports: [CommonModule],
  templateUrl: './events-banner.component.html',
  styleUrl: './events-banner.component.css'
})
export class EventsBannerComponent {
  eventsService = inject(DrinkEventsService);

  events: DrinkEvent[] = [];

  ngOnInit() {
    this.eventsService.getEvents().subscribe((events: DrinkEvent[]) => {
      this.events = events;
      console.log('Events:', events);
    });
  }
}
