import { DrinkEventsService } from './../../../../core/services/drink-events.service';
import { Component, inject, output, OnInit, signal } from '@angular/core';
import { DrinkEvent } from '../../../../core/models/v2_drink-events.model';
import { CommonModule } from '@angular/common';
import { EventIconPipe } from '../../../../core/pipes/event-icon.pipe';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators'; // Importa take

export interface DateSelectionOutput {
  selectedDate: Date | null;
  dayOfWeek: number | null;
  eventId: number | null;
}

@Component({
  selector: 'app-date-selection',
  standalone: true, // És recomanable fer-lo standalone
  imports: [CommonModule, EventIconPipe, FormsModule], // Assegura't que FormsModule hi és
  templateUrl: './date-selection.component.html',
  styleUrls: ['./date-selection.component.css'] // Corregit a styleUrls
})
export class DateSelectionComponent implements OnInit {

  // --- Injeccions i Output ---
  private route = inject(ActivatedRoute);
  private eventsService = inject(DrinkEventsService);
  public dateInfoChange = output<DateSelectionOutput>();

  // --- Variables de Classe (Menys Signals, més a prop de l'original) ---
  // Variables per a l'estat que no necessiten reactivitat fina dins la plantilla
  private eventIdFromUrl: number | null = null; // Guardem l'ID de la URL aquí
  // selectedDate: Date = new Date(); // Es calcularà a sendDataToParent
  // dayOfWeek: number | null = null; // Es calcularà a sendDataToParent

  // --- State Signals (per a la plantilla i reactivitat clau) ---
  dateInput = signal<string>(this.formatTodayAsDateString()); // Data a l'input YYYY-MM-DD
  selectedEventId = signal<number | null>(null); // ID de l'event seleccionat
  eventsList = signal<DrinkEvent[]>([]); // Llista d'events per al dropdown
  // cacheEventsList = signal<DrinkEvent[]>([]); // Cache potser no és necessari si sempre recarreguem o la lògica és simple
  isLoading = signal<boolean>(false); // Indicador de càrrega

  constructor() { }

  ngOnInit(): void {
    this.isLoading.set(true); // Iniciem la càrrega

    // 1. Llegir el paràmetre de la URL PRIMER (només un cop)
    this.route.queryParamMap.pipe(take(1)).subscribe(params => {
      const eventIdParam = params.get('eventId');
      if (eventIdParam) {
        const eventIdNum = Number(eventIdParam);
        if (!isNaN(eventIdNum)) {
          this.eventIdFromUrl = eventIdNum; // Guarda l'ID de la URL
          console.log('OnInit: eventId from URL found:', this.eventIdFromUrl);
        } else {
          console.warn(`OnInit: Invalid eventId format in URL: ${eventIdParam}`);
        }
      } else {
         console.log('OnInit: No eventId found in URL.');
      }

      // 2. DESPRÉS de llegir la URL, carrega els events inicials
      this.loadInitialEvents();
    });
  }

  // Carrega els events inicials i decideix la selecció
  loadInitialEvents() {
    this.isLoading.set(true); // Assegura't que està loading
    // TODO: Decideix quina crida fer aquí. Si sempre són els actius:
    this.eventsService.getEventsByUserId().subscribe({
      next: (events) => {
        const loadedEvents = events || [];
        this.eventsList.set(loadedEvents); // Actualitza la llista per al dropdown
        console.log('Initial events loaded:', loadedEvents.length);

        let eventIdToSelect: number | null = null;
        let dateToSet: string = this.dateInput(); // Per defecte, la data actual

        // 3. Decideix quin event seleccionar DESPRÉS de carregar
        if (this.eventIdFromUrl !== null) {
          // Tenim un ID de la URL, comprovem si existeix a la llista
          const eventExists = loadedEvents.some(e => e.event_id === this.eventIdFromUrl);
          if (eventExists) {
            // L'event de la URL existeix, el seleccionem
            eventIdToSelect = this.eventIdFromUrl;
            console.log(`Initial selection: Using eventId ${eventIdToSelect} from URL.`);
            // Opcional: Ajusta la data a la de l'event de la URL
             const eventData = loadedEvents.find(e => e.event_id === this.eventIdFromUrl);
             if (eventData?.data_inici) {
                 dateToSet = this.formatDateAsDateString(new Date(eventData.data_inici));
                 console.log(`Initial date set to event start date: ${dateToSet}`);
             }

          } else {
            // L'event de la URL no és a la llista, ignora'l i selecciona per data
            console.warn(`Initial selection: eventId ${this.eventIdFromUrl} from URL not found in list. Selecting based on date ${dateToSet}.`);
            eventIdToSelect = this.findEventIdForDateInternal(dateToSet, loadedEvents);
          }
        } else {
          // No hi havia ID per URL, selecciona per la data actual
          console.log(`Initial selection: No eventId from URL. Selecting based on date ${dateToSet}.`);
          eventIdToSelect = this.findEventIdForDateInternal(dateToSet, loadedEvents);
        }

        // 4. Estableix l'estat final
        this.dateInput.set(dateToSet); // Estableix la data final (pot haver canviat si venia de URL)
        this.selectedEventId.set(eventIdToSelect); // Estableix l'event final

        this.isLoading.set(false); // Finalitza la càrrega

        // 5. Envia l'estat inicial al pare ARA
        this.sendDataToParent();

      },
      error: (err) => {
        console.error("Error loading initial events:", err);
        this.eventsList.set([]); // Buida la llista
        this.selectedEventId.set(null); // Desselecciona
        this.isLoading.set(false);
        this.sendDataToParent(); // Envia estat buit
      }
    });
  }

