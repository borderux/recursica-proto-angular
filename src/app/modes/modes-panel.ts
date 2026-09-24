import { Component, inject } from '@angular/core';
import {
  ButtonComponent,
  PanelComponent,
  StackComponent,
  TextComponent,
} from '@recursica/adapter-angular-material';
import { PrototypeModesService } from './prototype-modes.service';

@Component({
  selector: 'app-modes-panel',
  imports: [ButtonComponent, PanelComponent, StackComponent, TextComponent],
  templateUrl: './modes-panel.html',
  styleUrl: './modes-panel.scss',
})
export class ModesPanelComponent {
  protected readonly modesService = inject(PrototypeModesService);

  protected onOpenedChange(opened: boolean): void {
    if (!opened) {
      this.modesService.closePicker();
    }
  }
}
