import { Component, computed, inject, effect, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ButtonComponent,
  HeadingComponent,
  StackComponent,
  TableComponent,
  TableTbodyComponent,
  TableTdComponent,
  TableTheadComponent,
  TableThComponent,
  TableTrComponent,
  TextComponent,
  ToastComponent,
} from '@recursica/adapter-angular-material';
import { worker } from '../../api/worker';
import {
  handlers,
  loadErrorHandlers,
  submitErrorHandlers,
} from '../../api/inventory';
import type { InventoryItem } from '../../data/inventory';
import { PrototypeModesService } from '../../modes/prototype-modes.service';
import { EditItemModalComponent } from './edit-item-modal';

// Maps each mode's id to the handler set it swaps into /api/inventory at
// runtime (worker.use / worker.resetHandlers) — see src/app/api/inventory/.
const HANDLERS_BY_MODE: Record<number, typeof handlers> = {
  1: handlers,
  2: loadErrorHandlers,
  3: submitErrorHandlers,
};

type LoadState =
  | { status: 'loading' }
  | { status: 'ok'; items: InventoryItem[] }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-demo-content',
  imports: [
    ButtonComponent,
    HeadingComponent,
    StackComponent,
    TableComponent,
    TableTbodyComponent,
    TableTdComponent,
    TableTheadComponent,
    TableThComponent,
    TableTrComponent,
    TextComponent,
    ToastComponent,
    EditItemModalComponent,
  ],
  templateUrl: './demo-content.html',
})
export class DemoContentComponent {
  private readonly modesService = inject(PrototypeModesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly state = signal<LoadState>({ status: 'loading' });

  private readonly queryParamMap = toSignal(this.route.queryParamMap);
  readonly itemId = computed(() => this.queryParamMap()?.get('item') ?? null);

  readonly rows = computed(() => {
    const s = this.state();
    return s.status === 'ok'
      ? [...s.items].sort((a, b) => a.name.localeCompare(b.name))
      : [];
  });

  readonly errorMessage = computed(() => {
    const s = this.state();
    return s.status === 'error' ? s.message : null;
  });

  readonly selectedItem = computed(() =>
    this.rows().find((item) => item.id === this.itemId()),
  );

  constructor() {
    // The active mode's handlers stay swapped in for as long as it's
    // selected, since both the initial load (GET) and a later save (PATCH)
    // need to see the same scenario.
    effect((onCleanup) => {
      const mode = this.modesService.activeMode();
      if (!mode) return;
      worker.use(...HANDLERS_BY_MODE[mode.id]);
      this.load();
      onCleanup(() => worker.resetHandlers());
    });
  }

  load(): void {
    this.state.set({ status: 'loading' });
    fetch('/api/inventory')
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
        return body as InventoryItem[];
      })
      .then((items) => this.state.set({ status: 'ok', items }))
      .catch((err: unknown) =>
        this.state.set({
          status: 'error',
          message: err instanceof Error ? err.message : String(err),
        }),
      );
  }

  openItem(id: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { item: id },
      queryParamsHandling: 'merge',
    });
  }

  closeItem(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { item: null },
      queryParamsHandling: 'merge',
    });
  }

  onSaved(): void {
    this.closeItem();
    this.load();
  }
}
