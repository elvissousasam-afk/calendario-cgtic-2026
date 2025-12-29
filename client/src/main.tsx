import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeEventos } from "./data/eventosIniciais";

const queryClient = new QueryClient();

// Inicializar eventos no localStorage
initializeEventos();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
