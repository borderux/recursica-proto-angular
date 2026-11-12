import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import type { Story } from './story';

/**
 * One instance per `<app-prototype>` (component-provided, not root) — each
 * prototype page owns its own stories and its own slice of the `?story`/`?stories`
 * URL convention, the same way `<Prototype>` scoped a React context per page.
 */
@Injectable()
export class PrototypeStoriesService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly storiesSignal = signal<Story[]>([]);
  readonly stories = this.storiesSignal.asReadonly();

  private readonly queryParamMap = toSignal(this.route.queryParamMap);

  setStories(stories: Story[]): void {
    this.storiesSignal.set(stories);
  }

  readonly activeStory = computed<Story | undefined>(() => {
    const stories = this.storiesSignal();
    if (stories.length === 0) return undefined;
    const raw = this.queryParamMap()?.get('story');
    const id =
      raw === null || raw === undefined || raw === '' ? NaN : Number(raw);
    return stories.find((story) => story.id === id) ?? stories[0];
  });

  readonly isPickerOpen = computed<boolean>(() => {
    const params = this.queryParamMap();
    if (!params) return false;
    return params.has('stories') || params.get('story') === '';
  });

  selectStory(id: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { story: id, stories: null },
      queryParamsHandling: 'merge',
    });
  }

  closePicker(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { story: null, stories: null },
      queryParamsHandling: 'merge',
    });
  }
}
