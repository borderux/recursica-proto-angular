import { Component } from '@angular/core';
import { PrototypeComponent } from '../../stories/prototype';
import { DemoContentComponent } from './demo-content';
import { stories } from './stories';

export const meta = {
  title: 'Demo Prototype',
  description:
    "Inventory dashboard for an AI infrastructure company's GPUs and servers: a table, a click-to-edit modal, and stories for a failed load or a failed save.",
};

@Component({
  selector: 'app-demo',
  imports: [PrototypeComponent, DemoContentComponent],
  template: `
    <app-prototype [stories]="stories">
      <app-demo-content />
    </app-prototype>
  `,
})
export default class DemoPrototypeComponent {
  protected readonly stories = stories;
}
