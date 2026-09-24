import { Component, effect, inject, input } from '@angular/core';
import { ModesPanelComponent } from './modes-panel';
import type { Mode } from './mode';
import { PrototypeModesService } from './prototype-modes.service';

/**
 * Every prototype's page renders its content through this wrapper — it's
 * what makes `?mode`/`?modes` open the picker panel even for a prototype
 * with no modes defined. See AGENT.md's Modes section.
 */
@Component({
  selector: 'app-prototype',
  imports: [ModesPanelComponent],
  providers: [PrototypeModesService],
  templateUrl: './prototype.html',
})
export class PrototypeComponent {
  readonly modes = input<Mode[]>([]);

  private readonly modesService = inject(PrototypeModesService);

  constructor() {
    effect(() => this.modesService.setModes(this.modes()));
  }
}
