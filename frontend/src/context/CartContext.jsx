import { createContext, useContext, useState, useEffect } from "react";
import { authFetch, getAccessToken } from "../utils/auth";
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL;
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    //fetch cart from backend
    const fetchCart = async () => {
        try {
            const res = await authFetch(`${BASE_URL}/api/cart/`);
            const data = await res.json();
            setCartItems(data.items || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        }
    }

    useEffect(() => {
        fetchCart();
    }, [BASE_URL]);

    // Adds a product to the cart.
    // If the product is already there, only its quantity goes up by 1.
    // Otherwise, it is inserted as a new item with quantity 1.
    const addToCart = async (productId) => {
        try {
            await authFetch(`${BASE_URL}/api/cart/add/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ product_id: productId }),
            });
            fetchCart();

        } catch (error) {
            console.error("Failed to add to cart:", error);
        }
    };

    //Remove Product from Cart
    const removeFromCart = async (itemId) => {
        try {
            await authFetch(`${BASE_URL}/api/cart/remove/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ item_id: itemId }),
            });
            fetchCart();
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    }

    //Update Quantity
    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) {
            await removeFromCart(itemId);
            return;
        }
        try {
            await authFetch(`${BASE_URL}/api/cart/update/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ item_id: itemId, quantity }),
            });
            fetchCart();
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    }

    const clearCart = () => {
        setCartItems([]);
        setTotal(0);
    }

    return (
        <CartContext.Provider value={{ cartItems, total, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};