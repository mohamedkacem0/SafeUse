import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";

import PrimaryButton from "../components/PrimaryButton";

import { loadStripe, PaymentIntent } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

interface User {
  Nombre: string;
}

interface Product {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string; 
} 
const stripePromise = loadStripe("pk_test_51RVEeLRsCw1rPgQ1kFV5WKJTolyxv34OHCwa8pYCTBoGKawMpRj4qk0cPW5ELFWW88zlmQO3H383OtlDHs3gIoGR00DOXUfYXH");
 
interface ShippingAddressDetails {
  firstName: string;
  lastName: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
}
 
const CheckoutForm = ({ orderTotal, userName, initialCardName, onPaymentSuccess }: { orderTotal: number, userName: string | null, initialCardName: string, onPaymentSuccess: (paymentIntent: PaymentIntent, shippingDetails: ShippingAddressDetails) => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cardName, setCardName] = useState(initialCardName);  
 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    setCardName(initialCardName);
  }, [initialCardName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setPaymentError(null);
    setPaymentSuccess(null);
 
    if (!firstName || !lastName || !addressLine1 || !city || !postalCode || !country) {
      setPaymentError("Please fill in all required shipping details.");
      setProcessing(false);
      return;
    }

    if (!stripe || !elements) { 
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
      const response = await fetch('api/create-payment-intent', {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          amount: Math.round(orderTotal * 100),  
          currency: 'eur',  
          metadata: {
            customerName: userName || cardName,
            orderTotal: orderTotal.toFixed(2)
          }
        }),
      });

      console.log('Response from /api/create-payment-intent:', response);
      const paymentIntentResult = await response.json();
      console.log('PaymentIntentResult from backend:', paymentIntentResult);

      if (!response.ok || paymentIntentResult.error || !paymentIntentResult.clientSecret) {
        setPaymentError(paymentIntentResult.error?.message || 'Failed to initialize payment. Please try again.');
        console.error('Error initializing payment:', paymentIntentResult.error?.message || 'Response not OK or missing clientSecret.');
        setProcessing(false);
        return;
      }

      const clientSecret = paymentIntentResult.clientSecret;
 
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardName,  
          },
        },
      });

      if (error) {
        setPaymentError(error.message || 'An unexpected error occurred.');
        setProcessing(false);
      } else if (paymentIntent?.status === 'succeeded') {
        setPaymentSuccess(`Payment successful! Your transaction ID is: ${paymentIntent.id}`);
        const shippingDetails: ShippingAddressDetails = {
          firstName,
          lastName,
          addressLine1,
          city,
          postalCode,
          country,
        };
        onPaymentSuccess(paymentIntent, shippingDetails);
        setProcessing(false);
      } else {
        setPaymentError(`Payment status: ${paymentIntent?.status}. Please contact support.`);
        setProcessing(false);
      }
    } catch (err) { 
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
    hidePostalCode: true,  
  };

  const inputClass = "w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-colors duration-200 ease-in-out";
  const labelClass = "block mb-1.5 text-xs font-medium text-gray-700";

  return (
    <> 
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Shipping Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClass}>First Name</label>
            <input id="firstName" name="firstName" type="text" required className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={processing} />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>Last Name</label>
            <input id="lastName" name="lastName" type="text" required className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={processing} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="addressLine1" className={labelClass}>Address</label>
            <input id="addressLine1" name="addressLine1" type="text" required className={inputClass} value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} disabled={processing} />
          </div>
          <div>
            <label htmlFor="city" className={labelClass}>City</label>
            <input id="city" name="city" type="text" required className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} disabled={processing} />
          </div>
          <div>
            <label htmlFor="postalCode" className={labelClass}>Postal Code</label>
            <input id="postalCode" name="postalCode" type="text" required className={inputClass} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} disabled={processing} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="country" className={labelClass}>Country</label>
            <input id="country" name="country" type="text" required className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)} disabled={processing} />
          </div>
        </div>
      </div>
 
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Information</h3>
   

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
          <div className={`${inputClass} p-3`}>  
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      </div>

      {paymentError && <div className="mt-4 text-sm text-red-600 p-3 bg-red-50 rounded-md">{paymentError}</div>}
      {paymentSuccess && <div className="mt-4 text-sm text-green-600 p-3 bg-green-50 rounded-md">{paymentSuccess}</div>}

      <PrimaryButton
        type="submit"
        disabled={!stripe || processing || !!paymentSuccess} 
        text={processing ? 'Processing...' : (paymentSuccess ? 'Payment Successful!' : 'Pay Securely')}
        className="w-full mt-8 rounded-lg bg-sky-600 py-3.5 text-base font-semibold text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-50 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      />
    </form>
    </> 
  );
};

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  
  const [cardHolderName, setCardHolderName] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [currentCartItems, setCurrentCartItems] = useState<Product[]>([]); 
  const [currentOrderTotal, setCurrentOrderTotal] = useState<number>(0);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData: User = JSON.parse(storedUser);
        if (userData && userData.Nombre) {
          setUserName(userData.Nombre);
          if (!cardHolderName) { 
            setCardHolderName(userData.Nombre);
          }
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, [cardHolderName]); 

  useEffect(() => { 
    const {
      cardName = '',
      userName: initialUserName = null,
      cartItems = [], 
      orderTotal = 0,
    } = location.state || {};

    console.log('Checkout.tsx useEffect - location.state:', location.state);  
    setCardHolderName(cardName);
    setUserName(initialUserName);
    setCurrentCartItems(cartItems as Product[]); 
    setCurrentOrderTotal(orderTotal);
  }, [location.state]);

  const handlePaymentSuccess = useCallback((paymentIntent: PaymentIntent, shippingDetails: ShippingAddressDetails) => {
    console.log('Payment successful!', paymentIntent);
    console.log('Checkout.tsx: Navigating to confirmation with items:', currentCartItems);  
    navigate('/order-confirmation', { 
      state: { 
        orderId: paymentIntent.id,
        items: currentCartItems,  
        total: currentOrderTotal,
        paymentDate: new Date().toISOString(),
        shippingAddress: {
          name: `${shippingDetails.firstName} ${shippingDetails.lastName}`,
          address: shippingDetails.addressLine1,
          city: shippingDetails.city,
          postalCode: shippingDetails.postalCode,
          country: shippingDetails.country,
        },
      } 
    });
  }, [navigate, currentCartItems, currentOrderTotal]);

  // If Stripe promise is not loaded or key is missing, show an error or loading state
  if (!stripePromise || stripePromise.toString().includes("pk_test_51RVEeLRsCw1rPgQ1kFV5WKJTolyxv34OHCwa8pYCTBoGKawMpRj4qk0cPW5ELFWW88zlmQO3H383OtlDHs3gIoGR00DOXUfYXH")) {
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

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12"> 
 
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-sky-600" />
                Payment Details
              </h2>

              <CheckoutForm orderTotal={currentOrderTotal} userName={userName} initialCardName={cardHolderName} onPaymentSuccess={handlePaymentSuccess} />
            </div>
 
            <aside className="bg-white p-6 sm:p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 self-start">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <ShoppingCart className="w-6 h-6 mr-3 text-sky-600" />
                Order Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>€ {currentOrderTotal > 0 ? (currentOrderTotal / 1.21).toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (21%)</span>
                  <span>€ {currentOrderTotal > 0 ? (currentOrderTotal - (currentOrderTotal / 1.21)).toFixed(2) : '0.00'}</span>
                </div>
                <hr className="my-3 border-gray-200" />
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>€ {currentOrderTotal.toFixed(2)}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500 text-center">
                  <ShieldCheck className="inline w-3.5 h-3.5 mr-1 text-green-600" />
                  All card transactions are secure and encrypted via Stripe.
                </p>
            </aside>
          </div>
        </div>
      </section>
    </Elements>
  );
}
