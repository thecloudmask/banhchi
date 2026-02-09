import { Timestamp } from "firebase/firestore";

export interface Event {
  id: string;
  title: string;
  eventTime? : string;
  bannerUrl: string;
  eventDate: Timestamp | Date;
  location?: string;
  mapUrl?: string;
  status: 'active' | 'completed';
  createdAt: Timestamp | Date;
  bankQrUrl?: string;
  galleryUrls?: string[];
  passcode?: string;
  showGuestList?: boolean;
  category?: string;
}

export type PaymentMethod = string;

export interface Guest {
  id: string;
  name: string;
  amountUsd: number;
  amountKhr: number;
  paymentMethod: PaymentMethod;
  location?: string;
  note?: string;
  createdAt: Timestamp | Date;
}

export interface AuditLog {
  id: string;
  guestId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  details: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Timestamp | Date;
  userId: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'money_usd' | 'money_khr' | 'number' | 'text';
  unit?: string;
}

export interface Expense {
  id: string;
  name: string;
  budgetAmount: number;
  actualAmount: number;
  invoiceNumber?: string;
  currency: 'USD' | 'KHR';
  paymentMethod: PaymentMethod;
  note?: string;
  createdAt: Timestamp | Date;
}
