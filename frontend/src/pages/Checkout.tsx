import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  CreditCard,
  ShoppingCart,
  ShieldCheck,
  // Loader2, // For loading state - Removed as unused (lint ID: 392a7433-e1c5-4040-bba2-454afd433ee5)
} from "lucide-react";
import { FaPaypal } from 'react-icons/fa';
import clsx from "clsx";

import PrimaryButton from "../components/PrimaryButton";

// Stripe imports
import { loadStripe } from '@stripe/stripe-js'; // Removed StripeError as it's unused
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Define an interface for the user object stored in localStorage
interface User {
  Nombre: string;
}

// Initialize Stripe outside of the component render to avoid
// recreating the Stripe object on every render.
// Replace with your actual publishable key
const stripePromise = loadStripe("YOUR_STRIPE_PUBLISHABLE_KEY");

// New CheckoutForm component
const CheckoutForm = ({ orderTotal, userName, initialCardName }: { orderTotal: number, userName: string | null, initialCardName: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardName, setCardName] = useState(initialCardName); // Separate state for card name

  useEffect(() => {
    setCardName(initialCardName);
  }, [initialCardName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      setPaymentError("Stripe.js has not loaded yet. Please wait a moment and try again.");
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError("Card details are not available. Please ensure the card form is visible.");
      setProcessing(false);
      return;
    }

    try {
      // 1. Create PaymentIntent on the server
      const response = await fetch('/api?route=api/create-payment-intent', { // Ensure this matches your backend route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Important for session/cookies if your backend uses them
        body: JSON.stringify({
          amount: Math.round(orderTotal * 100), // Stripe expects amount in cents
          currency: 'eur', // Or your desired currency
          // You can pass other metadata here if needed
          metadata: {
            customerName: userName || cardName,
            orderTotal: orderTotal.toFixed(2)
          }
        }),
      });

      const paymentIntentResult = await response.json();

      if (!response.ok || paymentIntentResult.error || !paymentIntentResult.clientSecret) {
        setPaymentError(paymentIntentResult.error?.message || 'Failed to initialize payment. Please try again.');
        setProcessing(false);
        return;
      }

      const clientSecret = paymentIntentResult.clientSecret;

      // 2. Confirm the card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardName, // Use the name from the input field
            // email: userEmail, // Optional: if you have user's email
          },
        },
      });

      if (error) {
        setPaymentError(error.message || 'An unexpected error occurred.');
        setProcessing(false);
      } else if (paymentIntent?.status === 'succeeded') {
        setPaymentSuccess(`Payment successful! Your transaction ID is: ${paymentIntent.id}`);
        // TODO: Redirect to an order confirmation page or clear cart, etc.
        // Example: navigate('/order-confirmation', { state: { orderId: paymentIntent.id } });
        console.log('Payment Succeeded:', paymentIntent);
        setProcessing(false);
      } else {
        setPaymentError(`Payment status: ${paymentIntent?.status}. Please contact support.`);
        setProcessing(false);
      }
    } catch (err) { // Removed 'any' type, will use instanceof check
      console.error("Payment submission error:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred during payment processing. Please check console for details.";
      setPaymentError(errorMessage);
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
    hidePostalCode: true, // Optional: if you don't collect postal code
  };

  const inputClass = "w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-colors duration-200 ease-in-out";
  const labelClass = "block mb-1.5 text-xs font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div>
          <label htmlFor="name" className={labelClass}>Name on card</label>
          <input
            id="name"
            name="name"
            required
            className={inputClass}
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            disabled={processing}
          />
        </div>
        <div>
          <label className={labelClass}>Card details</label>
          <div className={`${inputClass} p-3`}> {/* Style the CardElement container */}
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      </div>

      {paymentError && <div className="mt-4 text-sm text-red-600 p-3 bg-red-50 rounded-md">{paymentError}</div>}
      {paymentSuccess && <div className="mt-4 text-sm text-green-600 p-3 bg-green-50 rounded-md">{paymentSuccess}</div>}

      <PrimaryButton
        type="submit"
        disabled={!stripe || processing || !!paymentSuccess} // Disable if processing or successful
        text={processing ? 'Processing...' : (paymentSuccess ? 'Payment Successful!' : 'Pay Securely')}
        className="w-full mt-8 rounded-lg bg-sky-600 py-3.5 text-base font-semibold text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-50 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        // Icon and iconClassName props removed temporarily to fix lint error f7409e2f-f514-490f-a2df-0c58886ba268
        // We can revisit PrimaryButton's icon handling later.
      />
    </form>
  );
};

