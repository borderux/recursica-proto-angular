import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import "../recursica_variables_scoped.css";
import "./recursica_fonts.css";
import "@recursica/adapter-mantine-v8/style.css";
import { MantineProvider } from "@mantine/core";
import { RecursicaThemeProvider } from "@recursica/adapter-mantine-v8";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";

// Mock API (see src/api/) is dev-only — prototypes talk to /api/* as if a
// real backend existed, MSW intercepts the requests in the browser.
async function enableMocking() {
  if (!import.meta.env.DEV) return;
  const { worker } = await import("./api/worker");
  return worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <MantineProvider>
        <RecursicaThemeProvider theme="light">
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </RecursicaThemeProvider>
      </MantineProvider>
    </StrictMode>,
  );
});
