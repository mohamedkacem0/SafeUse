import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import PrimaryButton from "../components/PrimaryButton";
import { NavLink, Link } from 'react-router-dom';

interface CartItem {
  id: number;
  name: string;
  price: number; // EUR
  quantity: number;
  image: string;
}

const MOCK: CartItem[] = [
  { id: 1, name: 'LSD Test Kit', price: 12, quantity: 2, image: '/img/kit-lsd.png' },
  { id: 2, name: 'Cannabis Grinder', price: 18, quantity: 1, image: '/img/grinder.png' },
  { id: 3, name: 'SafeUse Tote Bag', price: 10, quantity: 3, image: '/img/tote.png' },
];

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>(MOCK);

  const totalUnits = items.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal   = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  const updateQty = (id: number, delta: number) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it,
      ),
    );

  const remove = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  if (!items.length)
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

  return (
    <section className="container mx-auto max-w-6xl px-4 py-16">
      {/* Dynamic heading */}
      <h1 className="mb-10 mt-10 text-4xl font-extrabold lg:text-5xl">
        Your cart has {totalUnits} {totalUnits === 1 ? 'item' : 'items'}
      </h1>

      <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
        {/* Item list */}
        <div className="space-y-6">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex items-center gap-6 rounded-xl border border-gray-300 bg-white p-4 shadow-sm"
            >
              <img src={item.image} alt={item.name} className="h-24 w-24 rounded-lg object-contain" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-600">€ {item.price.toFixed(2)}</p>

                {/* Quantity controls */}
                <div className="mt-2 inline-flex items-center gap-2">
                  <button type="button" onClick={() => updateQty(item.id, -1)} className="rounded-full border p-1 hover:bg-gray-100">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button type="button" onClick={() => updateQty(item.id, 1)} className="rounded-full border p-1 hover:bg-gray-100">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Subtotal & remove */}
              <div className="flex flex-col items-end gap-2">
                <p className="font-semibold">€ {(item.price * item.quantity).toFixed(2)}</p>
                <button onClick={() => remove(item.id)} className="flex items-center gap-1 text-sm text-red-600 hover:underline">
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

           <NavLink to="/Checkout" className="w-full">
            <PrimaryButton
              text="Checkout"
            className="w-full rounded-full bg-primary bg-[#335A2C] py-3 text-center text-lg font-semibold text-white hover:bg-primary/90"
            />
          </NavLink>
          
        </aside>
      </div>
    </section>
  );
}
