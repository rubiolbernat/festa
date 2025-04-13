import { DrinkEvent } from './v2_drink-events.model';
import { UserSimplified } from "./v2_user.model";

// Interface to represent a story
export interface StorySlide {
  id: number;
  user_id?: number; // ID de l'usuari que ha pujat la story
  drink_id?: number; // ID de la beguda associada a la story
  imageUrl: string;  // URL de la imatge de la story
  uploadedAt: string;
  expiresAt: string;
  votes: number;
  isSaved: boolean;
  voted?: boolean;
}

// Interface to get all stories of a user
export interface StoryUserData {
  user: UserSimplified;
  stories: StorySlide[];
}

// Interface to get the stories of a drink event
export interface StoryEventData {
  EventDetails: DrinkEvent;
  stories: StoryUserData[];
}
