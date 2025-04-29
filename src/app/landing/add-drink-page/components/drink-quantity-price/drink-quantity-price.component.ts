import { Component } from '@angular/core';

export interface DrinkQuantPriceOutput {
  drink: string;
  quantity: number;
  price: number;
  num_drinks: number;
}

@Component({
  selector: 'app-drink-quantity-price',
  imports: [],
  templateUrl: './drink-quantity-price.component.html',
  styleUrl: './drink-quantity-price.component.css'
})
export class DrinkQuantityPriceComponent {

}
