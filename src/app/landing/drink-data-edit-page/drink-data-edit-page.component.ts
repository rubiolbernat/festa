import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrinkingDataService } from '../../core/services/drinking-data/drinking-data.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DrinkData } from '../../core/models/drink-data.model';
import { FormsModule } from '@angular/forms';
import { Subscription, switchMap } from 'rxjs';
import { AlertService } from '../../core/services/alert/alert.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-drink-data-edit-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './drink-data-edit-page.component.html',
  styleUrls: ['./drink-data-edit-page.component.css']
})
export class DrinkDataEditPageComponent implements OnInit, OnDestroy {

  drinkData: DrinkData = {
    user_id: 0,
    date: '',
    day_of_week: 0,
    location: '',
    latitude: 0,
    longitude: 0,
    drink: '',
    quantity: 0.33,
    num_drinks: 1,
    others: '',
    price: 0,
    id: 0
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
  hasGpsData: boolean = true;

  private subscription: Subscription | undefined;
  dataId: number = 0;

  constructor(
    private drinkingDataService: DrinkingDataService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.dataId = +params['id'];
      this.loadDrinkData();
    });
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadDrinkData(): void {
    this.subscription = this.drinkingDataService.getDrinkDataById(this.dataId).subscribe(
      (data) => {
        this.drinkData = data;
        this.updateSelectedDrink(); // Actualitzar selectedDrink quan es carreguen les dades
      },
      (error) => {
        console.error('Error al carregar les dades:', error);
        this.alertService.showAlert('Error al carregar les dades', 'danger', 3000);
        this.router.navigate(['/la_gran_aventura-list']);
      }
    );
  }

  updateDrinkData() {
    this.subscription = this.drinkingDataService.updateDrinkData(this.drinkData).subscribe(
      () => {
        this.alertService.showAlert('Dades actualitzades correctament', 'success', 3000);
        this.router.navigate(['/la_gran_aventura-list']);
      },
      (error) => {
        console.error('Error al actualizar les dades:', error);
        this.alertService.showAlert('Error al actualizar les dades', 'danger', 3000);
      }
    );
  }

  deleteDrinkData() {
    if (confirm('Estàs segur que vols eliminar aquest registre?')) {
      if (this.drinkData.id !== undefined) {
        this.subscription = this.drinkingDataService.deleteDrinkData(this.drinkData.id).subscribe(
          () => {
            this.alertService.showAlert('Registre eliminat correctament', 'success', 3000);
            this.router.navigate(['/la_gran_aventura-list']);
          },
          (error) => {
            console.error('Error al eliminar el registre:', error);
            this.alertService.showAlert('Error al eliminar el registre', 'danger', 3000);
          }
        );
      }
    }
  }

  cancelEdit() {
    this.router.navigate(['/la_gran_aventura-list']);
  }

  //Noves Funcions
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

  private updateSelectedDrink() {
    this.selectedDrink = this.drinks.find(drink => drink.name === this.drinkData.drink) || this.drinks[0];
    this.manualQuantity = this.selectedDrink.name === 'Manual';
  }
}
