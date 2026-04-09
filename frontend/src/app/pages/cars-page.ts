import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { Car } from '../models';
import { formatApiError } from '../api-error.util';

@Component({
  selector: 'app-cars-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Cars</h1>
      <p class="text-sm text-slate-400">
        License plate, type, fuel, consumption (L/100 km), and starting odometer.
      </p>

      @if (error()) {
        <div class="rounded border border-rose-600/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
          {{ error() }}
        </div>
      }

      <div class="overflow-x-auto rounded-xl border border-slate-800">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-900 text-left text-slate-300">
            <tr>
              <th class="px-3 py-2">License plate</th>
              <th class="px-3 py-2">Type</th>
              <th class="px-3 py-2">Fuel</th>
              <th class="px-3 py-2">Consumption</th>
              <th class="px-3 py-2">Start km</th>
              @if (isLoggedIn()) {
                <th class="px-3 py-2">Actions</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (car of cars(); track car.id) {
              <tr class="border-t border-slate-800">
                <td class="px-3 py-2">{{ car.licensePlate }}</td>
                <td class="px-3 py-2">{{ car.type }}</td>
                <td class="px-3 py-2">{{ car.fuelType }}</td>
                <td class="px-3 py-2">{{ car.consumption }}</td>
                <td class="px-3 py-2">{{ car.startKm }}</td>
                @if (isLoggedIn()) {
                  <td class="space-x-2 px-3 py-2">
                    <button type="button" class="rounded bg-slate-700 px-2 py-1" (click)="edit(car)">Edit</button>
                    <button type="button" class="rounded bg-rose-700 px-2 py-1" (click)="remove(car.id)">Delete</button>
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
        (ngSubmit)="createCar()"
      >
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-40" for="car-plate">License plate</label>
          <input
            id="car-plate"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            [(ngModel)]="form.licensePlate"
            name="licensePlate"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-40" for="car-type">Type</label>
          <input
            id="car-type"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            [(ngModel)]="form.type"
            name="type"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-40" for="car-fuel">Fuel</label>
          <input
            id="car-fuel"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            [(ngModel)]="form.fuelType"
            name="fuelType"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-40" for="car-cons">Consumption (L/100 km)</label>
          <input
            id="car-cons"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            type="number"
            step="0.1"
            [(ngModel)]="form.consumption"
            name="consumption"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-40" for="car-km">Starting odometer (km)</label>
          <input
            id="car-km"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            type="number"
            [(ngModel)]="form.startKm"
            name="startKm"
            required
          />
        </div>
        <div class="md:col-span-2">
          <button
            type="submit"
            class="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500"
          >
            Add car
          </button>
        </div>
      </form>
      }

      @if (isLoggedIn() && editing(); as ec) {
        <form
          class="grid gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4 md:grid-cols-2"
          (ngSubmit)="saveEdit()"
        >
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-40" for="ecar-plate">License plate</label>
            <input
              id="ecar-plate"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              [(ngModel)]="ec.licensePlate"
              name="ePlate"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-40" for="ecar-type">Type</label>
            <input
              id="ecar-type"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              [(ngModel)]="ec.type"
              name="eType"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-40" for="ecar-fuel">Fuel</label>
            <input
              id="ecar-fuel"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              [(ngModel)]="ec.fuelType"
              name="eFuel"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-40" for="ecar-cons">Consumption (L/100 km)</label>
            <input
              id="ecar-cons"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="number"
              step="0.1"
              [(ngModel)]="ec.consumption"
              name="eCons"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-40" for="ecar-km">Starting odometer (km)</label>
            <input
              id="ecar-km"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="number"
              [(ngModel)]="ec.startKm"
              name="eKm"
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
export class CarsPageComponent {
  private readonly api = inject(ApiService);
  readonly isLoggedIn = this.api.isLoggedIn;
  readonly cars = signal<Car[]>([]);
  readonly error = signal('');
  form = { licensePlate: '', type: '', fuelType: '', consumption: 0, startKm: 0 };
  readonly editing = signal<Car | null>(null);

  constructor() {
    this.load();
    effect(() => {
      if (!this.api.isLoggedIn()) {
        this.editing.set(null);
      }
    });
  }

  load(): void {
    this.api.get<Car[]>('/cars').subscribe({
      next: (cars) => {
        this.cars.set(cars);
        this.error.set('');
      },
      error: (e) => this.error.set(formatApiError(e, 'Failed to load cars')),
    });
  }

  createCar(): void {
    this.api.post<Car>('/cars', this.form, true).subscribe({
      next: () => {
        this.form = { licensePlate: '', type: '', fuelType: '', consumption: 0, startKm: 0 };
        this.load();
      },
      error: (e) => this.error.set(formatApiError(e, 'Could not create car')),
    });
  }

  edit(car: Car): void {
    this.error.set('');
    this.editing.set({ ...car });
  }

  saveEdit(): void {
    const e = this.editing();
    if (!e) return;
    this.api.put<Car>(`/cars/${e.id}`, e).subscribe({
      next: () => {
        this.editing.set(null);
        this.load();
      },
      error: (err) => this.error.set(formatApiError(err, 'Could not update car')),
    });
  }

  remove(id: number): void {
    this.api.delete(`/cars/${id}`).subscribe({
      next: () => this.load(),
      error: (e) => this.error.set(formatApiError(e, 'Could not delete car')),
    });
  }
}
