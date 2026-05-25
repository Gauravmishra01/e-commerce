import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import store from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

let persistor = persistStore(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            className:
              "!rounded-2xl !border !border-slate-200 !bg-white/95 !text-slate-950 !shadow-[0_18px_60px_rgba(15,23,42,0.12)]",
          }}
        />
      </PersistGate>
    </Provider>
  </StrictMode>,
);
