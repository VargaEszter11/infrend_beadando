import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ApiService } from '../api.service';
import { Driver } from '../models';

@Component({
  selector: 'app-drivers-page',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, NgClass, DatePipe],
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Drivers</h1>

      <form
        class="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-2"
        (ngSubmit)="createDriver()"
      >
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="form.name"
          name="name"
          placeholder="Name"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="date"
          [(ngModel)]="form.birthDate"
          name="birthDate"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2 md:col-span-2"
          [(ngModel)]="form.address"
          name="address"
          placeholder="Address"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="form.licenseNumber"
          name="licenseNumber"
          placeholder="License number"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="date"
          [(ngModel)]="form.licenseExpiry"
          name="licenseExpiry"
          required
        />
        <button class="rounded bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500">
          Add driver
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
              <th class="px-3 py-2">Name</th>
              <th class="px-3 py-2">Birth date</th>
              <th class="px-3 py-2">Address</th>
              <th class="px-3 py-2">License</th>
              <th class="px-3 py-2">Expires</th>
              <th class="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let d of drivers"
              class="border-t border-slate-800"
              [ngClass]="d.isExpired ? 'bg-rose-900/30 text-rose-200' : ''"
            >
              <td class="px-3 py-2">{{ d.name }}</td>
              <td class="px-3 py-2">{{ d.birthDate | date: 'yyyy-MM-dd' }}</td>
              <td class="px-3 py-2">{{ d.address }}</td>
              <td class="px-3 py-2">{{ d.licenseNumber }}</td>
              <td class="px-3 py-2">{{ d.licenseExpiry | date: 'yyyy-MM-dd' }}</td>
              <td class="space-x-2 px-3 py-2">
                <button class="rounded bg-slate-700 px-2 py-1" (click)="edit(d)">Edit</button>
                <button class="rounded bg-rose-700 px-2 py-1" (click)="remove(d.id)">Delete</button>
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
          [(ngModel)]="editing.name"
          name="en"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="date"
          [(ngModel)]="editing.birthDate"
          name="eb"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2 md:col-span-2"
          [(ngModel)]="editing.address"
          name="ea"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          [(ngModel)]="editing.licenseNumber"
          name="eln"
          required
        />
        <input
          class="rounded border border-slate-700 bg-slate-950 px-3 py-2"
          type="date"
          [(ngModel)]="editing.licenseExpiry"
          name="ele"
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
export class DriversPageComponent {
  drivers: Driver[] = [];
  error = '';
  form = { name: '', birthDate: '', address: '', licenseNumber: '', licenseExpiry: '' };
  editing: Driver | null = null;

  constructor(private readonly api: ApiService) {
    this.load();
  }

  load(): void {
    this.api.get<Driver[]>('/drivers').subscribe({
      next: (drivers) => {
        this.drivers = drivers;
        this.error = '';
      },
      error: (e) => (this.error = e.error?.error ?? 'Failed to load drivers'),
    });
  }

  createDriver(): void {
    this.api.post('/drivers', this.form, true).subscribe({
      next: () => {
        this.form = { name: '', birthDate: '', address: '', licenseNumber: '', licenseExpiry: '' };
        this.load();
      },
      error: (e) => (this.error = e.error?.error ?? 'Could not create driver'),
    });
  }

  edit(driver: Driver): void {
    this.editing = { ...driver };
  }

  saveEdit(): void {
    if (!this.editing) return;
    this.api.put(`/drivers/${this.editing.id}`, this.editing).subscribe({
      next: () => {
        this.editing = null;
        this.load();
      },
      error: (e) => (this.error = e.error?.error ?? 'Could not update driver'),
    });
  }

  remove(id: number): void {
    this.api.delete(`/drivers/${id}`).subscribe({
      next: () => this.load(),
      error: (e) => (this.error = e.error?.error ?? 'Could not delete driver'),
    });
  }
}
