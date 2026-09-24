import { Link as RouterLink } from "react-router";
import {
  Container,
  Heading,
  Link,
  Stack,
  Table,
  Text,
} from "@recursica/adapter-mantine-v8";
import { prototypes } from "./prototypes";

function Home() {
  // Prototypes are discovered in slug order (see ./prototypes); the table's
  // sort is on the visible identity — its title, A to Z — per
  // recursica-skill-tables.
  const rows = [...prototypes].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Heading order={1}>Prototypes</Heading>
        {rows.length === 0 ? (
          <Text variant="body-small">
            No prototypes yet. Add one under
            src/routes/prototypes/&lt;slug&gt;/index.tsx.
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th sorted="asc">Prototype</Table.Th>
                <Table.Th>Description</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map(({ slug, title, description }) => (
                <Table.Tr key={slug}>
                  <Table.Td>
                    <Stack gap={2}>
                      <Link
                        renderRoot={(props) => (
                          <RouterLink to={`/prototypes/${slug}`} {...props} />
                        )}
                      >
                        {title}
                      </Link>
                      <Text variant="caption">/prototypes/{slug}</Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    {description ?? <Text variant="caption">NA</Text>}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>
    </Container>
  );
}

export default Home;
