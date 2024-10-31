export interface User {
  id: string;
  name: string;
  email: string;
  isArtisan: boolean;
  avatar?: string;
  bio?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  artisanId: string;
  stock: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}