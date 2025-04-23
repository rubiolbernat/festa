import { StorySlide } from './v2_drink-stories.model'; // Assegura't que la ruta sigui correcta

// drink-data.model.ts
export interface DrinkData {
  id?: number; // Opcional perquè és autoincremental
  timestamp?: Date;
  user_id: number;
  date: Date;
  day_of_week: number;
  location: string;
  latitude?: number; // Opcional
  longitude?: number; // Opcional
  drink: string;
  quantity: number;
  others?: string; // Opcional
  price: number;
  num_drinks: number;
  event_id?: number | null; //Opcional
  storie: StorySlide;
}

export interface CombinedDrinkUserData extends DrinkData {
  user_name: string;
  user_email: string;
  image_url?: string;
  uploaded_at?: string;
  votes?: number;
}
