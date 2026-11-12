import { Component, inject } from '@angular/core';
import {
  ButtonComponent,
  PanelComponent,
  StackComponent,
  TextComponent,
} from '@recursica/adapter-angular-material';
import { PrototypeStoriesService } from './prototype-stories.service';

@Component({
  selector: 'app-stories-panel',
  imports: [ButtonComponent, PanelComponent, StackComponent, TextComponent],
  templateUrl: './stories-panel.html',
  styleUrl: './stories-panel.scss',
})
export class StoriesPanelComponent {
  protected readonly storiesService = inject(PrototypeStoriesService);

  protected onOpenedChange(opened: boolean): void {
    if (!opened) {
      this.storiesService.closePicker();
    }
  }
}
