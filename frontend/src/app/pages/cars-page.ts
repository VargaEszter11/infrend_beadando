import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ApiService } from '../api.service';
import { Car } from '../models';

@Component({
  selector: 'app-cars-page',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Cars</h1>
      <p class="text-sm text-slate-400">
        License plate, type, fuel, consumption (L/100 km), and starting odometer.
      </p>

      <form
        class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-2"
        (ngSubmit)="createCar()"
      >
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="form.licensePlate"
          name="licensePlate"
          placeholder="License plate"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="form.type"
          name="type"
          placeholder="Type"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="form.fuelType"
          name="fuelType"
          placeholder="Fuel"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="number"
          step="0.1"
          [(ngModel)]="form.consumption"
          name="consumption"
          placeholder="Consumption (L/100 km)"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="number"
          [(ngModel)]="form.startKm"
          name="startKm"
          placeholder="Starting odometer (km)"
          required
        />
        <button class="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500">
          Add car
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
              <th class="px-3 py-2">License plate</th>
              <th class="px-3 py-2">Type</th>
              <th class="px-3 py-2">Fuel</th>
              <th class="px-3 py-2">Consumption</th>
              <th class="px-3 py-2">Start km</th>
              <th class="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let car of cars" class="border-t border-slate-800">
              <td class="px-3 py-2">{{ car.licensePlate }}</td>
              <td class="px-3 py-2">{{ car.type }}</td>
              <td class="px-3 py-2">{{ car.fuelType }}</td>
              <td class="px-3 py-2">{{ car.consumption }}</td>
              <td class="px-3 py-2">{{ car.startKm }}</td>
              <td class="space-x-2 px-3 py-2">
                <button class="rounded bg-slate-700 px-2 py-1" (click)="edit(car)">Edit</button>
                <button class="rounded bg-rose-700 px-2 py-1" (click)="remove(car.id)">Delete</button>
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
          [(ngModel)]="editing.licensePlate"
          name="ePlate"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="editing.type"
          name="eType"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="editing.fuelType"
          name="eFuel"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="number"
          step="0.1"
          [(ngModel)]="editing.consumption"
          name="eCons"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="number"
          [(ngModel)]="editing.startKm"
          name="eKm"
          required
        />
        <div class="space-x-2">
          <button class="rounded bg-emerald-600 px-3 py-2">Save</button>
          <button type="button" class="rounded bg-slate-700 px-3 py-2" (click)="editing = null">Cancel</button>
        </div>
      </form>
    </section>
  `,
})
export class CarsPageComponent {
  cars: Car[] = [];
  error = '';
  form = { licensePlate: '', type: '', fuelType: '', consumption: 0, startKm: 0 };
  editing: Car | null = null;

  constructor(private readonly api: ApiService) {
    this.load();
  }

  load(): void {
    this.api.get<Car[]>('/cars').subscribe({
      next: (cars) => {
        this.cars = cars;
        this.error = '';
      },
      error: (e) => (this.error = e.error?.error ?? 'Failed to load cars'),
    });
  }

  createCar(): void {
    this.api.post<Car>('/cars', this.form, true).subscribe({
      next: () => {
        this.form = { licensePlate: '', type: '', fuelType: '', consumption: 0, startKm: 0 };
        this.load();
      },
      error: (e) => (this.error = e.error?.error ?? 'Could not create car'),
    });
  }

  edit(car: Car): void {
    this.editing = { ...car };
  }

  saveEdit(): void {
    if (!this.editing) return;
    this.api.put<Car>(`/cars/${this.editing.id}`, this.editing).subscribe({
      next: () => {
        this.editing = null;
        this.load();
      },
      error: (e) => (this.error = e.error?.error ?? 'Could not update car'),
    });
  }

  remove(id: number): void {
    this.api.delete(`/cars/${id}`).subscribe({
      next: () => this.load(),
      error: (e) => (this.error = e.error?.error ?? 'Could not delete car'),
    });
  }
}
