import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeEventos } from "./data/eventosIniciais";

// Inicializar eventos no localStorage
initializeEventos();

// Renderizar app sem tRPC
createRoot(document.getElementById("root")!).render(<App />);
