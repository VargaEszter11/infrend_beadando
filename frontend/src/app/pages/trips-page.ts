import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Car, Driver, Trip } from '../models';
import { formatApiError } from '../api-error.util';

type TripEditRow = {
  id: number;
  date: string;
  type: string;
  from: string;
  to: string;
  distance: number;
  endKm: number;
};

@Component({
  selector: 'app-trips-page',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Trips</h1>

      @if (error()) {
        <div class="rounded border border-rose-600/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
          {{ error() }}
        </div>
      }

      <div class="overflow-x-auto rounded-xl border border-slate-800">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-900 text-left text-slate-300">
            <tr>
              <th class="px-3 py-2">Date</th>
              <th class="px-3 py-2">Kind</th>
              <th class="px-3 py-2">Route</th>
              <th class="px-3 py-2">Dist.</th>
              <th class="px-3 py-2">Odometer</th>
              <th class="px-3 py-2">Car</th>
              <th class="px-3 py-2">Driver</th>
              @if (isLoggedIn()) {
                <th class="px-3 py-2">Actions</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (t of trips(); track t.id) {
              <tr class="border-t border-slate-800">
                <td class="px-3 py-2">{{ t.date | date: 'yyyy-MM-dd' }}</td>
                <td class="px-3 py-2">{{ t.type }}</td>
                <td class="px-3 py-2">{{ t.from }} ? {{ t.to }}</td>
                <td class="px-3 py-2">{{ t.distance }}</td>
                <td class="px-3 py-2">{{ t.endKm }}</td>
                <td class="px-3 py-2">{{ t.car.licensePlate }}</td>
                <td class="px-3 py-2">{{ t.driver.name }}</td>
                @if (isLoggedIn()) {
                  <td class="space-x-2 px-3 py-2">
                    <button type="button" class="rounded bg-slate-700 px-2 py-1" (click)="edit(t)">Edit</button>
                    <button type="button" class="rounded bg-rose-700 px-2 py-1" (click)="remove(t.id)">Delete</button>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (isLoggedIn()) {
      <form
        class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-2"
        (ngSubmit)="createTrip()"
      >
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="trip-car">Car</label>
          <select
            id="trip-car"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            [(ngModel)]="form.carId"
            name="carId"
            required
          >
            <option [ngValue]="undefined">Select car</option>
            @for (c of cars(); track c.id) {
              <option [ngValue]="c.id">{{ c.licensePlate }} ù {{ c.type }}</option>
            }
          </select>
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="trip-driver">Driver</label>
          <select
            id="trip-driver"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            [(ngModel)]="form.driverId"
            name="driverId"
            required
          >
            <option [ngValue]="undefined">Select driver</option>
            @for (d of validDrivers(); track d.id) {
              <option [ngValue]="d.id">{{ d.name }}</option>
            }
          </select>
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="trip-date">Date</label>
          <input
            id="trip-date"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            type="date"
            [(ngModel)]="form.date"
            name="date"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="trip-type">Trip type</label>
          <select
            id="trip-type"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            [(ngModel)]="form.type"
            name="type"
            required
          >
            <option value="BUSINESS">Business</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="trip-from">Departure</label>
          <input
            id="trip-from"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            [(ngModel)]="form.from"
            name="from"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="trip-to">Destination</label>
          <input
            id="trip-to"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            [(ngModel)]="form.to"
            name="to"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="trip-dist">Distance (km)</label>
          <input
            id="trip-dist"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            type="number"
            step="0.1"
            [(ngModel)]="form.distance"
            name="distance"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="trip-endkm">New odometer (km)</label>
          <input
            id="trip-endkm"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            type="number"
            [(ngModel)]="form.endKm"
            name="endKm"
            required
          />
        </div>
        <label class="inline-flex items-center gap-2 text-sm text-slate-300 md:col-span-2" for="trip-return">
          <input id="trip-return" type="checkbox" [(ngModel)]="form.createReturnTrip" name="createReturnTrip" />
          Register return trip automatically
        </label>
        <button
          type="submit"
          class="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 md:col-span-2"
        >
          Save trip
        </button>
      </form>
      }

      @if (isLoggedIn() && editing(); as ed) {
        <form
          class="grid gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4 md:grid-cols-2"
          (ngSubmit)="saveEdit()"
        >
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="etrip-date">Date</label>
            <input
              id="etrip-date"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="date"
              [(ngModel)]="ed.date"
              name="ed"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="etrip-type">Trip type</label>
            <select
              id="etrip-type"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              [(ngModel)]="ed.type"
              name="et"
            >
              <option value="BUSINESS">BUSINESS</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="etrip-from">Departure</label>
            <input
              id="etrip-from"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              [(ngModel)]="ed.from"
              name="ef"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="etrip-to">Destination</label>
            <input
              id="etrip-to"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              [(ngModel)]="ed.to"
              name="eto"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="etrip-dist">Distance (km)</label>
            <input
              id="etrip-dist"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="number"
              [(ngModel)]="ed.distance"
              name="edis"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="etrip-km">Odometer (km)</label>
            <input
              id="etrip-km"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="number"
              [(ngModel)]="ed.endKm"
              name="ekm"
              required
            />
          </div>
          <div class="space-x-2 md:col-span-2">
            <button type="submit" class="rounded bg-emerald-600 px-3 py-2">Save</button>
            <button type="button" class="rounded bg-slate-700 px-3 py-2" (click)="editing.set(null)">Cancel</button>
          </div>
        </form>
      }
    </section>
  `,
})
export class TripsPageComponent {
  private readonly api = inject(ApiService);
  readonly isLoggedIn = this.api.isLoggedIn;
  readonly cars = signal<Car[]>([]);
  readonly drivers = signal<Driver[]>([]);
  readonly trips = signal<Trip[]>([]);
  readonly validDrivers = computed(() => this.drivers().filter((d) => !d.isExpired));
  readonly error = signal('');
  form: {
    carId?: number;
    driverId?: number;
    date: string;
    type: 'BUSINESS' | 'PRIVATE';
    from: string;
    to: string;
    distance: number;
    endKm: number;
    createReturnTrip: boolean;
  } = {
    date: '',
    type: 'BUSINESS',
    from: '',
    to: '',
    distance: 0,
    endKm: 0,
    createReturnTrip: false,
  };
  readonly editing = signal<TripEditRow | null>(null);

  constructor() {
    this.loadAll();
    effect(() => {
      if (!this.api.isLoggedIn()) {
        this.editing.set(null);
      }
    });
  }

  loadAll(): void {
    this.api.get<Car[]>('/cars').subscribe({
      next: (cars) => {
        this.cars.set(cars);
        this.error.set('');
      },
      error: (e) => this.error.set(formatApiError(e, 'Failed to load cars')),
    });
    this.api.get<Driver[]>('/drivers').subscribe({
      next: (drivers) => {
        this.drivers.set(drivers);
        this.error.set('');
      },
      error: (e) => this.error.set(formatApiError(e, 'Failed to load drivers')),
    });
    this.loadTrips();
  }

  loadTrips(): void {
    this.api.get<Trip[]>('/trips').subscribe({
      next: (trips) => {
        this.trips.set(trips);
        this.error.set('');
      },
      error: (e) => this.error.set(formatApiError(e, 'Failed to load trips')),
    });
  }

  createTrip(): void {
    this.api.post('/trips', this.form, true).subscribe({
      next: () => {
        this.form = {
          date: '',
          type: 'BUSINESS',
          from: '',
          to: '',
          distance: 0,
          endKm: 0,
          createReturnTrip: false,
        };
        this.loadAll();
      },
      error: (e) => this.error.set(formatApiError(e, 'Could not save trip')),
    });
  }

  edit(t: Trip): void {
    this.error.set('');
    this.editing.set({
      id: t.id,
      date: String(t.date).slice(0, 10),
      type: t.type,
      from: t.from,
      to: t.to,
      distance: t.distance,
      endKm: t.endKm,
    });
  }

  saveEdit(): void {
    const e = this.editing();
    if (!e) return;
    this.api.put(`/trips/${e.id}`, e).subscribe({
      next: () => {
        this.editing.set(null);
        this.loadTrips();
      },
      error: (err) => this.error.set(formatApiError(err, 'Could not update trip')),
    });
  }

  remove(id: number): void {
    this.api.delete(`/trips/${id}`).subscribe({
      next: () => this.loadTrips(),
      error: (e) => this.error.set(formatApiError(e, 'Could not delete trip')),
    });
  }
}
