import React from "react";
import { createRoot } from "react-dom/client";
import CommuneSearch from "./components/CommuneSearch";

document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("commune-react");
  if (rootElement) {
    createRoot(rootElement).render(<CommuneSearch />);
  }
});
