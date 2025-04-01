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
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return `fa ${diffSeconds} seg`;
    } else if (diffMinutes < 60) {
      return `fa ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `fa ${diffHours} h`;
    } else if (diffDays === 1) {
      return `ahir`;
    } else {
      return `fa ${diffDays} dies`;
    }
  }
}
