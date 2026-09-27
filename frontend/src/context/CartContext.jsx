import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  // Sync cart count from backend whenever auth state changes
  const syncCart = useCallback(async () => {
    if (!isLoggedIn) { setCartCount(0); setCartItems([]); return; }
    try {
      const data = await getCart();
      const items = data?.data?.items ?? [];
      setCartItems(items);
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      setCartCount(0);
      setCartItems([]);
    }
  }, [isLoggedIn]);

  useEffect(() => { syncCart(); }, [syncCart]);

  return (
    <CartContext.Provider value={{ cartCount, cartItems, syncCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
