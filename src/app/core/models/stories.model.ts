/**
 * Representa els detalls de la beguda associada a una story slide específica.
 * Correspon a l'objecte 'drink' niat dins de cada element de l'array 'stories'.
 */
export interface StoryDrink {
  drinkId: number;        // ID de l'entrada original a drink_data
  date: string;           // Data de la consumició (format YYYY-MM-DD)
  location: string;       // Lloc de la consumició
  name: string;           // Nom de la beguda
  quantity: number;       // Quantitat de la beguda (per unitat, si count > 1)
  price: number;          // Preu de la beguda (per unitat, si count > 1)
  count: number;          // Nombre d'unitats d'aquesta beguda registrades en l'entrada original
}

/**
 * Representa una única "slide" o imatge/vídeo dins de la story d'un usuari.
 * Correspon a un objecte dins de l'array 'stories' de l'API.
 */
export interface StorySlide {
  storyId: number;        // ID únic de la story slide (de la taula drink_stories)
  imageUrl: string;       // URL de la imatge de la story
  uploadedAt: string;     // Timestamp (com a string) de quan es va pujar
  expiresAt: string;      // Timestamp (com a string) de quan expira
  votes: number;          // Nombre actual de vots per aquesta story
  isSaved: boolean;       // Indica si la story està guardada (marcada per l'usuari)
  hasBeenSeen: boolean;   // Indica si l'usuari actual ja ha vist aquesta story específica
  drink: StoryDrink;        // Objecte niat amb la informació de la beguda associada
  // Pots afegir camps opcionals si l'API els retorna o els necessites
  // slideType?: 'image' | 'video'; // Si distingeixes tipus
  // hasVoted?: boolean; // Per saber si l'usuari actual ha votat AQUESTA slide
}

/**
 * Representa l'estructura de dades principal per a un usuari i les seves stories actives.
 * Correspon a cada objecte dins de l'array principal retornat per l'API.
 * Aquest és el tipus que utilitzaràs per a l'array `storiesData` al teu component.
 */
export interface StoryUserData {
  userId: number;         // ID de l'usuari propietari de les stories
  userName: string;       // Nom de l'usuari
  stories: StorySlide[];    // Array de totes les slides actives per a aquest usuari
  // Podries afegir un camp opcional per a la miniatura si la vols explícita,
  // tot i que la pots obtenir de la primera story (stories[0].imageUrl).
  // thumbnailUrl?: string;
}
