import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page';
import { CarsPageComponent } from './pages/cars-page';
import { DriversPageComponent } from './pages/drivers-page';
import { TripsPageComponent } from './pages/trips-page';
import { ReportPageComponent } from './pages/report-page';
import { AuthPageComponent } from './pages/auth-page';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'cars', component: CarsPageComponent },
  { path: 'drivers', component: DriversPageComponent },
  { path: 'trips', component: TripsPageComponent },
  { path: 'report', component: ReportPageComponent },
  { path: 'auth', component: AuthPageComponent },
  { path: '**', redirectTo: '' },
];
