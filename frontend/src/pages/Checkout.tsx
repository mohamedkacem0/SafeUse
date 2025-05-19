import { useState } from "react";
import { CreditCard } from "lucide-react";
import { FaPaypal } from 'react-icons/fa';

import PrimaryButton from "../components/PrimaryButton";
import clsx from "clsx";

export default function Checkout() {
  const [method, setMethod] = useState<'card' | 'paypal'>('card');
  const [form, setForm] = useState({
    name: '',
    cardNumber: '',
    exp: '',
    cvc: '',
  });

  const label = "mb-2 text-xs font-semibold tracking-wide text-gray-600";
  const input = "w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm placeholder:text-gray-500 focus:border-primary focus:outline-none";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate stripe/paypal SDK
    console.log({ method, ...form });
  };

  const orderSubtotal = 40; // ← placeholder — reemplaza con props/ctx
  const orderTotal = orderSubtotal * 1.21;

  return (
    <section className="container mx-auto max-w-4xl px-6 mt-10 py-16">
      <h1 className="mb-10 text-4xl font-extrabold lg:text-5xl">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-2">
        {/* Payment details */}
        <div>
          <h2 className="mb-6 text-2xl font-semibold">Payment details</h2>

          {/* Tabs */}
          <div className="mb-8 flex gap-4">
            {(
              [
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'paypal', label: 'PayPal', icon: FaPaypal },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMethod(opt.id)}
                className={clsx(
                  'flex items-center gap-2 rounded-full border px-4 py-2 text-sm',
                  method === opt.id ? 'border-primary text-primary' : 'border-gray-300',
                )}
              >
                <opt.icon className="h-4 w-4" /> {opt.label}
              </button>
            ))}
          </div>

          {method === 'card' && (
            <div className="space-y-4">
              <div>
                <label className={label}>Name on card</label>
                <input name="name" required className={input} value={form.name} onChange={handleChange} />
              </div>
              <div>
                <label className={label}>Card number</label>
                <input name="cardNumber" required maxLength={19} placeholder="1234 5678 9012 3456" className={input} value={form.cardNumber} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Exp. date</label>
                  <input name="exp" required placeholder="MM/YY" className={input} value={form.exp} onChange={handleChange} />
                </div>
                <div>
                  <label className={label}>CVC</label>
                  <input name="cvc" required maxLength={4} className={input} value={form.cvc} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {method === 'paypal' && (
            <div className="rounded-md border border-yellow-400 bg-yellow-50 p-4 text-sm">
              You will be redirected to PayPal to complete your purchase.
            </div>
          )}
        </div>

        {/* Order summary */}
        <aside className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="mb-6 text-2xl font-semibold">Order summary</h2>
          <div className="mb-4 flex justify-between text-sm">
            <span>Subtotal</span>
            <span>€ {orderSubtotal.toFixed(2)}</span>
          </div>
          <div className="mb-4 flex justify-between text-sm">
            <span>VAT (21%)</span>
            <span>€ {(orderSubtotal * 0.21).toFixed(2)}</span>
          </div>
          <div className="mb-8 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>€ {orderTotal.toFixed(2)}</span>
          </div>
          <PrimaryButton
            text={method === 'paypal' ? 'Continue to PayPal' : 'Pay now'}
            className="w-full rounded-full bg-primary py-3 text-lg font-semibold text-white hover:bg-primary/90"
          />
        </aside>
      </form>
    </section>
  );
}
