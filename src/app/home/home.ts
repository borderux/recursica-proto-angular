import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ButtonComponent,
  ContainerComponent,
  HeadingComponent,
  LayerComponent,
  StackComponent,
  TableComponent,
  TableTbodyComponent,
  TableTdComponent,
  TableTheadComponent,
  TableThComponent,
  TableTrComponent,
  TextComponent,
} from '@recursica/adapter-angular-material';
import { discoveredPrototypes } from '../prototypes/registry.generated';

interface PrototypeSummary {
  slug: string;
  title: string;
  description?: string;
}

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    ButtonComponent,
    ContainerComponent,
    HeadingComponent,
    LayerComponent,
    StackComponent,
    TableComponent,
    TableTheadComponent,
    TableTbodyComponent,
    TableTrComponent,
    TableThComponent,
    TableTdComponent,
    TextComponent,
  ],
  templateUrl: './home.html',
})
export class HomeComponent {
  private readonly router = inject(Router);

  protected readonly prototypes = signal<PrototypeSummary[]>([]);

  constructor() {
    Promise.all(
      discoveredPrototypes.map(async (prototype) => {
        const meta = await prototype.loadMeta();
        return {
          slug: prototype.slug,
          title: meta?.title ?? prototype.slug,
          description: meta?.description,
        };
      }),
    ).then((summaries) => {
      summaries.sort((a, b) => a.title.localeCompare(b.title));
      this.prototypes.set(summaries);
    });
  }

  protected goToUsageInfo(): void {
    this.router.navigate(['/usage-info']);
  }
}
