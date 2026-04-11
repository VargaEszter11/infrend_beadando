import { Component, OnDestroy, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { ApiService } from '../api.service';
import { Car, MonthlyReport, Trip } from '../models';
import { formatApiError } from '../api-error.util';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
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
              [value]="carSelectValue"
              (change)="onCarSelectChange($event)"
            >
              <option value="">Select car</option>
              @for (c of cars(); track c.id) {
                <option [value]="carOptionValue(c.id)">{{ c.licensePlate }}</option>
              }
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
                @for (t of periodTrips(); track t.id) {
                <tr class="border-t border-slate-800">
                  <td class="px-3 py-2">{{ t.date | date: 'yyyy-MM-dd' }}</td>
                  <td class="px-3 py-2">{{ t.type }}</td>
                  <td class="px-3 py-2">{{ t.from }} → {{ t.to }}</td>
                  <td class="px-3 py-2">{{ t.distance }}</td>
                  <td class="px-3 py-2">{{ t.endKm }}</td>
                </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
        }
      </section>
    </div>
  `,
})
export class HomePageComponent implements OnDestroy {
  readonly cars = signal<Car[]>([]);
  readonly periodTrips = signal<Trip[]>([]);
  carId: number | null = null;
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  report: MonthlyReport | null = null;
  selectedCar: Car | null = null;
  startKm: number | null = null;
  endKm: number | null = null;
  readonly error = signal('');

  private reportSub?: Subscription;

  constructor(private readonly api: ApiService) {
    this.api.get<Car[]>('/cars').subscribe({
      next: (cars) => {
        this.cars.set(cars);
      },
      error: (e) => this.error.set(formatApiError(e, 'Failed to load cars')),
    });
  }

  ngOnDestroy(): void {
    this.reportSub?.unsubscribe();
  }

  get carSelectValue(): string {
    return this.carId == null ? '' : String(this.carId);
  }

  carOptionValue(id: number): string {
    return String(id);
  }

  onCarSelectChange(ev: Event): void {
    const raw = (ev.target as HTMLSelectElement).value;
    this.carId = raw === '' ? null : Number(raw);
    this.loadReport();
  }

  loadReport(): void {
    this.reportSub?.unsubscribe();
    this.reportSub = undefined;

    if (this.carId == null) {
      this.report = null;
      this.selectedCar = null;
      this.periodTrips.set([]);
      this.startKm = null;
      this.endKm = null;
      this.error.set('');
      return;
    }

    const carId = this.carId;
    const year = this.year;
    const month = this.month;
    this.selectedCar = this.cars().find((c) => c.id === carId) ?? null;

    this.reportSub = forkJoin({
      report: this.api.get<MonthlyReport>(`/report?carId=${carId}&month=${month}&year=${year}`),
      trips: this.api.get<Trip[]>('/trips'),
    }).subscribe({
      next: ({ report, trips }) => {
        const selectedCar = this.cars().find((c) => c.id === carId) ?? null;
        const filtered = trips
          .filter((t) => t.car.id === carId)
          .filter((t) => {
            const d = new Date(t.date);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
          })
          .sort((a, b) => +new Date(a.date) - +new Date(b.date));
        this.report = report;
        this.periodTrips.set(filtered);
        this.startKm =
          filtered.length > 0 && selectedCar
            ? filtered[0].endKm - filtered[0].distance
            : (selectedCar?.startKm ?? null);
        this.endKm = filtered.length > 0 ? filtered[filtered.length - 1].endKm : (selectedCar?.startKm ?? null);
        this.error.set('');
      },
      error: (e) => this.error.set(formatApiError(e, 'Could not load report or trips')),
    });
  }
}
