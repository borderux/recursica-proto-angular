import {
  Component,
  OnInit,
  afterNextRender,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ButtonComponent,
  DropdownComponent,
  FormControlWrapperComponent,
  ModalComponent,
  ModalFooterComponent,
  NumberInputComponent,
  StackComponent,
  TextAreaComponent,
  TextFieldComponent,
  ToastComponent,
} from '@recursica/adapter-angular-material';
import {
  ASSET_STATUSES,
  ASSET_TYPES,
  DATACENTERS,
  type AssetStatus,
  type AssetType,
  type InventoryItem,
} from '../../data/inventory';

interface EditItemForm {
  name: FormControl<string>;
  type: FormControl<AssetType>;
  model: FormControl<string>;
  datacenter: FormControl<string>;
  status: FormControl<AssetStatus>;
  utilization: FormControl<number>;
  notes: FormControl<string>;
}

@Component({
  selector: 'app-edit-item-modal',
  imports: [
    ButtonComponent,
    DropdownComponent,
    FormControlWrapperComponent,
    ModalComponent,
    ModalFooterComponent,
    NumberInputComponent,
    StackComponent,
    TextAreaComponent,
    TextFieldComponent,
    ToastComponent,
  ],
  templateUrl: './edit-item-modal.html',
})
export class EditItemModalComponent implements OnInit {
  readonly item = input.required<InventoryItem>();
  readonly closed = output<void>();
  readonly saved = output<void>();

  readonly ASSET_TYPES = ASSET_TYPES;
  readonly DATACENTERS = DATACENTERS;
  readonly ASSET_STATUSES = ASSET_STATUSES;

  readonly submitError = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  /**
   * `rec-modal`'s `openDialog()` reads a `@ViewChild`-queried `TemplateRef`
   * that only resolves after this component's first render — opening on the
   * very first change-detection pass (i.e. `[opened]="true"` from creation)
   * crashes inside the adapter's own `MatDialog.open()` call. Deferring to
   * one tick after render sidesteps it without touching the adapter.
   */
  readonly modalOpened = signal(false);

  form!: FormGroup<EditItemForm>;

  constructor() {
    afterNextRender(() => this.modalOpened.set(true));
  }

  ngOnInit(): void {
    const item = this.item();
    this.form = new FormGroup<EditItemForm>({
      name: new FormControl(item.name, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      type: new FormControl<AssetType>(item.type, { nonNullable: true }),
      model: new FormControl(item.model, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      datacenter: new FormControl(item.datacenter, { nonNullable: true }),
      status: new FormControl<AssetStatus>(item.status, { nonNullable: true }),
      utilization: new FormControl(item.utilization, {
        nonNullable: true,
        validators: [Validators.min(0), Validators.max(100)],
      }),
      notes: new FormControl(item.notes, { nonNullable: true }),
    });
  }

  nameError(): string | undefined {
    const c = this.form.controls.name;
    return c.invalid && c.touched ? 'Name is required' : undefined;
  }

  modelError(): string | undefined {
    const c = this.form.controls.model;
    return c.invalid && c.touched ? 'Model is required' : undefined;
  }

  utilizationError(): string | undefined {
    const c = this.form.controls.utilization;
    if (!c.touched || c.valid) return undefined;
    if (c.hasError('min')) return 'Must be at least 0';
    if (c.hasError('max')) return 'Must be at most 100';
    return undefined;
  }

  // No component in this adapter version registers NG_VALUE_ACCESSOR yet
  // (confirmed: no NG_VALUE_ACCESSOR provider anywhere in the compiled
  // bundle), despite ARCHITECTURE.md's claim that `[formControl]` binds
  // directly — [formControl] throws NG01203 at runtime. Wiring value/
  // valueChange by hand instead, same shape as the React reference's
  // Controller render props.
  onNameChange(value: string): void {
    this.form.controls.name.setValue(value);
  }

  onTypeChange(value: string | null): void {
    if (value) this.form.controls.type.setValue(value as AssetType);
  }

  onModelChange(value: string): void {
    this.form.controls.model.setValue(value);
  }

  onDatacenterChange(value: string | null): void {
    this.form.controls.datacenter.setValue(value ?? '');
  }

  onStatusChange(value: string | null): void {
    if (value) this.form.controls.status.setValue(value as AssetStatus);
  }

  onUtilizationChange(value: number | undefined): void {
    this.form.controls.utilization.setValue(value ?? 0);
  }

  onNotesChange(value: string): void {
    this.form.controls.notes.setValue(value);
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.submitError.set(null);
    this.isSubmitting.set(true);
    try {
      const res = await fetch(`/api/inventory/${this.item().id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.form.getRawValue()),
      });
      const body: unknown = await res.json();
      if (!res.ok) {
        const message =
          typeof body === 'object' && body !== null && 'error' in body
            ? String((body as { error: unknown }).error)
            : `HTTP ${res.status}`;
        throw new Error(message);
      }
      this.saved.emit();
    } catch (err) {
      this.submitError.set(err instanceof Error ? err.message : String(err));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.closed.emit();
  }
}
