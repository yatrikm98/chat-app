
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx";
import { BrowserRouter } from "react-router-dom";
import { ChatProvider } from "./context/ChatProvider.tsx";


createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
    <ChatProvider>
      <Provider>
        <App />
      </Provider>
      </ChatProvider>
    </BrowserRouter>
);
