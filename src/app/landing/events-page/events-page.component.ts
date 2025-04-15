import { AuthService } from './../../core/services/auth/auth.service';
import { Component, inject, OnInit } from '@angular/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { EventParticipants } from '../../core/models/v2_drink-events.model';
import { DrinkEventsService } from '../../core/services/drink-events.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-events-page',
  imports: [InfiniteScrollDirective, DatePipe, NgIf, NgFor],
  templateUrl: './events-page.component.html',
  styleUrl: './events-page.component.css'
})
export class EventsPageComponent implements OnInit {

  InfiniteEvents: EventParticipants[] = []
  limit = 10;
  offset = 0;
  loading = false;
  allInsertsLoaded = false;

  currentUserId: number | null = null;
  actionLoading: { [key: string]: boolean } = {};

  eventsService = inject(DrinkEventsService);
  AuthService$ = inject(AuthService);

  ngOnInit(): void {
    this.currentUserId = this.AuthService$.getUser()?.id ?? null;
    this.loadevents();
  }

  loadevents(): void {
    if (this.loading || this.allInsertsLoaded) return;
    this.loading = true;

    this.eventsService.getEventsPaginated(this.limit, this.offset, this.currentUserId ?? 0).subscribe({
      next: (newevents: EventParticipants[]) => {
        if (newevents.length === 0) {
          this.allInsertsLoaded = true;
          console.log("Tots els events carregats.");
        } else {
          console.log(`Carregats ${newevents.length} nous inserts.`);
          this.InfiniteEvents = this.InfiniteEvents.concat(newevents);
          this.offset += newevents.length;
        }
        this.loading = false;

      },
      error: (error) => {
        console.error('Error carregant inserts:', error);
        this.loading = false;
      },
    })
  }

  enrollUser(event: any) {

  }
  unenrollUser(event: any) {

  }
}