export default function Checkout() {
  const location = useLocation();
  const passedOrderTotal = location.state?.orderTotal || 0;

  const [method, setMethod] = useState<'card' | 'paypal'>('card');
  // Removed form state for card number, exp, cvc as CardElement handles them
  const [cardHolderName, setCardHolderName] = useState('');
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData: User = JSON.parse(storedUser);
        if (userData && userData.Nombre) {
          setUserName(userData.Nombre);
          if (!cardHolderName) { // Only pre-fill if cardHolderName is not already set (e.g. by user typing)
            setCardHolderName(userData.Nombre);
          }
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, [cardHolderName]); // Depend on cardHolderName to allow user edits to persist

  const orderTotal = passedOrderTotal;
  const orderSubtotal = orderTotal / 1.21;

  const paymentOptions = [
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'paypal', label: 'PayPal', icon: FaPaypal },
  ] as const;

  // If Stripe promise is not loaded or key is missing, show an error or loading state
  if (!stripePromise || stripePromise.toString().includes("YOUR_STRIPE_PUBLISHABLE_KEY")) {
    // Basic check, you might want a more robust way to ensure key is set
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-red-600 p-8">
        Stripe is not configured correctly. Please provide a valid publishable key.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <section className="bg-slate-50 min-h-screen py-12 sm:py-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800 mt-10 sm:text-5xl">
              Secure Checkout
            </h1>
            {userName && (
              <p className="mt-3 text-lg text-gray-600">
                Welcome back, <span className="font-semibold text-sky-600">{userName}</span>!
              </p>
            )}
          </header>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12"> {/* Removed form tag here, it's in CheckoutForm */}
            {/* Payment details Card */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-sky-600" />
                Payment Details
              </h2>

              {/* Tabs */}
              <div className="mb-8 flex border-b border-gray-200">
                {paymentOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMethod(opt.id)}
                    className={clsx(
                      'flex items-center gap-2.5 px-4 py-3 text-sm font-medium -mb-px border-b-2 transition-all duration-200 ease-in-out',
                      method === opt.id
                        ? 'border-sky-500 text-sky-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    )}
                  >
                    <opt.icon className="h-5 w-5" /> {opt.label}
                  </button>
                ))}
              </div>

              {method === 'card' && (
                <CheckoutForm orderTotal={orderTotal} userName={userName} initialCardName={cardHolderName} />
              )}

              {method === 'paypal' && (
                <div className="rounded-md border border-blue-300 bg-blue-50 p-4 text-sm text-blue-700 flex items-start">
                  <FaPaypal className="h-6 w-6 mr-3 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    PayPal integration is not yet implemented in this example.
                    <br />
                    You would typically redirect to PayPal or use PayPal's SDK here.
                  </div>
                </div>
              )}
            </div>

            {/* Order summary Card */}
            <aside className="bg-white p-6 sm:p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 lg:sticky lg:top-24 self-start">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <ShoppingCart className="w-6 h-6 mr-3 text-sky-600" />
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>€ {orderSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (21%)</span>
                  <span>€ {(orderSubtotal * 0.21).toFixed(2)}</span>
                </div>
                <hr className="my-3 border-gray-200" />
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>€ {orderTotal.toFixed(2)}</span>
                </div>
              </div>
              {method === 'card' && ( /* Conditionally show Stripe's pay button or a placeholder */
                <p className="mt-4 text-xs text-gray-500 text-center">
                  <ShieldCheck className="inline w-3.5 h-3.5 mr-1 text-green-600" />
                  All card transactions are secure and encrypted via Stripe.
                </p>
              )}
              {method === 'paypal' && (
                <PrimaryButton
                  text={'Continue to PayPal (Not Implemented)'}
                  disabled={true}
                  className="w-full mt-8 rounded-lg bg-yellow-500 py-3.5 text-base font-semibold text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-50 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                />
              )}
            </aside>
          </div>
        </div>
      </section>
    </Elements>
  );
}
