import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import Tutorial from "./Tutorial.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Tutorial />
  </StrictMode>,
);
