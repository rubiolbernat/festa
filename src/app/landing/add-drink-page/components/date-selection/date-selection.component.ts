import { DrinkEventsService } from './../../../../core/services/drink-events.service';
import { Component, inject, output, OnInit, signal } from '@angular/core';
import { DrinkEvent } from '../../../../core/models/v2_drink-events.model';
import { CommonModule } from '@angular/common';
import { EventIconPipe } from '../../../../core/pipes/event-icon.pipe';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

export interface DateSelectionOutput {
  selectedDate: Date | null;
  dayOfWeek: number | null;
  eventId: number | null;
}


@Component({
  selector: 'app-date-selection',
  imports: [CommonModule, EventIconPipe, FormsModule],
  templateUrl: './date-selection.component.html',
  styleUrl: './date-selection.component.css'
})
export class DateSelectionComponent implements OnInit {
  constructor(private route: ActivatedRoute) { }

  //TODO: si la data es menor a l'actual carregar tots els events haguts per a poder buscar

  private EventsService = inject(DrinkEventsService);

  public dateInfoChange = output<DateSelectionOutput>();

  eventFromUrl: number | null = null;
  selectedDate: Date = new Date();
  dayOfWeek: number | null = null;
  dateString: string | null = null;
  eventHasChanged: boolean = false;


  dateInput = signal<string>('');
  selectedEventId = signal<number | null>(null);
  eventsList = signal<DrinkEvent[]>([]);
  cacheEventsList = signal<DrinkEvent[]>([]);
  isLoading = signal<boolean>(false);

  //Local functions for html
  ngOnInit(): void {
    this.selectedEventId.set(null);
    //Comprovem si arriben parametres per la url
    this.route.queryParamMap.subscribe(params => {
      const eventId = params.get('eventId');
      if (eventId) {
        this.eventFromUrl = Number(eventId);
      }
    });
    this.dateInput.set(this.formatTodayAsDateString());
    this.dayOfWeek = this.getDayOfWeek(this.selectedDate);
    //console.log('date', this.selectedDate);
    //console.log('day of week', this.dayOfWeek);

    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading.set(true);
    this.loadActiveEvents();

    if (this.eventFromUrl) {
      this.selectedEventId.set(this.eventFromUrl);
    }
    this.sendDataToParent();
  }

  onDateChange() {
    if (this.isDateInPast(this.dateInput())) {
      // Si la data és inferior a la data actual carregar tots els events
      this.loadActiveEventsByDate(this.dateInput());
    } else {
      // Si la data és superior a la data actual carregar els events
      this.eventsList.set(this.cacheEventsList());
      this.findEventIdForDate(this.dateInput(), this.eventsList());
    }

    this.sendDataToParent();
  }


  findEventIdForDate(date: string, events: DrinkEvent[]) {
    if (!date || events.length === 0) {
      this.selectedEventId.set(null);
      return;
    }

    const targetDate = this.stripTime(new Date(date));
    const matchingEvents = events.filter(event => {
      const start = this.stripTime(new Date(event.data_inici));
      const end = this.stripTime(new Date(event.data_fi));
      return start <= targetDate && targetDate <= end;
    });

    //console.log('Esdeveniments coincidents amb la data', date, ':', matchingEvents);

    if (matchingEvents.length > 0) {
      matchingEvents.sort((a, b) => new Date(a.data_inici).getTime() - new Date(b.data_inici).getTime());
      const selectedEvent = matchingEvents[0];
      //console.log('Esdeveniment seleccionat:', selectedEvent.event_id);
      this.selectedEventId.set(selectedEvent.event_id);
    } else {
      console.log('Cap esdeveniment coincideix amb la data:', date);
      this.selectedEventId.set(null);
    }

    this.sendDataToParent();
  }

  stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }


  updateDrinkDataEventId() {
    this.sendDataToParent();
  }

  OnChanges(): void {
    if (this.isDateInPast(this.dateInput())) {
      //Si la data es inferior a la data actual carregar tots els events
      this.cacheEventsList.set(this.eventsList());
      this.loadActiveEventsByDate(this.dateInput());
    } else { // Si la data es superior a la data actual carregar els events
      this.loadActiveEvents();
    }
    this.sendDataToParent();
  }

  // Send data to parent
  sendDataToParent() {
    // Format date & dow to send to parent component
    this.selectedDate = new Date(this.dateInput());
    const dow = this.getDayOfWeek(this.selectedDate);
    this.dayOfWeek = dow;
    const eventIdSend = this.selectedEventId();

    //Send data to parent component
    this.dateInfoChange.emit(
      {
        selectedDate: this.selectedDate,
        dayOfWeek: this.dayOfWeek,
        eventId: eventIdSend
      }
    );
  }

  // Helper functions
  loadActiveEvents() {
    this.EventsService.getEventsByUserId().subscribe(
      {
        next: (events) => {
          this.eventsList.set(events || []);
          this.cacheEventsList.set(events || []);
          this.isLoading.set(false);
          this.findEventIdForDate(this.dateInput(), this.eventsList());
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.eventsList.set([]);
          this.cacheEventsList.set([]);
        },
      }
    )
  }

  loadActiveEventsByDate(date: string) {
    this.EventsService.getEventsByUserIdAndDate(date).subscribe({
      next: (events) => {
        //console.log('Esdeveniments carregats per data:', events); // DEBUG
        this.eventsList.set(events || []);
        this.isLoading.set(false);
        this.findEventIdForDate(this.dateInput(), this.eventsList());
      },
      error: (error) => {
        //console.error('Error loading events:', error);
        this.eventsList.set([]);
      },
    });

  }

  getDayOfWeek(date: Date): number {
    let day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    return day === 0 ? 7 : day; // Converteix a 1 (Monday) to 7 (Sunday)
  }

  formatTodayAsDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isDateInPast(dateString: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Posa l’hora d’avui a mitjanit

    const inputDate = new Date(dateString);
    inputDate.setHours(0, 0, 0, 0); // També mitjanit per evitar errors per hores

    return inputDate < today;
  }
}
