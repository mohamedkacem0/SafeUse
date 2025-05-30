// src/pages/Cart.tsx
import React, { useState, useEffect } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
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
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load cart items
  useEffect(() => {
    fetch("/api?route=api/cart", { credentials: "include" })
      .then(res => {
        if (res.status === 401) {
          alert("Please log in to view your cart.");
          navigate("/login");
          throw new Error("Not authenticated");
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
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  // Update quantity
  const updateQty = async (id: number, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);

    try {
      const res = await fetch("/api?route=api/cart/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity: newQty }),
      });
      if (res.status === 401) {
        alert("Please log in to update your cart.");
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems(prev =>
        prev.map(i => (i.id === id ? { ...i, quantity: newQty } : i))
      );
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  // Remove item
  const remove = async (id: number) => {
    try {
      const res = await fetch("/api?route=api/cart/remove", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      if (res.status === 401) {
        alert("Please log in to modify your cart.");
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando carrito…</div>;
  }
  if (items.length === 0) {
    return (
      <section className="container mx-auto max-w-4xl px-6 mt-10 py-20 text-center">
        <h1 className="mb-6 text-3xl font-bold">Your cart is empty</h1>
        <NavLink to="/shop" className="w-full">
          <PrimaryButton
            text="Shop now"
            className="w-full rounded-full bg-[#44844D] py-3 text-center text-lg font-semibold text-white hover:bg-[#44844D]/90"
          />
        </NavLink>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-10 mt-10 text-4xl font-extrabold lg:text-5xl">
        Your cart has {totalUnits} {totalUnits === 1 ? "item" : "items"}
      </h1>

      <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
        {/* Item list */}
        <div className="space-y-6">
          {items.map(item => (
            <article
              key={item.id}
              className="flex items-center gap-6 rounded-xl border border-gray-300 bg-white p-4 shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-24 rounded-lg object-contain"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-600">
                  € {item.price.toFixed(2)}
                </p>
                <div className="mt-2 inline-flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="rounded-full border p-1 hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="rounded-full border p-1 hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="font-semibold">
                  € {(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => remove(item.id)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Summary */}
        <aside className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm lg:sticky lg:top-24">
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
    </section>
  );
}
