import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ButtonComponent,
  ContainerComponent,
  HeadingComponent,
  StackComponent,
  TextComponent,
} from '@recursica/adapter-angular-material';
import { discoveredPrototypes } from '../prototypes/registry.generated';

@Component({
  selector: 'app-usage-info',
  imports: [
    RouterLink,
    ButtonComponent,
    ContainerComponent,
    HeadingComponent,
    StackComponent,
    TextComponent,
  ],
  templateUrl: './usage-info.html',
})
export class UsageInfoComponent {
  private readonly router = inject(Router);

  // Same prototype Home's list would show first — alphabetically by title —
  // so the "open the stories panel" button works once more prototypes exist
  // instead of hard-coding one.
  protected readonly firstPrototypeSlug = signal<string | undefined>(undefined);

  constructor() {
    Promise.all(
      discoveredPrototypes.map(async (prototype) => {
        const meta = await prototype.loadMeta();
        return { slug: prototype.slug, title: meta?.title ?? prototype.slug };
      }),
    ).then((summaries) => {
      summaries.sort((a, b) => a.title.localeCompare(b.title));
      this.firstPrototypeSlug.set(summaries[0]?.slug);
    });
  }

  protected openStoriesPanel(): void {
    const slug = this.firstPrototypeSlug();
    if (!slug) return;
    this.router.navigate(['/prototypes', slug], {
      queryParams: { stories: '' },
    });
  }
}
