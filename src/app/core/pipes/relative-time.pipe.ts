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
        const weeks = Math.floor(absDiffDays / 7);
        return `d'aquí ${weeks} setmana${weeks > 1 ? 's' : ''}`;
      } else {
        const months = Math.floor(absDiffDays / 30);
        return `d'aquí ${months} mes${months > 1 ? 'os' : ''}`;
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
        const weeks = Math.floor(absDiffDays / 7);
        return `fa ${weeks} setmana${weeks > 1 ? 's' : ''}`;
      } else {
        const months = Math.floor(absDiffDays / 30);
        return `fa ${months} mes${months > 1 ? 'os' : ''}`;
      }
    }
  }
}
