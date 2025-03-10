import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../../core/services/drinking-data/drinking-data.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Subscription } from 'rxjs';

interface DrinkData {
  user_id: number;
  date: string;
  day_of_week: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  drink: string;
  quantity: number;
  others: string;
  price: number;
}

interface User {
  userId: number;
  id: number;
  name: string;
  roles: string[];
}

@Component({
  selector: 'app-drinking-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './drinking-page.component.html',
  styleUrl: './drinking-page.component.css'
})
export class DrinkingPageComponent implements OnInit, OnDestroy {

  drinkData: DrinkData = {
    user_id: 0,
    date: '',
    day_of_week: 0,
    location: '',
    latitude: null,
    longitude: null,
    drink: '',
    quantity: 1,
    others: '',
    price: 0
  };

  lastLocations: string[] = [];
  lastDrinks: string[] = [];
  locationSuggestions: string[] = [];
  drinkSuggestions: string[] = [];
  private authSubscription: Subscription | undefined;
  user: User | null = null;
    userSubscription: Subscription | undefined;

  constructor(
    private drinkingDataService: DrinkingDataService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.getCurrentLocation();
    this.drinkData.date = this.formatDate(new Date());
    this.updateDayOfWeek();

      this.userSubscription = this.authService.user$.subscribe(user => {
        if (user) {
          this.loadLastLocations(user.id);
          this.loadLastDrinks(user.id);
        } else {
          console.warn('Usuari no autenticat.');
          // Aquí podries redirigir a la pàgina de login o mostrar un missatge d'error
        }
      });

   //  const user = this.authService.getUser();
   //  if(user) {
   //       this.loadLastLocations(user.id);
   //       this.loadLastDrinks(user.id);
   //  }

    console.log('last locations:' , this.lastLocations);
    console.log('last drinks:' , this.lastDrinks);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
      if (this.userSubscription) {
          this.userSubscription.unsubscribe();
      }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.drinkData.latitude = position.coords.latitude;
          this.drinkData.longitude = position.coords.longitude;
        },
        (error) => {
          console.error('Error al obtenir la ubicació:', error);
        }
      );
    } else {
      console.error('Geolocalització no suportada pel navegador.');
    }
  }

  filterLocations() {
    this.locationSuggestions = this.lastLocations.filter(location =>
      location.toLowerCase().startsWith(this.drinkData.location.toLowerCase())
    );
  }

  filterDrinks() {
    this.drinkSuggestions = this.lastDrinks.filter(drink =>
      drink.toLowerCase().startsWith(this.drinkData.drink.toLowerCase())
    );
  }

  loadLastLocations(userId:number) {
    if (!userId) {  // <-- Comprovació important
      console.warn('ID d\'usuari no disponible. No es poden carregar les ubicacions.');
      return;
    }
    console.log('Crida a drinkingDataService.getLastLocations()'); // <-- AFEGEIX
    this.drinkingDataService.getLastLocations(userId).subscribe(
      locations => {
        this.lastLocations = locations;
        console.log('Ubicacions obtingudes:', locations); // <-- AFEGEIX
      },
      error => {
        console.error('Error al carregar ubicacions anteriors:', error);
      }
    );
  }

  loadLastDrinks(userId:number) {
    if (!userId) {  // <-- Comprovació important
      console.warn('ID d\'usuari no disponible. No es poden carregar les begudes.');
      return;
    }
     console.log('Crida a drinkingDataService.getLastDrinks()'); // <-- AFEGEIX
    this.drinkingDataService.getLastDrinks(userId).subscribe(
      drinks => {
        this.lastDrinks = drinks;
        console.log('Begudes obtingudes:', drinks); // <-- AFEGEIX
      },
      error => {
        console.error('Error al carregar begudes anteriors:', error);
      }
    );
  }

  getDayOfWeek(date: Date): number {
    let day = date.getDay();
    if (day === 0) {
      day = 7;
    }
    return day;
  }

  updateDayOfWeek() {
    const date = new Date(this.drinkData.date);
    this.drinkData.day_of_week = this.getDayOfWeek(date);
  }

  onSubmit() {
     console.log("aixo tinc en drink data abans d'enviar", this.drinkData);
    this.drinkingDataService.addDrinkData(this.drinkData).subscribe(
      response => {
        console.log('Resposta del backend:', response);
        this.drinkData = {
          user_id: 0,
          date: '',
          day_of_week: 0,
          location: '',
          latitude: null,
          longitude: null,
          drink: '',
          quantity: 1,
          others: '',
          price: 0
        };
        this.locationSuggestions = [];
        this.drinkSuggestions = [];
        const user = this.authService.getUser();
        if(user) {
          this.loadLastLocations(user.id);
          this.loadLastDrinks(user.id);
     }
      },
      error => {
        console.error('Error al enviar les dades:', error);
      }
    );
  }
}
