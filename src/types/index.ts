export type FittingStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELED';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  colors: string[];
  sizes: string[];
}

export interface FittingRequest {
  requestId: string;
  productId: string;
  productName: string;
  imageUrl: string;
  color: string;
  size: string;
  status: FittingStatus;
  createdAt: number;
  updatedAt: number;
  sessionId: string; // The user who made the request
}
