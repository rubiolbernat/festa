import { Component } from '@angular/core';
import { CarrousselComponent } from './components/carroussel/carroussel.component';
import { RouterModule } from '@angular/router';
import { InfiniteInsertsComponent } from './components/infinite-inserts/infinite-inserts.component';
import { LastInsertComponent } from './components/last-insert/last-insert.component';

@Component({
  selector: 'app-home-page',
  imports: [CarrousselComponent,  InfiniteInsertsComponent, LastInsertComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
