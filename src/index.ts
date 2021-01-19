import { createElement } from "react";
import { render } from "react-dom";
import { Boot } from "./App/Boot";

export const onLoad = () =>
  render(createElement(Boot), document.getElementById("root"));

onLoad();
