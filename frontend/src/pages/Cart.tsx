// src/pages/Cart.tsx
import React, { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingCart, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';
import PrimaryButton from "../components/PrimaryButton";
import { NavLink, useNavigate } from "react-router-dom";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function Cart() {
  // useEffect(() => {
  //   document.body.classList.add('bg-slate-50');
  //   return () => {
  //     document.body.classList.remove('bg-slate-50');
  //   };
  // }, []);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();

  // Load cart items
  useEffect(() => {
    fetch("/api?route=api/cart", { credentials: "include" })
      .then(res => {
        if (res.status === 401) {
          setAuthError(true);
          return Promise.reject(new Error("Not authenticated"));
        }
        return res.json();
      })
      .then((data: any[]) => {
        const parsed: CartItem[] = data.map(i => ({
          id: i.product_id,
          name: i.Nombre,
          price: parseFloat(i.Precio),
          quantity: i.quantity,
          image: i.Imagen_Principal,
        }));
        setItems(parsed);
      })
      .catch(err => {
        console.error("Error loading cart:", err);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const totalUnits = items.reduce((sum, it) => sum + it.quantity, 0);

  const cartItemVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, x: -50, scale: 0.9, transition: { duration: 0.2, ease: "easeIn" } },
  };
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  // Update quantity
  const updateQty = async (id: number, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    // If newQty is the same as current, do nothing (e.g., trying to decrease from 1)
    if (newQty === item.quantity && delta < 0) return; 

    try {
      const response = await fetch("/api?route=api/cart/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity: newQty }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          setAuthError(true);
          return;
        } else {
          toast.error(data.message || "Error updating quantity.");
        }
        return;
      }

      setItems(prev =>
        prev.map(i => (i.id === id ? { ...i, quantity: newQty } : i))
      );
      toast.success(data.message || "Quantity updated!");
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      // Dispatch stock adjustment event: quantityChange is negative of delta because if delta is +1 (added to cart), stock decreases by 1.
      window.dispatchEvent(new CustomEvent('productStockAdjusted', { detail: { productId: id, quantityChange: -delta } }));
    } catch (err) {
      toast.error("Error updating cart.");
      console.error("Error updating cart:", err);
    }
  };

  // Remove item
  const remove = async (id: number) => {
    const itemToRemove = items.find(i => i.id === id);
    if (!itemToRemove) return;

    try {
      const response = await fetch("/api?route=api/cart/remove", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          setAuthError(true);
          return;
        } else {
          toast.error(data.message || "Error removing item.");
        }
        return;
      }

      setItems(prev => prev.filter(i => i.id !== id));
      toast.success(data.message || "Item removed!");
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      // Dispatch stock adjustment event: quantityChange is the quantity of the item removed (positive, as it's returned to stock)
      window.dispatchEvent(new CustomEvent('productStockAdjusted', { detail: { productId: id, quantityChange: itemToRemove.quantity } }));
    } catch (err) {
      toast.error("Error removing item.");
      console.error("Error removing item:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Toaster position="top-center" reverseOrder={false} />
        Cargando carrito…
      </div>
    );
  }

  // Show login required view if user is not authenticated
  if (authError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <LogIn className="w-16 h-16 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your cart and manage your items.</p>
          <div className="flex justify-center gap-4">
            <NavLink 
              to="/login" 
              state={{ from: '/cart' }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go to Login
            </NavLink>
            <NavLink 
              to="/shop" 
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              Continue Shopping
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart message if cart is empty
  if (items.length === 0) {
    return (
      <>
        <Toaster position="top-center" reverseOrder={false} />
        <motion.div 
          className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] bg-slate-50 px-4 py-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
          >
            <ShoppingCart className="w-28 h-28 md:w-36 md:h-36 text-emerald-400 mb-8" strokeWidth={1.5} />
          </motion.div>
          <motion.h1 
            className="mb-3 text-2xl md:text-3xl font-semibold text-gray-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Your Cart is Empty
          </motion.h1>
          <motion.p 
            className="mb-8 text-base md:text-lg text-gray-500 max-w-sm md:max-w-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            Looks like you haven't added any products yet. Explore our collection and find something you'll love!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <NavLink to="/shop" className="inline-block">
              <PrimaryButton
                text="Start Shopping"
                className="rounded-lg bg-emerald-600 px-7 py-7 text-base md:text-lg font-medium text-white shadow-lg hover:bg-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
              />
            </NavLink>
          </motion.div>
        </motion.div>
      </>
    );
  }

  return (
    <section className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <Toaster position="top-center" reverseOrder={false} />
    <div className="container mx-auto max-w-6xl px-4">
      <h1 className="mb-10 mt-10 text-4xl font-extrabold lg:text-5xl">
        Your cart has {totalUnits} {totalUnits === 1 ? "item" : "items"}
      </h1>

      <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
        {/* Item list */}
        <div className="space-y-6">
            <AnimatePresence initial={false}>
          {items.map(item => (
            <motion.article
              layout
              variants={cartItemVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              key={item.id}
              className="flex flex-col sm:flex-row items-center gap-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-lg object-contain flex-shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-600">
                  € {item.price.toFixed(2)}
                </p>
                <div className="mt-3 inline-flex items-center rounded-md bg-slate-100 p-0.5">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="rounded-md p-2 text-slate-600 hover:bg-white hover:text-slate-800 transition-colors disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-medium text-slate-700">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="rounded-md p-2 text-slate-600 hover:bg-white hover:text-slate-800 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-2 mt-4 sm:mt-0">
                <p className="font-semibold">
                  € {(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => remove(item.id)}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:underline transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            </motion.article>
          ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg lg:sticky lg:top-28">
          <h2 className="mb-6 text-2xl font-semibold">Order summary</h2>
          <div className="mb-4 flex justify-between text-sm">
            <span>Subtotal</span>
            <span>€ {subtotal.toFixed(2)}</span>
          </div>
          <div className="mb-6 flex justify-between text-sm">
            <span>VAT (21%)</span>
            <span>€ {(subtotal * 0.21).toFixed(2)}</span>
          </div>
          <div className="mb-8 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>€ {(subtotal * 1.21).toFixed(2)}</span>
          </div>
          <NavLink to="/checkout" className="w-full">
            <PrimaryButton
              text="Checkout"
              className="w-full rounded-full bg-[#335A2C] py-3 text-center text-lg font-semibold text-white hover:bg-[#335A2C]/90"
            />
          </NavLink>
        </aside>
      </div>
    </div>
  </section>
  );
}
