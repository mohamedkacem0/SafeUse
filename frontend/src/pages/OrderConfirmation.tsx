import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/NavigationList'; // Corrected import path
import Footer from '../components/Footer';
import { CheckCircle, Package } from 'lucide-react';

// Re-usamos la interfaz Product si la tienes definida globalmente
// Si no, la definimos aquí para la estructura esperada
interface Product {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  // Añade otras propiedades que tus productos puedan tener
}

interface LocationState {
  orderId: string;
  items: Product[];
  total: number;
  paymentDate: string;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Substances', path: '/sustancias' },
  { name: 'Advice', path: '/advice' },
  { name: 'Shop', path: '/Shop' },
  { name: 'Contact', path: '/login' },
  { name: 'Log in/Sign up', path: '/login' },
];

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  console.log('OrderConfirmation.tsx: Received state:', state); // DEBUG LINE
  console.log('OrderConfirmation.tsx: Received items:', state?.items); // DEBUG LINE

  const [isOrderCreationAttempted, setIsOrderCreationAttempted] = useState(false);

  useEffect(() => {
    const createOrderInBackend = async () => {
      if (state && state.shippingAddress && !isOrderCreationAttempted) {
        const { address, city, postalCode } = state.shippingAddress;
        // The backend expects 'address', 'city', and 'postalCode'
        // Ensure your LocationState.shippingAddress matches these or adapt as needed.
        // For example, if state.shippingAddress.address is the full street, use that.
        // If it's split into street, number, etc., combine them appropriately for 'address'.

        setIsOrderCreationAttempted(true); // Set flag to prevent duplicate calls

        // Assuming state.shippingAddress.address is the street address line
        const payload = {
          address: address, // e.g., "123 Main St"
          city: city,       // e.g., "Anytown"
          postalCode: postalCode // e.g., "12345"
        };

        try {
          const response = await fetch('http://localhost/TFG/SafeUse/backend/api/public/index.php?route=api/order/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            credentials: 'include', // Include if your backend session requires cookies and CORS is configured for it
          });

          const responseData = await response.json();

          if (response.ok) {
            console.log('Order created successfully in backend:', responseData);
            // Optionally, you could update the displayed orderId if the backend returns a new one
            // or store it, or simply confirm it's done.
          } else {
            console.error('Failed to create order in backend:', responseData.error || 'Unknown error');
            // Handle error, e.g., show a message to the user
          }
        } catch (error) {
          console.error('Error calling create order API:', error);
          // Handle network error, e.g., show a message to the user
        }
      }
    };

    createOrderInBackend();
  }, [state]); // Dependency array ensures this runs when state changes (typically once on mount with state)

  if (!state) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar links={navLinks} />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-semibold text-red-600">Error</h1>
          <p className="mt-4">No se encontraron detalles del pedido. Por favor, vuelve a la página de inicio.</p>
          <Link to="/" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
            Ir a Inicio
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { orderId, items, total, paymentDate, shippingAddress } = state;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar links={navLinks} />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="bg-white shadow-xl rounded-lg p-8 md:p-12 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Your purchase has been successfully completed!</h1>
            <p className="text-gray-600 mt-2">Thank you for your order. We have received your payment.</p>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Order number:</strong> {orderId}</p>
              <p><strong>Date:</strong> {new Date(paymentDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(paymentDate).toLocaleTimeString('es-ES')}</p>
              <p className="text-lg font-bold text-gray-800"><strong>Total:</strong> {total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
            </div>
          </div>

          {shippingAddress && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Order Adress</h3>
              <div className="text-sm text-gray-600 bg-white p-4 border rounded-md">
                <p>{shippingAddress.name}</p>
                <p>{shippingAddress.address}</p>
                <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                <p>{shippingAddress.country}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <Package size={20} className="mr-2" /> Products Purchased
            </h3>
            <ul className="divide-y divide-gray-200 border rounded-md">
              {items.map((item) => (
                <li key={item.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {(item.price * item.quantity).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center mt-10">
            <Link 
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md text-sm transition duration-150 ease-in-out"
            >
              Continue Shopping
            </Link>
            <Link 
              to="/my-orders"
              className="ml-4 bg-emerald-600 hover:bg-gray-300 text-white font-semibold py-3 px-6 rounded-md text-sm transition duration-150 ease-in-out"
            >
              My orders
            </Link> 
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
