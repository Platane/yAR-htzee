import * as React from "react";
import { Boot } from "./App/Boot";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<Boot />);
