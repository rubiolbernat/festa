import { Component, input, output, computed } from '@angular/core';
import { ProductItemCart } from '../../../../core/models/product.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-item',
  imports: [FormsModule, CommonModule],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css'
})
export class CartItemComponent {
  productCartItem = input.required<ProductItemCart>();

  onRemove = output<{ id: number, model: string[] }>();
  onIncrease = output<ProductItemCart>();
  onDecrease = output<ProductItemCart>();
  onManualQuantity = output<number>();

  // Càlcul del preu total amb 2 decimals
  totalPrice = computed(() =>
    (this.productCartItem().product.price * this.productCartItem().quantity).toFixed(2)
  );

  onQuantityChange(event: any) {
    let newQuantity = parseInt(event.target.value, 10);

    // Comprova si el valor és vàlid i dins del rang
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1; // Estableix la quantitat mínima a 1
    } else if (newQuantity > this.productCartItem().product.stock) {
      newQuantity = this.productCartItem().product.stock; // Limita la quantitat al stock màxim
    }

    // Actualitza la quantitat si és diferent
    if (newQuantity !== this.productCartItem().quantity) {
      this.productCartItem().quantity = newQuantity;
      this.onIncrease.emit({ ...this.productCartItem(), quantity: newQuantity });
      this.onManualQuantity.emit(newQuantity); // Emeter el valor manual modificat
    }
  }
}
