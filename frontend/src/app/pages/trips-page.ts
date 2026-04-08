import { Component } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Car, Driver, Trip } from '../models';

@Component({
  selector: 'app-trips-page',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, DatePipe],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Trips</h1>

      <form
        class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-2"
        (ngSubmit)="createTrip()"
      >
        <select
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="form.carId"
          name="carId"
          required
        >
          <option [ngValue]="undefined">Select car</option>
          <option *ngFor="let c of cars" [ngValue]="c.id">{{ c.licensePlate }} — {{ c.type }}</option>
        </select>
        <select
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="form.driverId"
          name="driverId"
          required
        >
          <option [ngValue]="undefined">Select driver</option>
          <option *ngFor="let d of validDrivers" [ngValue]="d.id">{{ d.name }}</option>
        </select>
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="date"
          [(ngModel)]="form.date"
          name="date"
          required
        />
        <select
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="form.type"
          name="type"
          required
        >
          <option value="BUSINESS">Business</option>
          <option value="PRIVATE">Private</option>
        </select>
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="form.from"
          name="from"
          placeholder="Departure"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="form.to"
          name="to"
          placeholder="Destination"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="number"
          step="0.1"
          [(ngModel)]="form.distance"
          name="distance"
          placeholder="Distance (km)"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="number"
          [(ngModel)]="form.endKm"
          name="endKm"
          placeholder="New odometer (km)"
          required
        />
        <label class="inline-flex items-center gap-2 text-sm text-slate-300 md:col-span-2">
          <input type="checkbox" [(ngModel)]="form.createReturnTrip" name="createReturnTrip" />
          Register return trip automatically
        </label>
        <button class="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 md:col-span-2">
          Save trip
        </button>
      </form>

      <div
        *ngIf="error"
        class="rounded border border-rose-600/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300"
      >
        {{ error }}
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
              <th class="px-3 py-2">Car</th>
              <th class="px-3 py-2">Driver</th>
              <th class="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of trips" class="border-t border-slate-800">
              <td class="px-3 py-2">{{ t.date | date: 'yyyy-MM-dd' }}</td>
              <td class="px-3 py-2">{{ t.type }}</td>
              <td class="px-3 py-2">{{ t.from }} ? {{ t.to }}</td>
              <td class="px-3 py-2">{{ t.distance }}</td>
              <td class="px-3 py-2">{{ t.endKm }}</td>
              <td class="px-3 py-2">{{ t.car.licensePlate }}</td>
              <td class="px-3 py-2">{{ t.driver.name }}</td>
              <td class="space-x-2 px-3 py-2">
                <button class="rounded bg-slate-700 px-2 py-1" (click)="edit(t)">Edit</button>
                <button class="rounded bg-rose-700 px-2 py-1" (click)="remove(t.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <form
        *ngIf="editing"
        class="grid gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4 md:grid-cols-2"
        (ngSubmit)="saveEdit()"
      >
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="date"
          [(ngModel)]="editing.date"
          name="ed"
          required
        />
        <select
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="editing.type"
          name="et"
        >
          <option value="BUSINESS">BUSINESS</option>
          <option value="PRIVATE">PRIVATE</option>
        </select>
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="editing.from"
          name="ef"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="editing.to"
          name="eto"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="number"
          [(ngModel)]="editing.distance"
          name="edis"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="number"
          [(ngModel)]="editing.endKm"
          name="ekm"
          required
        />
        <div class="space-x-2 md:col-span-2">
          <button class="rounded bg-emerald-600 px-3 py-2">Save</button>
          <button type="button" class="rounded bg-slate-700 px-3 py-2" (click)="editing = null">Cancel</button>
        </div>
      </form>
    </section>
  `,
})
export class TripsPageComponent {
  cars: Car[] = [];
  drivers: Driver[] = [];
  trips: Trip[] = [];
  error = '';
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
  editing: {
    id: number;
    date: string;
    type: string;
    from: string;
    to: string;
    distance: number;
    endKm: number;
  } | null = null;

  get validDrivers(): Driver[] {
    return this.drivers.filter((d) => !d.isExpired);
  }

  constructor(private readonly api: ApiService) {
    this.loadAll();
  }

  loadAll(): void {
    this.api.get<Car[]>('/cars').subscribe({ next: (r) => (this.cars = r) });
    this.api.get<Driver[]>('/drivers').subscribe({ next: (r) => (this.drivers = r) });
    this.loadTrips();
  }

  loadTrips(): void {
    this.api.get<Trip[]>('/trips').subscribe({
      next: (trips) => {
        this.trips = trips;
        this.error = '';
      },
      error: (e) => (this.error = e.error?.error ?? 'Failed to load trips'),
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
        this.loadTrips();
      },
      error: (e) => (this.error = e.error?.error ?? 'Could not save trip'),
    });
  }

  edit(t: Trip): void {
    this.editing = {
      id: t.id,
      date: String(t.date).slice(0, 10),
      type: t.type,
      from: t.from,
      to: t.to,
      distance: t.distance,
      endKm: t.endKm,
    };
  }

  saveEdit(): void {
    if (!this.editing) return;
    this.api.put(`/trips/${this.editing.id}`, this.editing).subscribe({
      next: () => {
        this.editing = null;
        this.loadTrips();
      },
      error: (e) => (this.error = e.error?.error ?? 'Could not update trip'),
    });
  }

  remove(id: number): void {
    this.api.delete(`/trips/${id}`).subscribe({
      next: () => this.loadTrips(),
      error: (e) => (this.error = e.error?.error ?? 'Could not delete trip'),
    });
  }
}
