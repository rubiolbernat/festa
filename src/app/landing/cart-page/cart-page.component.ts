import { ProductItemCart } from './../../core/models/product.model';
import { Component, inject } from '@angular/core';
import { AlertService } from '../../core/services/alert/alert.service';
import { CartItemComponent } from './components/cart-item/cart-item.component';
import { CartStateService } from '../../core/services/CartState/cart-state.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-cart-page',
  imports: [CartItemComponent, RouterModule],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css'
})
export class CartPageComponent {
  constructor(private alertService: AlertService) {
  }

  state = inject(CartStateService).state;

  onRemove(id: number, model: string[], name: string) {
    this.alertService.showAlert(`S\'ha eliminat: ${name}`, 'danger', 3000);
    console.log(
      `Eliminat id ${id} i model ${model} `
    );
    this.state.remove({ id, model });
  }

  onIncrease(product: ProductItemCart) {
    if (product.product.stock >= product.quantity + 1) {
      this.state.update({
        ...product,
        quantity: product.quantity + 1
      });
    } else {
      product.quantity = product.product.stock;
    }
  }

  onDecrease(product: ProductItemCart) {
    if (product.quantity - 1 <= 0) {
      this.onRemove(product.product.product_id, product.model, product.product.name);
    } else {
      this.state.update({
        ...product,
        quantity: product.quantity - 1
      });
    }
  }

  handleQuantityChange(product: ProductItemCart) {
    // Comprovar que la quantitat nova sigui dins els límits
    let newQuantity: number = product.quantity;
    if (newQuantity < 1) {
      newQuantity = 1; // La quantitat mínima és 1
    } else if (newQuantity > product.product.stock) {
      newQuantity = product.product.stock; // No permetre una quantitat superior a l'stock
    }

    // Comprovar si la quantitat ha canviat realment
    if (newQuantity !== product.quantity) {
      this.state.update({
        ...product,
        quantity: newQuantity
      });
      console.log("Quantitat actualitzada a: ", newQuantity);
    }
  }

}

