import { Component } from '@angular/core';
import { CarrousselComponent } from './components/carroussel/carroussel.component';
import { NextConcertComponent } from './components/next-concert/next-concert.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [CarrousselComponent, NextConcertComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {

}
