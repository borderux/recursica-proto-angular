import { Routes } from '@angular/router';
import { discoveredPrototypes } from './prototypes/registry.generated';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'usage-info',
    loadComponent: () =>
      import('./usage-info/usage-info').then((m) => m.UsageInfoComponent),
  },
  ...discoveredPrototypes.map((prototype) => ({
    path: `prototypes/${prototype.slug}`,
    loadComponent: prototype.loadComponent,
  })),
  // Catches unmatched paths (e.g. bare `/prototypes`, typos) — without this,
  // Router throws NG04002 and blanks the page instead of rendering anything.
  { path: '**', redirectTo: '' },
];
