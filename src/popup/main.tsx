import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import App from "./Popup.tsx";
import { ThemeProvider } from "../_shared/providers/ThemeContex.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
