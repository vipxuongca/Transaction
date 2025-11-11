import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import ShopContextProvider from "./context/ShopContextProvider.jsx";
import CartContextProvider from "./context/CartContextProvider.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ShopContextProvider>
      <CartContextProvider>
        <App />
      </CartContextProvider>
    </ShopContextProvider>
  </BrowserRouter>
);
