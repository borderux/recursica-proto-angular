import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
  Button,
  Container,
  Dropdown,
  Heading,
  Modal,
  NumberInput,
  Stack,
  Table,
  TextArea,
  TextField,
  Toast,
  Text,
} from "@recursica/adapter-mantine-v8";
import type { PrototypeMeta } from "..";
import { Prototype } from "../../Prototype";
import { usePrototypeModes } from "../../modes";
import {
  ASSET_STATUSES,
  ASSET_TYPES,
  DATACENTERS,
  type AssetStatus,
  type AssetType,
  type InventoryItem,
} from "../../../data/inventory";
import {
  handlers,
  loadErrorHandlers,
  submitErrorHandlers,
} from "../../../api/inventory";
import { worker } from "../../../api/worker";
import { modes } from "./modes";

export const meta: PrototypeMeta = {
  title: "Demo Prototype",
  description:
    "Inventory dashboard for an AI infrastructure company's GPUs and servers: a table, a click-to-edit modal, and modes for a failed load or a failed save.",
};

// Maps each mode's id to the handler set it swaps into /api/inventory at
// runtime (worker.use / worker.resetHandlers) — see src/api/inventory/.
const HANDLERS_BY_MODE: Record<number, typeof handlers> = {
  1: handlers,
  2: loadErrorHandlers,
  3: submitErrorHandlers,
};

type LoadState =
  | { status: "loading" }
  | { status: "ok"; items: InventoryItem[] }
  | { status: "error"; message: string };

interface EditItemFormValues {
  name: string;
  type: AssetType;
  model: string;
  datacenter: string;
  status: AssetStatus;
  utilization: number;
  notes: string;
}

function EditItemModal({
  item,
  onClose,
  onSaved,
}: {
  item: InventoryItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EditItemFormValues>({
    defaultValues: {
      name: item.name,
      type: item.type,
      model: item.model,
      datacenter: item.datacenter,
      status: item.status,
      utilization: item.utilization,
      notes: item.notes,
    },
  });

  const onSubmit: SubmitHandler<EditItemFormValues> = async (values) => {
    setSubmitError(null);
    try {
      const res = await fetch(`/api/inventory/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      onSaved();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Modal opened onClose={onClose} title={`Edit ${item.name}`}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          {submitError && (
            <Toast variant="error" title="Update failed">
              {submitError}
            </Toast>
          )}

          <Controller
            name="name"
            control={control}
            rules={{ required: "Name is required" }}
            render={({ field, fieldState }) => (
              <TextField
                label="Name"
                required
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Type"
                data={ASSET_TYPES}
                value={field.value}
                onChange={(value) => field.onChange(value as AssetType)}
              />
            )}
          />

          <Controller
            name="model"
            control={control}
            rules={{ required: "Model is required" }}
            render={({ field, fieldState }) => (
              <TextField
                label="Model"
                required
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="datacenter"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Datacenter"
                data={DATACENTERS}
                value={field.value}
                onChange={(value) => field.onChange(value ?? "")}
              />
            )}
          />

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Status"
                data={ASSET_STATUSES}
                value={field.value}
                onChange={(value) => field.onChange(value as AssetStatus)}
              />
            )}
          />

          <Controller
            name="utilization"
            control={control}
            rules={{
              min: { value: 0, message: "Must be at least 0" },
              max: { value: 100, message: "Must be at most 100" },
            }}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Utilization %"
                min={0}
                max={100}
                value={field.value}
                onChange={(value) => field.onChange(Number(value))}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextArea
                label="Notes"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Modal.Footer>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save
            </Button>
          </Modal.Footer>
        </Stack>
      </form>
    </Modal>
  );
}

function DemoPrototypeContent() {
  const { activeMode } = usePrototypeModes();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [searchParams, setSearchParams] = useSearchParams();
  const itemId = searchParams.get("item");

  // The edit modal is routable via ?item=<id>, per "everything is
  // routable" — see AGENT.md's Routing & state section.
  const openItem = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("item", id);
      return next;
    });
  };

  const closeItem = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("item");
      return next;
    });
  };

  const load = useCallback(() => {
    setState({ status: "loading" });
    fetch("/api/inventory")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
        return body as InventoryItem[];
      })
      .then((items) => setState({ status: "ok", items }))
      .catch((err: unknown) =>
        setState({
          status: "error",
          message: err instanceof Error ? err.message : String(err),
        }),
      );
  }, []);

  // The active mode's handlers stay swapped in for as long as it's
  // selected, since both the initial load (GET) and a later save (PATCH)
  // need to see the same scenario.
  useEffect(() => {
    if (!activeMode) return;
    worker.use(...HANDLERS_BY_MODE[activeMode.id]);
    load();
    return () => worker.resetHandlers();
  }, [activeMode, load]);

  if (!activeMode) return null;

  const rows =
    state.status === "ok"
      ? [...state.items].sort((a, b) => a.name.localeCompare(b.name))
      : [];
  const selectedItem = rows.find((item) => item.id === itemId);

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Heading order={1}>Demo Prototype</Heading>
        <Text>
          GPU/server inventory for an AI infrastructure company. Click a row to
          edit it.
        </Text>

        {state.status === "loading" && <Text>Loading…</Text>}
        {state.status === "error" && (
          <Toast variant="error" title="Failed to load inventory">
            {state.message}
          </Toast>
        )}
        {state.status === "ok" && (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th sorted="asc">Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Model</Table.Th>
                <Table.Th>Datacenter</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th variant="currency">Utilization</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Button variant="text" onClick={() => openItem(item.id)}>
                      {item.name}
                    </Button>
                  </Table.Td>
                  <Table.Td>{item.type}</Table.Td>
                  <Table.Td>{item.model}</Table.Td>
                  <Table.Td>{item.datacenter}</Table.Td>
                  <Table.Td>{item.status}</Table.Td>
                  <Table.Td variant="currency">{item.utilization}%</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>

      {selectedItem && (
        <EditItemModal
          key={selectedItem.id}
          item={selectedItem}
          onClose={closeItem}
          onSaved={() => {
            closeItem();
            load();
          }}
        />
      )}
    </Container>
  );
}

function DemoPrototype() {
  return (
    <Prototype modes={modes}>
      <DemoPrototypeContent />
    </Prototype>
  );
}

export default DemoPrototype;
