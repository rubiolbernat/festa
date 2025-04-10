// Interfície bàsica de l'esdeveniment (igual que abans)
export interface DrinkEvent {
  event_id: number;
  nom: string;
  data_creacio: string;
  data_inici: string;
  data_fi: string;
  opcions?: string | null; // Pot ser un string JSON o null
}

// Interfície per a la informació d'un usuari inscrit (igual que abans)
export interface EventUser {
  user_id: number;
  data_inscripcio: string;
}

// Interfície per a la resposta de getEventDetails
export interface EventDetails extends DrinkEvent {
  participants: EventUser[]; // Array de participants
}

// Interfície per a respostes genèriques de l'API (missatges)
// L'API PHP retorna { "message": "..." } per errors o èxit simple
export interface ApiResponse {
  message: string; // El PHP sembla retornar sempre 'message'
}

// Interfície específica per a la resposta de creació/actualització exitosa
// El PHP retorna { "message": "...", "event": { ... } }
export interface ApiEventResponse extends ApiResponse {
  event: DrinkEvent;
}

// Tipus per a les dades en crear (Omit<...> igual que abans)
export type CreateEventData = Omit<DrinkEvent, 'event_id' | 'data_creacio'>;

// Tipus per a les dades en actualitzar (Partial<...> igual que abans, però adaptat)
// L'API PHP sembla esperar tots els camps a l'actualització ('nom', 'data_inici', 'data_fi', 'opcions')
// Si vols permetre actualització parcial, hauries de modificar el PHP `updateEventAction`
// Per ara, assumim que tots els camps són necessaris a l'actualització, excepte 'opcions' que pot ser null.
export interface UpdateEventData {
    nom: string;
    data_inici: string;
    data_fi: string;
    opcions?: any | null; // Pot ser objecte, array, string JSON, o null per esborrar
}
