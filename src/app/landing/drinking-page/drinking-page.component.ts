import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';
import { Subscription } from 'rxjs';
import { DrinkData } from '../../core/models/drink-data.model';
import { AlertService } from '../../core/services/alert/alert.service'; // Import AlertService
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-drinking-page',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './drinking-page.component.html',
  styleUrls: ['./drinking-page.component.css']
})
export class DrinkingPageComponent implements OnInit, OnDestroy {

  drinkData: DrinkData = {
    user_id: 0, // No cal inicialitzar user_id aquí
    date: '',
    day_of_week: 0,
    location: '',
    latitude: 0,
    longitude: 0,
    drink: '',
    quantity: 0.33,
    num_drinks: 1,
    others: '',
    price: 0
  };

  drinks = [
    { name: 'Selecciona', quantity: 0, descr: 'Selecciona una opció' },
    { name: 'Manual', quantity: 0.33, descr: 'Introdueix manualment la quantitat' },
    { name: 'Cervesa', quantity: 0.33, descr: '33 cl' },
    { name: 'Cubata', quantity: 0.33, descr: '33 cl' },
    { name: 'Cubata Tub', quantity: 0.25, descr: '250 ml' },
    { name: 'Tubo', quantity: 0.40, descr: '40 cl' },
    { name: 'Quinto', quantity: 0.20, descr: '20 cl' },
    { name: 'Xupito', quantity: 0.04, descr: '4 cl' },
    { name: 'Canya', quantity: 0.25, descr: '25 cl' },
    { name: 'Gerra', quantity: 1, descr: '1 l' },
    { name: 'Sangria', quantity: 1.5, descr: '1.5 l' },
    { name: 'Vi', quantity: 0.15, descr: '15 cl (una copa)' }
  ];

  selectedDrink = this.drinks[0];
  priceindividual: boolean = true;
  manualQuantity: boolean = false;

  lastLocations: string[] = [];
  lastDrinks: string[] = [];
  locationSuggestions: string[] = [];
  drinkSuggestions: string[] = [];
  private subscription: Subscription | undefined;
  hasGpsData: boolean = true;

  constructor(
    private drinkingDataService: DrinkingDataService,
    private alertService: AlertService // Inject AlertService
  ) { }

  ngOnInit(): void {
    this.getCurrentLocation();
    this.drinkData.date = this.formatDate(new Date());
    this.updateDayOfWeek();
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onDrinkQuantityChange(event: any) {
    this.selectedDrink = this.drinks.find(d => d.name === event.target.value) || this.drinks[0];
    this.drinkData.quantity = this.selectedDrink.quantity;
    //True when manual
    this.manualQuantity = this.selectedDrink.name === 'Manual';
  }

  onPriceChange(newValue: number) {
    if (typeof newValue === 'number') {
      this.drinkData.price = newValue;
    }
  }

  onNumDrinksChange(newValue: number) {
    if (Number.isInteger(newValue)) {
      this.drinkData.num_drinks = newValue;
    }
  }

  get totalPrice(): number {
    if (this.priceindividual) {
      return this.drinkData.price;
    } else {
      return this.drinkData.num_drinks * this.drinkData.price;
    }
  }

  onDrinkInputChange(newValue: string) {
    // Troba la beguda corresponent a la llista `drinks` i actualitza `selectedDrink`
    const foundDrink = this.drinks.find(drink => drink.name === newValue);
    if (foundDrink) {
      this.selectedDrink = foundDrink;
    } else {
      // Si no es troba, pots decidir què fer:
      // - Restablir `selectedDrink` a un valor per defecte
      // - Deixar `selectedDrink` com està
      console.log("No s'ha trobat la beguda:", newValue);
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
          this.hasGpsData = true;
        },
        (error) => {
          console.error('Error al obtenir la ubicació:', error);
          this.hasGpsData = false;
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.error('Geolocalització no suportada pel navegador.');
      this.hasGpsData = false;
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

  loadData() {
    this.subscription = this.drinkingDataService.getLastLocations().subscribe(
      locations => {
        this.lastLocations = locations;
        console.log('Ubicacions obtingudes:', locations);
      },
      error => {
        console.error('Error al carregar ubicacions anteriors:', error);
      }
    );

    this.subscription.add(this.drinkingDataService.getLastDrinks().subscribe(
      drinks => {
        this.lastDrinks = drinks;
        console.log('Begudes obtingudes:', drinks);
      },
      error => {
        console.error('Error al carregar begudes anteriors:', error);
      }
    ));
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

  onQuantityChange(newValue: any) {
    if (typeof newValue === 'string') {
      newValue = newValue.replace(',', '.');
      this.drinkData.quantity = parseFloat(newValue);
    }
  }

  onSubmit() {
    // L'enviament real es fa a submitData()
  }

  submitData() {
    if (this.drinkData.price < 0 || !this.drinkData.quantity) {
      this.alertService.showAlert('Si us plau, emplena la quantitat i el preu', 'warning', 5000);
      return;
    }
    //Poso en majuscules la 1ra lletra de la ubicació i la beguda
    this.drinkData.location = String(this.drinkData.location).charAt(0).toUpperCase() + String(this.drinkData.location).slice(1);
    this.drinkData.drink = String(this.drinkData.drink).charAt(0).toUpperCase() + String(this.drinkData.drink).slice(1);

    //console.log("aixo tinc en drink data abans d'enviar", this.drinkData);
    this.drinkingDataService.addDrinkData(this.drinkData).subscribe(
      response => {
        console.log('Resposta del backend:', response);
        this.alertService.showAlert('Dades enviades correctament', 'success', 3000); // Mostra l'alerta
        this.drinkData = {
          user_id: 0, // No cal enviar l'ID de l'usuari
          date: '',
          day_of_week: 0,
          location: '',
          latitude: 0,
          longitude: 0,
          drink: '',
          quantity: 0.33,
          others: '',
          price: 0,
          num_drinks: 1
        };
        this.locationSuggestions = [];
        this.drinkSuggestions = [];
        this.loadData();
      },
      error => {
        console.error('Error al enviar les dades:', error);
      }
    );
  }
}
