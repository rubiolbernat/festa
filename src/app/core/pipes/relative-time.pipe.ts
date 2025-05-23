import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  standalone: true,
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const now = new Date();
    const date = typeof value === 'string' ? new Date(value) : value;
    const diffMs = date.getTime() - now.getTime(); // Positiu = futur
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    const absDiffSeconds = Math.abs(diffSeconds);
    const absDiffMinutes = Math.abs(diffMinutes);
    const absDiffHours = Math.abs(diffHours);
    const absDiffDays = Math.abs(diffDays);

    const years = Math.floor(absDiffDays / 365);
    const months = Math.floor((absDiffDays % 365) / 30);
    const weeks = Math.floor(absDiffDays / 7);

    if (diffMs > 0) {
      // FUTUR
      if (absDiffSeconds < 60) {
        return `d'aquí ${absDiffSeconds} s`;
      } else if (absDiffMinutes < 60) {
        return `d'aquí ${absDiffMinutes} min`;
      } else if (absDiffHours < 24) {
        return `d'aquí ${absDiffHours} h`;
      } else if (absDiffDays === 1) {
        return `demà`;
      } else if (absDiffDays === 2) {
        return `demà passat`;
      } else if (absDiffDays < 7) {
        return `d'aquí ${absDiffDays} dies`;
      } else if (absDiffDays < 30) {
        return `d'aquí ${weeks} ${weeks > 1 ? 'setmanes' : 'setmana'}`;
      } else if (absDiffDays < 365) {
        return `d'aquí ${months} mes${months > 1 ? 'os' : ''}`;
      } else {
        return `d'aquí ${years} any${years > 1 ? 's' : ''}`;
      }
    } else {
      // PASSAT
      if (absDiffSeconds < 60) {
        return `fa ${absDiffSeconds} s`;
      } else if (absDiffMinutes < 60) {
        return `fa ${absDiffMinutes} min`;
      } else if (absDiffHours < 24) {
        return `fa ${absDiffHours} h`;
      } else if (absDiffDays === 1) {
        return `ahir`;
      } else if (absDiffDays === 2) {
        return `abans d’ahir`;
      } else if (absDiffDays < 7) {
        return `fa ${absDiffDays} dies`;
      } else if (absDiffDays < 30) {
        return `fa ${weeks} ${weeks > 1 ? 'setmanes' : 'setmana'}`;
      } else if (absDiffDays < 365) {
        return `fa ${months} mes${months > 1 ? 'os' : ''}`;
      } else {
        return `fa ${years} any${years > 1 ? 's' : ''}`;
      }
    }
  }
}
