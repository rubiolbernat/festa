import { trigger, transition, style, animate, query } from '@angular/animations';

export const landingTransition = trigger('landingTransition', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, scale: 0.9 })
    ], { optional: true }),
    query(':leave', [
      style({ opacity: 1, scale: 1 }),
      animate('0.3s ease-out', style({ opacity: 0, scale: 0.9 }))
    ], { optional: true }),
    query(':enter', [
      animate('0.3s ease-out', style({ opacity: 1, scale: 1 }))
    ], { optional: true }),
  ])
])
