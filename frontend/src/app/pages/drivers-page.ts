import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { ApiService } from '../api.service';
import { Driver } from '../models';
import { formatApiError } from '../api-error.util';

@Component({
  selector: 'app-drivers-page',
  standalone: true,
  imports: [FormsModule, NgClass, DatePipe],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Drivers</h1>

      @if (error()) {
        <div class="rounded border border-rose-600/40 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">
          {{ error() }}
        </div>
      }

      <div class="overflow-x-auto rounded-xl border border-slate-800">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-900 text-left text-slate-300">
            <tr>
              <th class="px-3 py-2">Name</th>
              <th class="px-3 py-2">Birth date</th>
              <th class="px-3 py-2">Address</th>
              <th class="px-3 py-2">License</th>
              <th class="px-3 py-2">Expires</th>
              @if (isLoggedIn()) {
                <th class="px-3 py-2">Actions</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (d of drivers(); track d.id) {
              <tr
                class="border-t border-slate-800"
                [ngClass]="d.isExpired ? 'bg-rose-900/30 text-rose-200' : ''"
              >
                <td class="px-3 py-2">{{ d.name }}</td>
                <td class="px-3 py-2">{{ d.birthDate | date: 'yyyy-MM-dd' }}</td>
                <td class="px-3 py-2">{{ d.address }}</td>
                <td class="px-3 py-2">{{ d.licenseNumber }}</td>
                <td class="px-3 py-2">{{ d.licenseExpiry | date: 'yyyy-MM-dd' }}</td>
                @if (isLoggedIn()) {
                  <td class="space-x-2 px-3 py-2">
                    <button type="button" class="rounded bg-slate-700 px-2 py-1" (click)="edit(d)">Edit</button>
                    <button type="button" class="rounded bg-rose-700 px-2 py-1" (click)="remove(d.id)">Delete</button>
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
        (ngSubmit)="createDriver()"
      >
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="drv-name">Name</label>
          <input
            id="drv-name"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            [(ngModel)]="form.name"
            name="name"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="drv-birth">Birth date</label>
          <input
            id="drv-birth"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            type="date"
            [(ngModel)]="form.birthDate"
            name="birthDate"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3 md:col-span-2">
          <label class="shrink-0 pt-2 text-sm text-slate-300 sm:w-36" for="drv-address">Address</label>
          <input
            id="drv-address"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            [(ngModel)]="form.address"
            name="address"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="drv-license">License number</label>
          <input
            id="drv-license"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            [(ngModel)]="form.licenseNumber"
            name="licenseNumber"
            required
          />
        </div>
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="drv-expiry">License expires</label>
          <input
            id="drv-expiry"
            class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
            type="date"
            [(ngModel)]="form.licenseExpiry"
            name="licenseExpiry"
            required
          />
        </div>
        <div class="md:col-span-2">
          <button
            type="submit"
            class="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500"
          >
            Add driver
          </button>
        </div>
      </form>
      }

      @if (isLoggedIn() && editing(); as ed) {
        <form
          class="grid gap-3 rounded-xl border border-slate-700 bg-slate-900/60 p-4 md:grid-cols-2"
          (ngSubmit)="saveEdit()"
        >
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="edrv-name">Name</label>
            <input
              id="edrv-name"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              [(ngModel)]="ed.name"
              name="en"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="edrv-birth">Birth date</label>
            <input
              id="edrv-birth"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="date"
              [(ngModel)]="ed.birthDate"
              name="eb"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3 md:col-span-2">
            <label class="shrink-0 pt-2 text-sm text-slate-300 sm:w-36" for="edrv-address">Address</label>
            <input
              id="edrv-address"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              [(ngModel)]="ed.address"
              name="ea"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="edrv-lic">License number</label>
            <input
              id="edrv-lic"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              [(ngModel)]="ed.licenseNumber"
              name="eln"
              required
            />
          </div>
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label class="shrink-0 text-sm text-slate-300 sm:w-36" for="edrv-exp">License expires</label>
            <input
              id="edrv-exp"
              class="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2"
              type="date"
              [(ngModel)]="ed.licenseExpiry"
              name="ele"
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
export class DriversPageComponent {
  private readonly api = inject(ApiService);
  readonly isLoggedIn = this.api.isLoggedIn;
  readonly drivers = signal<Driver[]>([]);
  readonly error = signal('');
  form = { name: '', birthDate: '', address: '', licenseNumber: '', licenseExpiry: '' };
  readonly editing = signal<Driver | null>(null);

  constructor() {
    this.load();
    effect(() => {
      if (!this.api.isLoggedIn()) {
        this.editing.set(null);
      }
    });
  }

  load(): void {
    this.api.get<Driver[]>('/drivers').subscribe({
      next: (drivers) => {
        this.drivers.set(drivers);
        this.error.set('');
      },
      error: (e) => this.error.set(formatApiError(e, 'Failed to load drivers')),
    });
  }

  createDriver(): void {
    this.api.post('/drivers', this.form, true).subscribe({
      next: () => {
        this.form = { name: '', birthDate: '', address: '', licenseNumber: '', licenseExpiry: '' };
        this.load();
      },
      error: (e) => this.error.set(formatApiError(e, 'Could not create driver')),
    });
  }

  edit(driver: Driver): void {
    this.error.set('');
    this.editing.set({ ...driver });
  }

  saveEdit(): void {
    const e = this.editing();
    if (!e) return;
    this.api.put(`/drivers/${e.id}`, e).subscribe({
      next: () => {
        this.editing.set(null);
        this.load();
      },
      error: (err) => this.error.set(formatApiError(err, 'Could not update driver')),
    });
  }

  remove(id: number): void {
    this.api.delete(`/drivers/${id}`).subscribe({
      next: () => this.load(),
      error: (e) => this.error.set(formatApiError(e, 'Could not delete driver')),
    });
  }
}
