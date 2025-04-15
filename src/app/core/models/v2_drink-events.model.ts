import { DrinkData } from './drink-data.model';
import { User } from "./v2_user.model";

// Interfície bàsica de l'esdeveniment (igual que abans)
export interface DrinkEvent {
  event_id: number;
  nom: string;
  data_creacio: string;
  data_inici: string;
  data_fi: string;
  opcions?: string | null; // Pot ser un string JSON o null
  DrinkData?: DrinkData;
  Created_by?: Number;
  created_by_name?: string;
  total_participants?: number;
}

// Interfície per a la informació d'un usuari inscrit (igual que abans)
export interface EventUser {
  user: User; // Informació de l'usuari
  user_id: number;
  data_inscripcio: string;
}

// Interfície per a la resposta de getEventDetails
export interface EventParticipants extends DrinkEvent {
  participants: EventUser[]; // Array de participants
}
