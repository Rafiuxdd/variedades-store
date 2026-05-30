import { useCallback, useEffect, useMemo, useState } from "react";

const CART_STORAGE_KEY = "variedades_store_cart";

function loadSavedCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];

    const parsed = JSON.parse(savedCart);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error leyendo carrito guardado:", error);
    return [];
  }
}

export function useCart() {
  const [cart, setCart] = useState(loadSavedCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Error guardando carrito:", error);
    }
  }, [cart]);

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const addItemToCart = useCallback((product, selectedOptions = {}) => {
    setCart((prevCart) => {
      const optionEntries = Object.entries(selectedOptions)
        .filter(([, value]) => value)
        .sort(([a], [b]) => a.localeCompare(b));
      const optionKey = optionEntries
        .map(([key, value]) => `${key}:${value}`)
        .join("|");
      const productId = product.productId || product.id;
      const cartId = optionKey ? `${productId}__${optionKey}` : productId;
      const existingItem = prevCart.find((item) => item.id === cartId);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          id: cartId,
          productId,
          selectedOptions,
          quantity: 1
        }
      ];
    });
  }, []);

  const decreaseItemQuantity = useCallback((productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeCartItem = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    cart,
    cartCount,
    addItemToCart,
    decreaseItemQuantity,
    removeCartItem,
    clearCart,
    setCart
  };
}