  // Gestor del canvi de data a l'input
  onDateChange() {
    const newDate = this.dateInput(); // Llegeix la nova data del signal (ja actualitzat per ngModelChange)
    console.log('onDateChange: Date changed to', newDate);
    this.isLoading.set(true);

    // TODO: Implementa la lògica per carregar events passats si cal
    // if (this.isDateInPast(newDate)) {
    //   this.loadEventsForSpecificDate(newDate); // Hauries de crear aquesta funció
    // } else {

    // Simplificació: Assumeix que la llista actual `eventsList` és suficient
    const currentEvents = this.eventsList();
    const eventIdForNewDate = this.findEventIdForDateInternal(newDate, currentEvents);
    this.selectedEventId.set(eventIdForNewDate); // Actualitza l'event seleccionat

    // } // Fi del else (si hi ha lògica per data passada)

    this.isLoading.set(false);
    this.sendDataToParent(); // Envia el nou estat (nova data, nou eventId)
  }

  // Funció interna per TROBAR l'ID d'event per una data (NO actualitza signals directament)
  findEventIdForDateInternal(dateStr: string, events: DrinkEvent[]): number | null {
    if (!dateStr || events.length === 0) {
      return null;
    }
    try {
      const targetDate = this.stripTime(new Date(dateStr));
      if (isNaN(targetDate.getTime())) return null; // Data invàlida

      const matchingEvents = events.filter(event => {
         try {
            const start = this.stripTime(new Date(event.data_inici));
            const end = this.stripTime(new Date(event.data_fi));
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
            return start <= targetDate && targetDate <= end;
         } catch { return false;}
      });

      if (matchingEvents.length > 0) {
        matchingEvents.sort((a, b) => new Date(a.data_inici).getTime() - new Date(b.data_inici).getTime());
        console.log(`findEventIdForDateInternal: Found event ${matchingEvents[0].event_id} for date ${dateStr}`);
        return matchingEvents[0].event_id; // Retorna l'ID del primer event coincident
      } else {
        console.log(`findEventIdForDateInternal: No event found for date ${dateStr}`);
        return null; // No s'ha trobat cap event
      }
    } catch (error) {
        console.error(`findEventIdForDateInternal: Error finding event for date ${dateStr}`, error);
        return null;
    }
  }

  // Aquesta funció es crida quan canvia el *select* (via ngModelChange a l'HTML)
  // Només necessita enviar les dades, ja que ngModel ja ha actualitzat selectedEventId()
  updateDrinkDataEventId() {
    console.log('updateDrinkDataEventId: Event selection changed to', this.selectedEventId());
    this.sendDataToParent();
  }

  // --- Send data to parent ---
  // Centralitza l'emissió de dades
  sendDataToParent() {
    let currentDate: Date | null = null;
    let currentDayOfWeek: number | null = null;
    const dateStr = this.dateInput(); // Llegeix del signal

    try {
        if (dateStr && !isNaN(new Date(dateStr).getTime())) {
            currentDate = new Date(dateStr);
            currentDayOfWeek = this.getDayOfWeek(currentDate);
        }
    } catch (e) {
       console.error("Error parsing date in sendDataToParent:", e);
    }

    const eventIdToSend = this.selectedEventId(); // Llegeix del signal

    console.log('sendDataToParent: Emitting', { currentDate, currentDayOfWeek, eventIdToSend });
    this.dateInfoChange.emit({
      selectedDate: currentDate,
      dayOfWeek: currentDayOfWeek,
      eventId: eventIdToSend
    });
  }

  // --- Helper functions ---

  stripTime(date: Date): Date {
    if (!date || isNaN(date.getTime())) return new Date(NaN);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  getDayOfWeek(date: Date): number {
    if (!date || isNaN(date.getTime())) return 0;
    let day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    return day === 0 ? 7 : day; // Converteix a 1 (Monday) to 7 (Sunday)
  }

  formatDateAsDateString(date: Date): string {
    if (!date || isNaN(date.getTime())) return '';
    try {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch { return ''; }
  }

  formatTodayAsDateString(): string {
    return this.formatDateAsDateString(new Date());
  }

  isDateInPast(dateString: string): boolean {
    try {
      const today = this.stripTime(new Date());
      const inputDate = this.stripTime(new Date(dateString));
      if (isNaN(today.getTime()) || isNaN(inputDate.getTime())) return false;
      return inputDate < today;
    } catch { return false; }
  }

  // --- Funcions no utilitzades o redundants (es poden eliminar) ---
  // loadInitialData() {} // Lògica integrada a ngOnInit/loadInitialEvents
  // OnChanges() {} // No sembla necessari amb la lògica actual
  // cacheEventsList // Potser no cal si la lògica és simple o sempre es recarrega
}
