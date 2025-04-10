// Interfície per a un esdeveniment
export interface DrinkEvent {
  event_id: number;
  nom: string;
  data_creacio: string; // Pots utilitzar 'Date' però string és més directe des de JSON
  data_inici: string;
  data_fi: string;
  opcions?: string | null; // Opcional i pot ser null
}

// Interfície per a la informació d'un usuari inscrit
export interface EventUser {
  user_id: number;
  data_inscripcio: string;
  // Podries afegir més detalls de l'usuari si l'API fes un JOIN
  // nom_usuari?: string;
}

// Interfície genèrica per a respostes simples (POST, PUT, DELETE)
export interface ApiResponse {
  message?: string;
  error?: string;
  event_id?: number; // Útil per a la resposta de creació
}

// Tipus per a les dades en crear un event (sense id ni data_creacio)
export type CreateEventData = Omit<DrinkEvent, 'event_id' | 'data_creacio'>;

// Tipus per a les dades en actualitzar (tots els camps són opcionals)
export type UpdateEventData = Partial<CreateEventData>;

// Tipus per als filtres possibles
export type EventFilter = 'upcoming' | 'past' | 'next' | 'date' | 'all';
