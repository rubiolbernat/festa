import { Product, Variation } from './../../../core/models/product.model';
import { Component, EventEmitter, OnInit, input, output } from '@angular/core';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent implements OnInit {

  public product = input.required<Product>();
  public OutputCart = output<{ quantity: number, selectedVariation: string | null }>();

  selectedVariation: string | null = null;
  showError: boolean = false;
  totalPrice: number = 0;
  quantity: number = 1;
  maxQuantity: number = 0; // Nova propietat per al màxim de quantitat disponible
  outOfStock: boolean = false; // Nova propietat per indicar si està esgotat

  ngOnInit(): void {
    this.totalPrice = this.product().price;
    this.updateMaxQuantity(); // Initialitzeu la quantitat màxima disponible
  }

  addToCart(productId: number): void {
    if (this.outOfStock) {
      return; // No afegir al carro si està esgotat
    }

    if (!this.selectedVariation && this.product().variations && this.product().variations.length > 0) {
      this.showError = true;
      return;
    }

    this.OutputCart.emit({ quantity: this.quantity, selectedVariation: this.selectedVariation ?? null });
  }

  updateVariationDetails(selectElement: any, productId: number): void {
    const selectedValue = selectElement.value; // Obtenim el valor seleccionat
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const propertyValue = selectedOption?.dataset?.property;
    const stock = Number(selectedOption?.dataset?.stock);

    this.selectedVariation = propertyValue;
    this.showError = false;

    if (stock === 0) {
      this.outOfStock = true;
      this.maxQuantity = 0;
      this.quantity = 0; // Desactivem la quantitat si està esgotat
    } else {
      this.outOfStock = false;
      this.maxQuantity = stock;
      if (this.maxQuantity < this.quantity) {
        this.quantity = stock;
      }
    }

    this.updateTotalPrice();
  }

  onQuantityChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let quantity = Number(inputElement.value);

    // Assegurem que la quantitat estigui dins del rang vàlid
    if (quantity < 1) {
      quantity = 1;
    } else if (quantity > this.maxQuantity) {
      quantity = this.maxQuantity;
    }

    this.quantity = quantity;
    this.updateTotalPrice();
  }

  updateTotalPrice(): void {
    if (this.product) {
      this.totalPrice = parseFloat((this.product().price * this.quantity).toFixed(2));
    }
  }

  isNewProduct(createdAt: string): boolean {
    const creationDate = new Date(createdAt);
    const now = new Date();
    const differenceInDays = (now.getTime() - creationDate.getTime()) / (1000 * 3600 * 24);
    return differenceInDays <= 30 * 3;
  }

  // Nova funció per inicialitzar la quantitat màxima disponible
  updateMaxQuantity(): void {
    if (this.product().variations && this.product().variations.length > 0) {
      if (!this.selectedVariation) {
        this.maxQuantity = this.product().stock; // Agafem l'estoc general si no s'ha seleccionat variació
      } else {
        // Troba la variació seleccionada i agafa el seu estoc
        const selectedVariation = this.product().variations.find(v => v.property_value === this.selectedVariation);
        if (selectedVariation) {
          this.maxQuantity = selectedVariation.stock;
        } else {
          this.maxQuantity = this.product().stock; // Si no es troba la variació, agafem l'estoc general (cas rar)
        }
      }
    } else {
      this.maxQuantity = this.product().stock; // Si no hi ha variacions, usem l'estoc general del producte
    }
  }
}
