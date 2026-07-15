import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "./styles.css";
import { MockSessionProvider } from "./context/mock-session";
import App from "./App.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MockSessionProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MockSessionProvider>
    </QueryClientProvider>
  </StrictMode>,
);
