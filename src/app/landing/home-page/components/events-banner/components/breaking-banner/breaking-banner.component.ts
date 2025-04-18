import { Component, input } from '@angular/core';
import { DrinkEvent, EventUser, EventParticipants } from '../../../../../../core/models/v2_drink-events.model';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EventIconPipe } from '../../../../../../core/pipes/event-icon.pipe';
import { RelativeTimePipe } from '../../../../../../core/pipes/relative-time.pipe';

@Component({
  selector: 'app-breaking-banner',
  imports: [RouterLink, CommonModule, EventIconPipe, RelativeTimePipe],
  standalone: true,
  templateUrl: './breaking-banner.component.html',
  styleUrl: './breaking-banner.component.css'
})
export class BreakingBannerComponent {
  eventdata = input<DrinkEvent[]>() ;
}
