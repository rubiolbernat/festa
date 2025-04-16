import { Pipe, PipeTransform } from '@angular/core';

interface IconMapping {
  keyword: string;
  icon: string;
}

@Pipe({
  name: 'eventIcon',
  standalone: true,
})
export class EventIconPipe implements PipeTransform {

  // Definim les associacions paraula clau -> icona
  // IMPORTANT: L'ordre pot importar si una paraula clau n'inclou una altra.
  // Posa les més específiques primer. Per exemple, si tinguessis "festa major",
  // l'hauries de posar abans que "festa" si vols una icona diferent per a ella.
  private iconMappings: IconMapping[] = [
    // Celebracions Específiques
    { keyword: 'aniverri', icon: '🎂' },
    { keyword: 'casament', icon: '💍' },
    { keyword: 'boda', icon: '💍' },
    { keyword: 'bateig', icon: '🕊️' },
    { keyword: 'comunió', icon: '✝️' },
    { keyword: 'graduació', icon: '🎓' },
    { keyword: 'jubilació', icon: '🧓' },
    { keyword: 'sant joan', icon: '🔥' },
    { keyword: 'nadal', icon: '🎄' },
    { keyword: 'cap d’any', icon: '🎆' },
    { keyword: 'any nou', icon: '🎇' },
    { keyword: 'carnestoltes', icon: '🎭' },
    { keyword: 'reis', icon: '👑' },
    { keyword: 'pasqua', icon: '🐇' },
    { keyword: 'halloween', icon: '🎃' },
    { keyword: 'castanyada', icon: '🌰' },
    { keyword: 'setmana', icon: '🗓️' },

    // Activitats / Tipus Generals
    { keyword: 'festa', icon: '🎉' },
    { keyword: 'transsegre', icon: '🛶' },
    { keyword: 'concert', icon: '🎵' },
    { keyword: 'música', icon: '🎶' },
    { keyword: 'dj', icon: '🎧' },
    { keyword: 'karaoke', icon: '🎤' },
    { keyword: 'esport', icon: '⚽' },
    { keyword: 'cursa', icon: '🏃' },
    { keyword: 'marató', icon: '🥇' },
    { keyword: 'partit', icon: '🏆' },
    { keyword: 'futbol', icon: '⚽' },
    { keyword: 'basquet', icon: '🏀' },
    { keyword: 'tennis', icon: '🎾' },
    { keyword: 'padel', icon: '🏓' },
    { keyword: 'natació', icon: '🏊' },
    { keyword: 'senderisme', icon: '🥾' },
    { keyword: 'excursió', icon: '🚶' },
    { keyword: 'muntanya', icon: '⛰️' },
    { keyword: 'platja', icon: '🏖️' },

    // Cultura
    { keyword: 'teatre', icon: '🎭' },
    { keyword: 'cinema', icon: '🎬' },
    { keyword: 'cultural', icon: '📚' },
    { keyword: 'exposició', icon: '🖼️' },
    { keyword: 'conferència', icon: '🗣️' },
    { keyword: 'xerrada', icon: '🗣️' },
    { keyword: 'taller', icon: '🧑‍🏫' },
    { keyword: 'formació', icon: '📖' },

    // Gastronomia i àpats
    { keyword: 'sopar', icon: '🍽️' },
    { keyword: 'dinar', icon: '🍽️' },
    { keyword: 'esmorzar', icon: '🥐' },
    { keyword: 'vermut', icon: '🍸' },
    { keyword: 'pícnic', icon: '🧺' },
    { keyword: 'barbacoa', icon: '🔥' },
    { keyword: 'gastronomia', icon: '🍲' },
    { keyword: 'vi', icon: '🍷' },
    { keyword: 'cata', icon: '🍷' },
    { keyword: 'cervesa', icon: '🍺' },

    // Fira, mercats i oci
    { keyword: 'fira', icon: '🎪' },
    { keyword: 'mercat', icon: '🛍️' },
    { keyword: 'fires', icon: '🎡' },
    { keyword: 'atraccions', icon: '🎠' },

    // Viatges i escapades
    { keyword: 'viatge', icon: '✈️' },
    { keyword: 'sortida', icon: '🧭' },
    { keyword: 'cap de setmana', icon: '🗓️' },
    { keyword: 'jornada', icon: '☀️' },

    // Diversos
    { keyword: 'infantil', icon: '🧸' },
    { keyword: 'famílies', icon: '👨‍👩‍👧‍👦' },
    { keyword: 'joves', icon: '🧑‍🎤' },
    { keyword: 'reunió', icon: '🤝' },
    { keyword: 'trobada', icon: '👋' },
    { keyword: 'dia', icon: '☀️' },
    { keyword: 'nit', icon: '🌙' },
  ];

  transform(eventName: string | undefined | null): string {
    const defaultIcon = '📅'; // Icona per defecte

    if (!eventName) {
      return defaultIcon;
    }

    const lowerCaseName = eventName.toLowerCase();

    // Iterem sobre les nostres associacions definides
    for (const mapping of this.iconMappings) {
      // Comprovem si el nom de l'event inclou la paraula clau
      // Compte amb accents si les teves dades en tenen i vols que coincideixi!
      // Per exemple, 'transsegre' no coincidirà amb 'transsegré'
      if (lowerCaseName.includes(mapping.keyword)) {
        return mapping.icon; // Retornem la icona associada
      }
    }

    // Si el bucle acaba sense trobar cap coincidència, retornem la icona per defecte
    return defaultIcon;
  }
}
