export interface Beach {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
}

export interface Sup {
  id: string;
  qrCode: string;
  beachId: string;
  cabinetNumber: number;
  status: 'available' | 'rented' | 'maintenance';
  name: string;
  imageUrl?: string;
}

export interface RentalDuration {
  minutes: number;
  label: string;
  price: number;
}

export interface Rental {
  id: string;
  supId: string;
  qrCode: string;
  beachId: string;
  cabinetNumber: number;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  price: number;
  paymentRef?: string;
  status: 'pending_payment' | 'active' | 'completed' | 'cancelled' | 'overdue';
  actualMinutes?: number;
  actualPrice?: number;
  preAuthPaymentId?: string;
  userId?: string;
  phoneNumber?: string;
}

export interface PaymentRequest {
  rentalId: string;
  amount: number;
  currency: string;
  successUrl: string;
  failUrl: string;
  userEmail?: string;
  userPhone?: string;
  userName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  token?: string;
}

export interface IoTCommand {
  deviceId: string;
  command: 'unlock' | 'lock' | 'status';
  rentalId?: string;
}
