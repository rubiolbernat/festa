import { AuthService } from './../../core/services/auth/auth.service';
import { Component, inject, OnInit } from '@angular/core';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { EventParticipants, EventUser } from '../../core/models/v2_drink-events.model';
import { User } from '../../core/models/v2_user.model';
import { DrinkEventsService } from '../../core/services/drink-events.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { RelativeTimePipe } from '../../core/pipes/relative-time.pipe';

@Component({
  selector: 'app-events-page',
  imports: [InfiniteScrollDirective, DatePipe, NgIf, NgFor, RouterModule, RelativeTimePipe],
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

  enrollUser(event: EventParticipants): void {
    const eventId = event.event_id;
    console.log('Inscrivint a l’event amb ID:', eventId);

    const currentUser = this.AuthService$.getUser();
    if (!currentUser) {
      console.warn('Cap usuari loguejat!');
      return;
    }

    const newParticipant: EventUser = {
      user: {
        ...currentUser,
        user_id: currentUser.userId,
        email: (currentUser as any).email || '' // Ensure email is provided
      } as User,
      user_id: currentUser.userId,
      data_inscripcio: new Date().toISOString(),
    };

    this.eventsService.enrollInEvent(eventId, this.currentUserId).subscribe({
      next: (response) => {
        console.log('Resposta inscripció:', response);

        // Només actualitzem la llista si tot ha anat bé
        event.participants = event.participants || [];

        // Evitem duplicats
        const jaInscrit = event.participants.some(p => p.user_id === currentUser.userId);
        if (!jaInscrit) {
          event.participants.push(newParticipant);
        }

        event.enrrolled = true;
        event.total_participants = (event.total_participants ?? 0) + 1;
      },
      error: (error) => {
        console.error('Error en la inscripció a l’event:', error);
        // Aquí pots mostrar un missatge d’error a l’usuari
      }
    });
  }

  unenrollUser(event: EventParticipants): void {
    const eventId = event.event_id;
    console.log('Desinscrivint de l’event amb ID:', eventId);
    console.log('ID user:', this.currentUserId);

    this.eventsService.unenrollFromEvent(eventId, this.currentUserId).subscribe({
      next: (response) => {
        console.log('Resposta de desinscripció:', response);

        // Si tot ha anat bé, actualitzem la llista de participants
        if (event.participants) {
          event.participants = event.participants.filter(
            participant => participant.user_id !== this.currentUserId
          );
        }
        event.enrrolled = false;
        event.total_participants = (event.total_participants ?? 0) - 1;
      },
      error: (error) => {
        console.error('Error desinscrivint-se de l’esdeveniment:', error);
        // Aquí pots mostrar una notificació d'error a l'usuari si cal
      }
    });
  }
}
