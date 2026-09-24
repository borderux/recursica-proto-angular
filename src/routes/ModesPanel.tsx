import { Button, Panel, Stack, Text } from "@recursica/adapter-mantine-v8";
import type { Mode } from "./modes";

interface ModesPanelProps {
  modes: Mode[];
  activeMode: Mode | undefined;
  isOpen: boolean;
  onSelect: (id: number) => void;
  onClose: () => void;
}

/**
 * The mode picker: a panel that slides out from the right, listing every
 * mode by name and description. Clicking one selects it and closes the
 * panel. Rendered by `<Prototype>` (`Prototype.tsx`) for every prototype,
 * so it opens via `?mode`/`?modes` even when `modes` is empty.
 */
export function ModesPanel({
  modes,
  activeMode,
  isOpen,
  onSelect,
  onClose,
}: ModesPanelProps) {
  return (
    <Panel opened={isOpen} onClose={onClose} title="Modes" placement="right">
      <Panel.Body>
        {modes.length === 0 ? (
          <Text>This prototype doesn't define any modes.</Text>
        ) : (
          <Stack gap="md">
            {modes.map((mode) => (
              <Stack key={mode.id} gap={4}>
                <Button
                  variant={mode.id === activeMode?.id ? "solid" : "outline"}
                  onClick={() => onSelect(mode.id)}
                >
                  {mode.name}
                </Button>
                <Text>{mode.description}</Text>
              </Stack>
            ))}
          </Stack>
        )}
      </Panel.Body>
    </Panel>
  );
}
