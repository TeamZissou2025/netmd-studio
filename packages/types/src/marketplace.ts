import type { ListingStatus, ListingCategory, ListingCondition, OrderStatus } from './database';

export interface ListingCard {
  id: string;
  title: string;
  priceCents: number;
  currency: string;
  condition: ListingCondition;
  category: ListingCategory;
  status: ListingStatus;
  images: string[];
  sellerName: string;
  sellerAvatarUrl: string | null;
  favoriteCount: number;
  isFavorited: boolean;
  createdAt: string;
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  totalCents: number;
  currency: string;
  listingTitle: string;
  listingImage: string | null;
  counterpartyName: string;
  createdAt: string;
}
