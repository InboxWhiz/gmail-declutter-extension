import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../../index.css";
import Tutorial from "./Tutorial.tsx";
import { ThemeProvider } from "../../providers/theme_provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Tutorial />
    </ThemeProvider>
  </StrictMode>,
);
