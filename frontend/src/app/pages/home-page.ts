import { Component, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Car, MonthlyReport, Trip } from '../models';
import { formatApiError } from '../api-error.util';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule, NgFor, CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-8">

      <section class="space-y-4">
        <h2 class="text-2xl font-semibold">Monthly report</h2>

        <div class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-3">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-20" for="rep-year">Year</label>
            <input
              id="rep-year"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="number"
              [(ngModel)]="year"
              name="year"
              min="2000"
              max="2100"
              (change)="loadReport()"
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-20" for="rep-month">Month</label>
            <input
              id="rep-month"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="number"
              [(ngModel)]="month"
              name="month"
              min="1"
              max="12"
              (change)="loadReport()"
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-20" for="rep-car">Car</label>
            <select
              id="rep-car"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              [(ngModel)]="carId"
              name="carId"
              (ngModelChange)="loadReport()"
            >
              <option [ngValue]="undefined">Select car</option>
              <option *ngFor="let c of cars()" [ngValue]="c.id">{{ c.licensePlate }}</option>
            </select>
          </div>
        </div>

        @if (error()) {
          <div class="rounded border border-rose-600/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
            {{ error() }}
          </div>
        }

        @if (report && selectedCar) {
        <div class="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 class="text-lg font-semibold">{{ selectedCar.licensePlate }} — {{ selectedCar.type }}</h3>
          <p class="text-sm text-slate-400">
            Fuel: {{ selectedCar.fuelType }}, consumption: {{ selectedCar.consumption }} L/100 km
          </p>
          <p class="text-sm">
            Period start odometer: {{ startKm ?? '—' }} | end odometer: {{ endKm ?? '—' }}
          </p>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded border border-slate-800 p-3">
              <h4 class="font-medium">Business trips</h4>
              <p>Distance: {{ report.business.distance }}</p>
              <p>Fuel cost: {{ report.business.fuel | currency: 'HUF' : 'symbol' : '1.0-0' }}</p>
              <p>Flat rate: {{ report.business.flat | currency: 'HUF' : 'symbol' : '1.0-0' }}</p>
              <p>Total: {{ report.business.total | currency: 'HUF' : 'symbol' : '1.0-0' }}</p>
            </div>
            <div class="rounded border border-slate-800 p-3">
              <h4 class="font-medium">Private trips</h4>
              <p>Distance: {{ report.private.distance }}</p>
              <p>Fuel cost: {{ report.private.fuel | currency: 'HUF' : 'symbol' : '1.0-0' }}</p>
              <p>Flat rate: {{ report.private.flat | currency: 'HUF' : 'symbol' : '1.0-0' }}</p>
              <p>Total: {{ report.private.total | currency: 'HUF' : 'symbol' : '1.0-0' }}</p>
            </div>
          </div>

          <div class="overflow-x-auto rounded-xl border border-slate-800">
            <table class="min-w-full text-sm">
              <thead class="bg-slate-900 text-left text-slate-300">
                <tr>
                  <th class="px-3 py-2">Date</th>
                  <th class="px-3 py-2">Kind</th>
                  <th class="px-3 py-2">Route</th>
                  <th class="px-3 py-2">Dist.</th>
                  <th class="px-3 py-2">Odometer</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of periodTrips()" class="border-t border-slate-800">
                  <td class="px-3 py-2">{{ t.date | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-3 py-2">{{ t.type }}</td>
                  <td class="px-3 py-2">{{ t.from }} → {{ t.to }}</td>
                  <td class="px-3 py-2">{{ t.distance }}</td>
                  <td class="px-3 py-2">{{ t.endKm }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        }
      </section>
    </div>
  `,
})
export class HomePageComponent {
  readonly cars = signal<Car[]>([]);
  readonly periodTrips = signal<Trip[]>([]);
  carId?: number;
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  report: MonthlyReport | null = null;
  selectedCar: Car | null = null;
  startKm: number | null = null;
  endKm: number | null = null;
  readonly error = signal('');

  constructor(private readonly api: ApiService) {
    this.api.get<Car[]>('/cars').subscribe({
      next: (cars) => {
        this.cars.set(cars);
        if (cars.length > 0) {
          this.carId = cars[0].id;
          this.loadReport();
        }
      },
      error: (e) => this.error.set(formatApiError(e, 'Failed to load cars')),
    });
  }

  loadReport(): void {
    if (!this.carId) return;
    this.selectedCar = this.cars().find((c) => c.id === this.carId) ?? null;
    this.api.get<MonthlyReport>(`/report?carId=${this.carId}&month=${this.month}&year=${this.year}`).subscribe({
      next: (r) => {
        this.report = r;
        this.error.set('');
      },
      error: (e) => this.error.set(formatApiError(e, 'Could not load report')),
    });

    this.api.get<Trip[]>('/trips').subscribe({
      next: (trips) => {
        const filtered = trips
          .filter((t) => t.car.id === this.carId)
          .filter((t) => {
            const d = new Date(t.date);
            return d.getFullYear() === this.year && d.getMonth() + 1 === this.month;
          })
          .sort((a, b) => +new Date(a.date) - +new Date(b.date));
        this.periodTrips.set(filtered);
        this.startKm =
          filtered.length > 0 && this.selectedCar
            ? filtered[0].endKm - filtered[0].distance
            : (this.selectedCar?.startKm ?? null);
        this.endKm = filtered.length > 0 ? filtered[filtered.length - 1].endKm : (this.selectedCar?.startKm ?? null);
      },
      error: (e) => this.error.set(formatApiError(e, 'Could not load trip list')),
    });
  }
}
