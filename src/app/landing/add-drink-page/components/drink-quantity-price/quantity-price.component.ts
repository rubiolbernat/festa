import { CommonModule } from '@angular/common';
import { Component, OnInit, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DrinkingDataService } from '../../../../core/services/drinking-data/drinking-data.service';

export interface QuantityPriceDrinkOutput {
  quantity: number;
  price: number;
  units: number;
  name: string;
}
interface Drink {
  name: string;
  quantity: number;
  descr: string;
}

@Component({
  selector: 'app-quantity-price',
  imports: [CommonModule, FormsModule],
  templateUrl: './quantity-price.component.html',
  styleUrl: './quantity-price.component.css'
})
export class DrinkQuantityPriceComponent implements OnInit {

  private drinkingDataService = inject(DrinkingDataService);

  public data = output<QuantityPriceDrinkOutput>();

  totalLiters = signal<number>(0);
  totalPrice = signal<number>(0);
  price = signal<number>(0);
  isPriceUnitary = signal<boolean>(true);
  units = signal<number>(1);
  manualQuantity = signal<boolean>(false);
  manualQuantityValue = signal<number>(0.33);
  Quantity = signal<number>(0.33);

  drinks: Drink[] = [
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

  drinkName = signal<string>('');
  drinkSuggestions = signal<string[]>([]);
  lastDrinks = signal<string[]>([]);
  selectedDrink = signal<Drink>(this.drinks[2]); // Default to Cervesa
  drinkNameChanged: boolean = false;

  ngOnInit() {
    this.loadData();
    this.drinkName.set(this.selectedDrink().name);
    this.calculateData();
  }

  //Funcions
  loadData() {
    this.drinkingDataService.getLastDrinks().subscribe(
      drinks => {
        this.lastDrinks.set(drinks);
        //console.log('Begudes obtingudes:', drinks);
      },
      error => {
        console.error('Error al carregar begudes anteriors:', error);
      }
    );
  }

  calculateData() {
    // If price unitary is true, we need to calculate the total price based on the units and the price
    if (this.isPriceUnitary()) {
      this.totalPrice.set(parseFloat((this.price() * this.units()).toFixed(2)));
    } else {
      this.totalPrice.set(this.price());
    }
    this.totalLiters.set(parseFloat((this.selectedDrink().quantity * this.units()).toFixed(2)));

    this.sendData();
  }

  sendData() {
    let formattedName: string;
    if(this.drinkName().length > 0){
      formattedName = this.drinkName()[0].toUpperCase() + this.drinkName().slice(1);
    } else {
      formattedName = this.drinkName();
    }

    this.data.emit({
      quantity: this.totalLiters(),
      price: this.totalPrice(),
      units: this.units(),
      name: formattedName
    });
  }

  onUnitsChange(event: number) {
    if (event > 0) {
      if (this.units() > 0) {
        this.units.update(value => (value + event >= 0 ? value + event : value));
      } else {
        this.units.set(1);
      }
    } else {
      if (this.units() > 0) {
        this.units.update(value => (value + event >= 0 ? value + event : value));
      }
      else {
        this.units.set(1);
      }
    }
    this.calculateData();
  }

  onPriceTypeChange(type: boolean) {
    this.isPriceUnitary.update(value => type);
    this.calculateData();
  }

  onPriceChange(newPrice: number) {
    // Change , to .
    let priceStr = String(newPrice).replace(',', '.');
    const parsedPrice = parseFloat(priceStr);

    if (!isNaN(parsedPrice) && parsedPrice >= 0) {
      this.price.set(parseFloat(parsedPrice.toFixed(2)))
    } else if (priceStr.trim() === '') {
      this.price.set(0);
    } else {
      console.warn('Invalid price input:', newPrice);
      this.price.set(0);
    }
    this.calculateData();
  }

  onNumDrinksChange(event: any) {
    let eventStr = String(event).replace(',', '.'); // Replace comma with dot
    const parsedEvent = parseFloat(eventStr);

    if (!isNaN(parsedEvent) && parsedEvent > 0) {
      const integerUnits = Math.floor(parsedEvent); // Ensure the value is an integer
      this.units.set(integerUnits);
    } else if (eventStr.trim() === '') {
      this.units.set(1); // Default to 1 if the input is empty
    } else {
      console.warn('Invalid input for number of drinks:', event);
      this.units.set(1); // Default to 1 if the value is invalid
    }
    this.calculateData();
  }

  onDrinkQuantityChange(event: any) {
    const selectedDrink = this.drinks.find(drink => drink.name === event.target.value);
    if (event.target.value === 'Manual') { //Manual needs to be capitalized
      this.manualQuantity.set(true);
      if (selectedDrink) {
        this.selectedDrink.set(selectedDrink);
        this.Quantity.set(this.manualQuantityValue());
      }
      if (!this.drinkNameChanged) {
        this.drinkName.set('');
      }
    } else {
      this.manualQuantity.set(false);
      if (selectedDrink) {
        this.selectedDrink.set(selectedDrink);
        this.Quantity.set(selectedDrink.quantity);
      }
      if (!this.drinkNameChanged && selectedDrink) {
        this.drinkName.set(selectedDrink.name);
      }
    }
    this.calculateData();
  }

  onQuantityChange(newQuantity: number) {
    let quantityStr = String(newQuantity).replace(',', '.');
    const parsedQuantity = parseFloat(quantityStr);

    this.manualQuantityValue.set(parsedQuantity);
    const updatedDrink = { ...this.selectedDrink(), quantity: parsedQuantity };
    this.selectedDrink.set(updatedDrink);

    this.calculateData();
  }

  filterDrinks() {
    if (this.drinkName() && this.drinkName().trim() !== '') {
      const searchTerm = this.drinkName().toLowerCase();
      const predefinedMatches = this.drinks
        .map(d => d.name)
        .filter(name => name !== 'Selecciona' && name !== 'Manual' && name.toLowerCase().includes(searchTerm));
      const lastDrinkMatches = this.lastDrinks()
        .filter(drink => drink.toLowerCase().includes(searchTerm));

      // Combina i elimina duplicats
      this.drinkSuggestions.set([...new Set([...predefinedMatches, ...lastDrinkMatches])].slice(0, 5)); // Limita a 5 suggeriments
    } else {
      this.drinkSuggestions.set([]);
    }
    this.sendData();
  }
  onDrinkInputChange(newValue: string) {
    //this.drinkData.drink = newValue;
    //console.log('Drink input changed:', newValue);
    this.filterDrinks();
  }

}
