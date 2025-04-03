// drink-data.model.ts
export interface DrinkData {
  id?: number; // Opcional perquè és autoincremental
  timestamp?: Date; // Opcional perquè té un valor per defecte al backend
  user_id: number;
  date: string; // o Date, depenent de com ho gestionis al backend
  day_of_week: number;
  location: string;
  latitude?: number; // Opcional
  longitude?: number; // Opcional
  drink: string;
  quantity: number;
  others?: string; // Opcional
  num_drinks: number;
  price: number;
}

export interface CombinedDrinkUserData extends DrinkData {
  user_name: string;
  user_email: string;
  image_url?: string; //Añadimos la url de la imagen
  uploaded_at?: string; //Añadimos la url de la imagen
  votes?: number;
}
