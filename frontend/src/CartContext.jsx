import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const user = sessionStorage.getItem('currentUserEmail');
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const cart = JSON.parse(sessionStorage.getItem(`cart_${user}`)) || [];
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);
  };

  useEffect(() => {
    updateCartCount();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
