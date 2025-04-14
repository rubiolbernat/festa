import { Component } from '@angular/core';
import { CarrousselComponent } from './components/carroussel/carroussel.component';
import { RouterModule } from '@angular/router';
import { InfiniteInsertsComponent } from './components/infinite-inserts/infinite-inserts.component';
import { LastInsertComponent } from './components/last-insert/last-insert.component';
import { StoriesBarComponent } from './components/stories-bar/stories-bar.component';
import { BannerComponent } from './components/banner/banner.component';
import { EventsBannerComponent } from './components/events-banner/events-banner.component';

@Component({
  selector: 'app-home-page',
  imports: [StoriesBarComponent, CarrousselComponent,  InfiniteInsertsComponent, LastInsertComponent, BannerComponent, EventsBannerComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
