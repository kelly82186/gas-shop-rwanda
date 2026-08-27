import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { AuthContext } from "./AuthContext";
import { resolveAssetImage } from "../assets/assetImages";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?.id) {
      // The cart is reset when a user signs out.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCart([]);
      return;
    }
    api.get(`/cart/${user.id}`).then((response) => setCart(response.data.map((item) => ({ ...item, image: resolveAssetImage(item.image) })))).catch(() => setCart([]));
  }, [user]);

  // ADD TO CART
  const addToCart = async (product) => {
    if (user?.role === "admin") return;

    const exist = cart.find((item) => item.id === product.id);
    if (user?.id) await api.post("/cart", { userId: user.id, productId: product.id });

    if (exist) {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setCart((currentCart) => [...currentCart, { ...product, qty: 1 }]);
    }
  };

  // REMOVE
  const removeFromCart = async (id) => {
    if (user?.id) await api.delete(`/cart/${user.id}/${id}`);
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  };

  // INCREASE
  const increaseQty = async (id) => {
    const item = cart.find((cartItem) => cartItem.id === id);
    if (user?.id) await api.put("/cart", { userId: user.id, productId: id, quantity: item.qty + 1 });
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  // DECREASE
  const decreaseQty = async (id) => {
    const item = cart.find((cartItem) => cartItem.id === id);
    if (item.qty <= 1) return;
    if (user?.id) await api.put("/cart", { userId: user.id, productId: id, quantity: item.qty - 1 });
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  // TOTAL
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};