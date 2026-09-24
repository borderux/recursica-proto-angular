import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import type { Mode } from './mode';

/**
 * One instance per `<app-prototype>` (component-provided, not root) — each
 * prototype page owns its own modes and its own slice of the `?mode`/`?modes`
 * URL convention, the same way `<Prototype>` scoped a React context per page.
 */
@Injectable()
export class PrototypeModesService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly modesSignal = signal<Mode[]>([]);
  readonly modes = this.modesSignal.asReadonly();

  private readonly queryParamMap = toSignal(this.route.queryParamMap);

  setModes(modes: Mode[]): void {
    this.modesSignal.set(modes);
  }

  readonly activeMode = computed<Mode | undefined>(() => {
    const modes = this.modesSignal();
    if (modes.length === 0) return undefined;
    const raw = this.queryParamMap()?.get('mode');
    const id =
      raw === null || raw === undefined || raw === '' ? NaN : Number(raw);
    return modes.find((mode) => mode.id === id) ?? modes[0];
  });

  readonly isPickerOpen = computed<boolean>(() => {
    const params = this.queryParamMap();
    if (!params) return false;
    return params.has('modes') || params.get('mode') === '';
  });

  selectMode(id: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: id, modes: null },
      queryParamsHandling: 'merge',
    });
  }

  closePicker(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { mode: null, modes: null },
      queryParamsHandling: 'merge',
    });
  }
}
