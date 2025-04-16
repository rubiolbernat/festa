import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- Importa FormsModule
import { CommonModule } from '@angular/common'; // <-- Importa CommonModule per *ngIf, etc.
import { Router } from '@angular/router'; // <-- Importa Router per redirigir (opcional)
// Elimina la definició local si ja la tens a core/models
import { DrinkEvent } from './../../core/models/v2_drink-events.model';
import { DrinkEventsService } from '../../core/services/drink-events.service';
import { AuthService } from '../../core/services/auth/auth.service';

// Defineix un tipus o interfície per a les dades del formulari de creació
// Pot ser un subconjunt de DrinkEvent si no necessites tots els camps per crear
interface CreateEventData {
  nom: string;
  data_inici: string; // Els inputs de tipus 'date' funcionen bé amb strings YYYY-MM-DD
  data_fi: string;
  created_by: number;
  // Afegeix aquí altres camps si vols permetre crear-los des del formulari
  // opcions?: string | null;
}

@Component({
  selector: 'app-events-create',
  standalone: true, // <-- Important si el component és standalone
  imports: [
    CommonModule,    // <-- Necessari per *ngIf, etc.
    FormsModule      // <-- Necessari per [(ngModel)] i la gestió del formulari
  ],
  templateUrl: './events-create.component.html',
  styleUrl: './events-create.component.css'
})
export class EventsCreateComponent {
  eventservice = inject(DrinkEventsService);
  userService = inject(AuthService);

  // Objecte per enllaçar amb el formulari usant ngModel
  newEvent: CreateEventData = {
    nom: '',
    data_inici: '',
    data_fi: '',
    created_by: this.userService.getUserId()
  };

  minEndDate: string = ''; // Per restringir la data de fi mínima
  formError: string | null = null; // Per mostrar errors generals del formulari
  isLoading: boolean = false; // Per mostrar un indicador de càrrega (opcional)

  // Injecta el Router si vols redirigir després de crear l'event
  constructor(private router: Router) { }

  // Funció que s'executa quan s'envia el formulari
  onSubmit(): void {
    this.formError = null;

    if (this.newEvent.data_inici && this.newEvent.data_fi && this.newEvent.data_fi < this.newEvent.data_inici) {
      this.formError = 'La data de fi no pot ser anterior a la data d\'inici.';
      return;
    }

    // --- 1. OBTENIR L'ID DE L'USUARI ACTUAL ---
    const currentUserId = this.userService.getUser()?.id; // *** OBTÉ L'ID ***
    // Canvia getCurrentUserId() pel mètode real del teu AuthService

    if (!currentUserId) {
      this.formError = 'Error: No s\'ha pogut obtenir l\'identificador de l\'usuari. Si us plau, torna a iniciar sessió.';
      this.isLoading = false; // Atura la càrrega si no hi ha usuari
      return;
    }

    this.isLoading = true;

    // --- 2. CREAR L'OBJECTE COMPLET PER ENVIAR (PAYLOAD) ---
    const eventPayload = {
      ...this.newEvent,         // Copia les propietats de l'objecte del formulari
      created_by: currentUserId // Afegeix la propietat created_by
      // Afegeix 'opcions' si el teu formulari el gestiona:
      // opcions: this.newEvent.opcions ?? null
    };

    console.log('Enviant dades per crear event:', eventPayload); // Log per debugging

    // --- 3. CRIDAR AL SERVEI AMB EL PAYLOAD COMPLET ---
    this.eventservice.createEvent(eventPayload).subscribe({ // *** PASSA eventPayload ***
      next: (createdEvent) => {
        console.log('Event creat amb èxit:', createdEvent);
        this.isLoading = false;
        alert('Event creat amb èxit!');
        this.resetForm();
        this.router.navigate(['/events']);
      },
      error: (error) => {
        console.error('Error en crear l\'event:', error);
        this.isLoading = false;
        const errorMsg = error?.error?.message || error?.message || 'Error desconegut en crear l\'event.';
        this.formError = `Error en crear l'event: ${errorMsg}. Si us plau, intenta-ho de nou.`;
      }
    });
  }
  // Funció per actualitzar la data mínima de fi quan canvia la data d'inici
  onStartDateChange(): void {
    this.minEndDate = this.newEvent.data_inici;
    // Opcional: Si la data de fi actual és anterior a la nova data d'inici, netejar-la o ajustar-la
    if (this.newEvent.data_fi && this.newEvent.data_fi < this.newEvent.data_inici) {
      this.newEvent.data_fi = ''; // O this.newEvent.data_fi = this.newEvent.data_inici;
    }
  }

  // Funció per netejar el formulari
  resetForm(): void {
    this.newEvent = {
      nom: '',
      data_inici: '',
      data_fi: '',
      created_by: this.userService.getUserId()
    };
    this.minEndDate = '';
    this.formError = null;
    // Potser necessites accedir al formulari per marcar-lo com a "pristine" si uses ViewChild
  }
}
