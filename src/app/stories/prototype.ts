import { Component, effect, inject, input } from '@angular/core';
import { StoriesPanelComponent } from './stories-panel';
import type { Story } from './story';
import { PrototypeStoriesService } from './prototype-stories.service';

/**
 * Every prototype's page renders its content through this wrapper — it's
 * what makes `?story`/`?stories` open the picker panel even for a prototype
 * with no stories defined. See AGENT.md's Stories section.
 */
@Component({
  selector: 'app-prototype',
  imports: [StoriesPanelComponent],
  providers: [PrototypeStoriesService],
  templateUrl: './prototype.html',
})
export class PrototypeComponent {
  readonly stories = input<Story[]>([]);

  private readonly storiesService = inject(PrototypeStoriesService);

  constructor() {
    effect(() => this.storiesService.setStories(this.stories()));
  }
}
