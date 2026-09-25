import { Component } from '@angular/core';
import { PrototypeComponent } from '../../modes/prototype';
import { DemoContentComponent } from './demo-content';
import { modes } from './modes';

export const meta = {
  title: 'Demo Prototype',
  description:
    "Inventory dashboard for an AI infrastructure company's GPUs and servers: a table, a click-to-edit modal, and modes for a failed load or a failed save.",
};

@Component({
  selector: 'app-demo',
  imports: [PrototypeComponent, DemoContentComponent],
  template: `
    <app-prototype [modes]="modes">
      <app-demo-content />
    </app-prototype>
  `,
})
export default class DemoPrototypeComponent {
  protected readonly modes = modes;
}
