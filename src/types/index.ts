export type FittingStatus = 'pending' | 'assigned' | 'completed';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  colors: string[];
  sizes: string[];
}

export interface TaggedProduct {
  productId: string;
  productName: string;
  color: string;
  size: string;
}

export interface FittingRequest {
  requestId: string;
  products: TaggedProduct[];
  fittingRoomId: string;
  status: FittingStatus;
  requestTime: number;
  sessionId: string;
}
