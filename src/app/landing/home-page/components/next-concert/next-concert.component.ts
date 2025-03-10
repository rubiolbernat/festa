import { Component, OnInit } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { ConcertService } from '../../../../core/services/concert_db/concert.service';
import { Concert } from '../../../../core/models/concert';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-next-concert',
  standalone: true,
  imports: [DatePipe, NgIf, RouterModule],
  templateUrl: './next-concert.component.html',
  styleUrl: './next-concert.component.css'
})
export class NextConcertComponent implements OnInit {
  nextConcert: Concert | null = null;

  constructor(private concertService: ConcertService) { }

  ngOnInit(): void {
    this.loadNextConcert();
  }

  loadNextConcert(): void {
    this.concertService.getNextConcert().subscribe({
      next: concert => this.nextConcert = concert,
      error: () => this.nextConcert = null
    });
  }
}
