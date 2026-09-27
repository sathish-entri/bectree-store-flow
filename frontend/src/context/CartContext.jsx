import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, updateCartItem, removeCartItem, createOrder } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [cartData, setCartData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync cart from backend whenever auth state changes or on-demand
  const syncCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartData(null);
      setCartItems([]);
      setCartCount(0);
      setError(null);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getCart();
      const live = res?.data ?? null;
      const items = live?.items ?? [];
      const totalQty = live?.totalQuantity ?? items.reduce((sum, item) => sum + item.quantity, 0);
      setCartData(live);
      setCartItems(items);
      setCartCount(totalQty);
      return live;
    } catch (err) {
      if (err.status !== 401) {
        setError(err.message || 'Failed to load cart');
      }
      setCartData(null);
      setCartItems([]);
      setCartCount(0);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  // Update item quantity on backend and update centralized state immediately
  const updateQuantity = useCallback(async (itemId, quantity) => {
    const res = await updateCartItem(itemId, quantity);
    const live = res?.data;
    if (live) {
      setCartData(live);
      setCartItems(live.items ?? []);
      setCartCount(live.totalQuantity ?? (live.items ?? []).reduce((sum, i) => sum + i.quantity, 0));
    }
    return live;
  }, []);

  // Remove item from backend and update centralized state immediately
  const removeItem = useCallback(async (itemId) => {
    const res = await removeCartItem(itemId);
    const live = res?.data;
    if (live) {
      setCartData(live);
      setCartItems(live.items ?? []);
      setCartCount(live.totalQuantity ?? (live.items ?? []).reduce((sum, i) => sum + i.quantity, 0));
    }
    return live;
  }, []);

  // Execute checkout and clear cart on success
  const checkout = useCallback(async () => {
    const res = await createOrder();
    const order = res?.data;
    // Server has cleared the cart inside transaction, clear client state
    setCartData({ items: [], totalQuantity: 0, grandTotal: 0, hasStaleItems: false });
    setCartItems([]);
    setCartCount(0);
    return order;
  }, []);

  const clearCart = useCallback(() => {
    setCartData({ items: [], totalQuantity: 0, grandTotal: 0, hasStaleItems: false });
    setCartItems([]);
    setCartCount(0);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartData,
        cartItems,
        cartCount,
        loading,
        error,
        syncCart,
        updateQuantity,
        removeItem,
        checkout,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

