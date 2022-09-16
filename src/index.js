import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { ReactFlowProvider } from "react-flow-renderer";

import App from "./App";
import { GraphContextProvider } from "./graph-context";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <GraphContextProvider>
    <ReactFlowProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </ReactFlowProvider>
  </GraphContextProvider>,
  rootElement
);
