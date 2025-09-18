import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../../../index.css";
import App from "./App.tsx";
import { PortManager } from "../../../data/ports/port_manager.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

PortManager.openPort();
