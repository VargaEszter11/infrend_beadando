export interface Car {
  id: number;
  licensePlate: string;
  type: string;
  fuelType: string;
  consumption: number;
  startKm: number;
}

export interface Driver {
  id: number;
  name: string;
  birthDate: string;
  address: string;
  licenseNumber: string;
  licenseExpiry: string;
  isExpired?: boolean;
}

export interface Trip {
  id: number;
  date: string;
  distance: number;
  type: 'BUSINESS' | 'PRIVATE' | string;
  from: string;
  to: string;
  endKm: number;
  car: Car;
  driver: Driver;
}

export interface ReportSummary {
  distance: number;
  fuel: number;
  flat: number;
  total: number;
}

export interface MonthlyReport {
  business: ReportSummary;
  private: ReportSummary;
}
