import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";
import { AuthProvider } from "./context/AuthContext";

import { CartProvider } from "./context/CartContext";
import MiniCart from "./components/cart/MiniCart";
import SeoHead from "./components/seo/SeoHead";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SeoHead />
      <AuthProvider>
        <CartProvider>
          <App />
          <MiniCart />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
