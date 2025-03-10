import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, Variation } from '../../../../core/models/product.model';
import { ShopService } from '../../../../core/services/shop/shop.service';
import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { CartStateService } from '../../../../core/services/CartState/cart-state.service';

@Component({
  selector: 'app-shop',
  standalone: true, // <- important si vols fer servir imports
  imports: [RouterModule, DatePipe, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  products: Product[] = [];
  cartState = inject(CartStateService).state;

  constructor(private shopService: ShopService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.shopService.getProducts().subscribe({
      next: products => this.products = products,
      error: () => this.products = []
    });
  }

  addToCart(product: Product, event: { quantity: number; selectedVariation: string | null }) {
    let selectedVariation: Variation | null = null;

    // Trobar la variació seleccionada, si n'hi ha
    if (event.selectedVariation) {
      selectedVariation = product.variations?.find(v => v.property_value === event.selectedVariation) ?? null;
    }

    // Determinar la quantitat disponible
    let availableStock: number;
    if (selectedVariation) {
      availableStock = selectedVariation.stock;
    } else {
      availableStock = product.stock;
    }

    // Ajustar la quantitat si és superior a l'estoc disponible
    let quantityToAdd = event.quantity;
    if (quantityToAdd > availableStock) {
      quantityToAdd = availableStock;
    }

    // Si no hi ha estoc, no afegim res al carret
    if (quantityToAdd <= 0) {
      console.warn(`No hi ha estoc disponible per afegir ${product.name} al carret.`);
      return;
    }

    // Afegir al carret
    this.cartState.add({
      product: product,
      quantity: quantityToAdd,
      model: event.selectedVariation ? [event.selectedVariation] : []
    });

    console.log(
      `Adding product ${product.product_id} to cart quantity ${quantityToAdd}
      i el model ${event.selectedVariation}`
    );
  }
}
