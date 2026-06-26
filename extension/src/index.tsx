import React from "react";
import { createRoot } from "react-dom/client";
import { TestCaseGenerator } from "./TestCaseGenerator";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <TestCaseGenerator />
    </React.StrictMode>
  );
}
