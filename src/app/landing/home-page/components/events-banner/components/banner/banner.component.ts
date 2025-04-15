import { StoryEventData } from './../../../../../../core/models/v2_drink-stories.model';
import { Component, OnInit, signal, input, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DrinkingDataService } from '../../../../../../core/services/drinking-data/drinking-data.service';
import { AuthService } from '../../../../../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrinkEvent, EventUser, EventParticipants } from '../../../../../../core/models/v2_drink-events.model';
import { DrinkEventsService } from '../../../../../../core/services/drink-events.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent {

  eventdata = input<DrinkEvent>();

  eventService = inject(DrinkEventsService);
  statsData = signal<any | null>(null);

  ngOnInit(): void {
    this.loadStatsData();
  }

  loadStatsData(): void {
    const event = this.eventdata();
    if (!event?.event_id) return;

    this.eventService.getEventStatsData(event.event_id).subscribe((res) => {
      this.statsData.set(res);
    });
  }

}
