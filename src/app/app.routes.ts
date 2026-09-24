import { Routes } from '@angular/router';
import { discoveredPrototypes } from './prototypes/registry.generated';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.HomeComponent),
  },
  ...discoveredPrototypes.map((prototype) => ({
    path: `prototypes/${prototype.slug}`,
    loadComponent: prototype.loadComponent,
  })),
];
