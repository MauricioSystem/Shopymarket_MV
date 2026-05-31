import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getMyCart,
  addItemToCart as apiAddItemToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart
} from '../services/cartApi';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);

  // Sync cart from backend when user logs in
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setCartItems([]);
      return;
    }
    setLoadingCart(true);
    try {
      // Backend returns: { success, data: { cart_id, items: [...], total } }
      const response = await getMyCart(token);
      if (response?.data?.items) {
        setCartItems(response.data.items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart", error);
      setCartItems([]);
    } finally {
      setLoadingCart(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // ADD ITEM
  const addToCart = async (product, quantity) => {
    if (!isAuthenticated || !token) return { success: false, message: "Debes iniciar sesión para comprar." };
    
    try {
      await apiAddItemToCart(product.id, quantity, token);
      await fetchCart();
      return { success: true };
    } catch (err) {
      console.error("Error adding to cart", err);
      return { success: false, message: err.message || "Error al agregar al carrito" };
    }
  };

  // UPDATE QUANTITY
  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated || !token) return;
    try {
      await apiUpdateCartItem(productId, quantity, token);
      await fetchCart();
    } catch (err) {
      console.error("Error updating cart quantity", err);
    }
  };

  // REMOVE ITEM
  const removeFromCart = async (productId) => {
    if (!isAuthenticated || !token) return;
    // Optimistic remove
    setCartItems(prev => prev.filter(item => Number(item.product_id) !== Number(productId)));
    try {
      await apiRemoveCartItem(productId, token);
      await fetchCart();
    } catch (err) {
      console.error("Error removing item", err);
      await fetchCart(); // rollback
    }
  };

  // CLEAR CART
  const clearCart = async () => {
    if (!isAuthenticated || !token) return;
    setCartItems([]); // Optimistic clear
    try {
      await apiClearCart(token);
    } catch (err) {
      console.error("Error clearing cart", err);
      await fetchCart(); // rollback
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + Number(item.quantity), 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + Number(item.subtotal || (item.quantity * item.unit_price)), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      loadingCart,
      isCartOpen,
      openCart,
      closeCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      refreshCart: fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
