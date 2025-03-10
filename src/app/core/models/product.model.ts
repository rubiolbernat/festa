// product.model.ts

export interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
  in_shop: boolean;
  stock: number;
  images: string[];
  variations: Variation[];
}

export interface Variation {
  variation_id: number;
  product_id: number;
  stock: number;
  property_id: number;
  property_name: string;
  property_value: string;
}

export interface ProductItemCart {
  product: Product;
  quantity: number;
  model: string[];
}
