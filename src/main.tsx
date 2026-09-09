import { render } from "preact";
import { LocationProvider } from "preact-iso";
import "./index.css";
import { App } from "./app.tsx";

render(
  <LocationProvider>
    <App />
  </LocationProvider>,
  document.getElementById("app")!,
);
