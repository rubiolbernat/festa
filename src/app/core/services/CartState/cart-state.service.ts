import { Injectable, Signal, inject } from '@angular/core';
import { ProductItemCart } from '../../models/product.model';
import { signalSlice } from 'ngxtension/signal-slice';
import { StorageService } from '../storage/storage.service';
import { Observable, map } from 'rxjs';
import { Product, Variation } from '../../models/product.model'; // Importa la interfície Variation

interface State {
  products: ProductItemCart[];
  loaded: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CartStateService {
  private _storageService = inject(StorageService);

  private initialState: State = {
    products: [],
    loaded: false,
  };

  loadProducts$ = this._storageService
    .loadProducts()
    .pipe(map((products) => ({ products, loaded: true })));

  state = signalSlice({
    initialState: this.initialState,
    sources: [this.loadProducts$],
    selectors: (state) => ({
      count: () =>
        state().products.reduce((acc, product) => acc + product.quantity, 0),
      price: () => {
        const totalPrice = state().products.reduce(
          (acc, product) => acc + product.product.price * product.quantity,
          0,
        );
        return parseFloat(totalPrice.toFixed(2)); // Retorna un número amb 2 decimals
      },
    }),
    actionSources: {
      add: (state, action$: Observable<ProductItemCart>) =>
        action$.pipe(map((product) => this.add(state, product))),

      remove: (state, action$: Observable<{ id: number; model: string[] }>) =>
        action$.pipe(map(({ id, model }) => this.remove(state, id, model))),

      update: (state, action$: Observable<ProductItemCart>) =>
        action$.pipe(map((product) => this.update(state, product))),
    },

    effects: (state) => ({
      load: () => {
        if (state().loaded) {
          console.log(state.products());
          this._storageService.saveProducts(state().products);
        }
      },
    }),
  });

  // Funció per obtenir l'estoc d'un producte o variació
  private getStock(product: Product, model: string[]): number {
    if (product.variations && product.variations.length > 0 && model && model.length > 0) {
      // Trobar la variació corresponent
      const matchedVariation = product.variations.find(variation => variation.property_value === model[0]); // Assumeixo que només hi ha un model

      if (matchedVariation) {
        return matchedVariation.stock;
      }
    }
    // Si no hi ha variacions o no es troba la variació, retorna l'estoc general del producte
    return product.stock;
  }


  private add(state: Signal<State>, product: ProductItemCart) {
    const isInCart = state().products.find(
      (productInCart) =>
        productInCart.product.product_id === product.product.product_id &&
        JSON.stringify(productInCart.model) === JSON.stringify(product.model)
    );

    const maxStock = this.getStock(product.product, product.model);

    if (!isInCart) {
      return {
        products: [...state().products, { ...product, quantity: Math.min(product.quantity, maxStock) }]
      };
    }

    // Si el mateix producte i model ja hi és, només s'actualitza la quantitat
    isInCart.quantity = Math.min(isInCart.quantity + product.quantity, maxStock);

    return {
      products: [...state().products]
    };
  }

  private remove(state: Signal<State>, id: number, model: string[]) {
     return {
            products: state().products.filter(
                (product) =>
                    product.product.product_id !== id ||
                    JSON.stringify(product.model) !== JSON.stringify(model)
            ),
        };
  }

  private update(state: Signal<State>, product: ProductItemCart) {
    const products = state().products.map((productInCart) => {
      if (
        productInCart.product.product_id === product.product.product_id &&
        JSON.stringify(productInCart.model) === JSON.stringify(product.model)
      ) {
        return { ...productInCart, quantity: Math.min(product.quantity, this.getStock(product.product, product.model)) }; // Aplica el límit de stock
      }
      return productInCart;
    });

    return { products };
  }
}
