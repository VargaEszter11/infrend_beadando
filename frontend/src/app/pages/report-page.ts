import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Car, MonthlyReport, Trip } from '../models';

@Component({
  selector: 'app-report-page',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, CurrencyPipe, DatePipe],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Monthly report</h1>

      <form
        class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-4"
        (ngSubmit)="loadReport()"
      >
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="number"
          [(ngModel)]="year"
          name="year"
          min="2000"
          max="2100"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="number"
          [(ngModel)]="month"
          name="month"
          min="1"
          max="12"
          required
        />
        <select
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="carId"
          name="carId"
          required
        >
          <option [ngValue]="undefined">Car (license plate)</option>
          <option *ngFor="let c of cars" [ngValue]="c.id">{{ c.licensePlate }}</option>
        </select>
        <button class="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500">
          Load report
        </button>
      </form>

      <div
        *ngIf="error"
        class="rounded border border-rose-600/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300"
      >
        {{ error }}
      </div>

      <div *ngIf="report && selectedCar" class="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 class="text-lg font-semibold">{{ selectedCar.licensePlate }} — {{ selectedCar.type }}</h2>
        <p class="text-sm text-slate-400">
          Fuel: {{ selectedCar.fuelType }}, consumption: {{ selectedCar.consumption }} L/100 km
        </p>
        <p class="text-sm">
          Period start odometer: {{ startKm ?? '—' }} | end odometer: {{ endKm ?? '—' }}
        </p>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded border border-slate-800 p-3">
            <h3 class="font-medium">Business trips</h3>
            <p>Distance: {{ report.business.distance }}</p>
            <p>Fuel cost: {{ report.business.fuel | currency: 'HUF' : 'symbol' : '1.0-0' }}</p>
            <p>Flat rate: {{ report.business.flat | currency: 'HUF' : 'symbol' : '1.0-0' }}</p>
            <p>Total: {{ report.business.total | currency: 'HUF' : 'symbol' : '1.0-0' }}</p>
          </div>
          <div class="rounded border border-slate-800 p-3">
            <h3 class="font-medium">Private trips</h3>
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
              <tr *ngFor="let t of periodTrips" class="border-t border-slate-800">
                <td class="px-3 py-2">{{ t.date | date: 'yyyy-MM-dd' }}</td>
                <td class="px-3 py-2">{{ t.type }}</td>
                <td class="px-3 py-2">{{ t.from }} ? {{ t.to }}</td>
                <td class="px-3 py-2">{{ t.distance }}</td>
                <td class="px-3 py-2">{{ t.endKm }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
})
export class ReportPageComponent {
  cars: Car[] = [];
  carId?: number;
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  report: MonthlyReport | null = null;
  selectedCar: Car | null = null;
  periodTrips: Trip[] = [];
  startKm: number | null = null;
  endKm: number | null = null;
  error = '';

  constructor(private readonly api: ApiService) {
    this.api.get<Car[]>('/cars').subscribe({ next: (cars) => (this.cars = cars) });
  }

  loadReport(): void {
    if (!this.carId) return;
    this.selectedCar = this.cars.find((c) => c.id === this.carId) ?? null;
    this.api.get<MonthlyReport>(`/report?carId=${this.carId}&month=${this.month}&year=${this.year}`).subscribe({
      next: (r) => {
        this.report = r;
        this.error = '';
      },
      error: (e) => (this.error = e.error?.error ?? 'Could not load report'),
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
        this.periodTrips = filtered;
        this.startKm =
          filtered.length > 0 && this.selectedCar
            ? filtered[0].endKm - filtered[0].distance
            : (this.selectedCar?.startKm ?? null);
        this.endKm = filtered.length > 0 ? filtered[filtered.length - 1].endKm : (this.selectedCar?.startKm ?? null);
      },
    });
  }
}
