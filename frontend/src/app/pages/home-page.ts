import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <section class="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <h1 class="text-2xl font-semibold">Company trip log</h1>
      <p class="mt-2 text-slate-400">
        Use the navigation to open cars, drivers, trips, and the monthly report.
      </p>
    </section>
  `,
})
export class HomePageComponent {}
