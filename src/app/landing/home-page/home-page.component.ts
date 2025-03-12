import { Component } from '@angular/core';
import { CarrousselComponent } from './components/carroussel/carroussel.component';
import { LastInsertComponent } from './components/last-insert/last-insert.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [CarrousselComponent,  LastInsertComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
