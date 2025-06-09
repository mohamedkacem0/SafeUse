import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertCircle, Loader2, ShoppingCart, Home } from 'lucide-react';
import Navbar from '../components/NavigationList'; // Assuming you have a Navbar component

// Interface for individual product item within an order from the backend
interface BackendOrderItem {
  ID_Producto: string | number;
  NombreProducto: string;
  Cantidad: number;
  Precio_Unitario: number;
  Precio_total: number;
  ImagenProducto?: string;
}

// Interface for a single order from the backend
interface BackendOrder {
  ID_Pedido: string; // Or number, depending on your DB
  Fecha_Pedido: string; // e.g., "2024-06-02 10:00:00"
  Estado_Pedido: string;
  Direccion_entrega: string; // Combined address string from backend
  Total_Pedido: number;
  detalles: BackendOrderItem[];
}

// Interface for the API response structure
interface ApiResponse {
  success?: boolean;
  orders?: BackendOrder[];
  message?: string; // For 'No orders found' or errors
  error?: string;
}

const navLinks = [
  { name: 'Home', path: '/', current: false, icon: Home },
  { name: 'Shop', path: '/Shop', current: false, icon: ShoppingCart },
  // Add other nav links as needed, e.g., My Profile, My Orders (if not this page)
];

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('api/orders/history', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important for sending session cookies
        });
        const data: ApiResponse = await response.json();

        if (!response.ok || data.error) {
          // Prioritize error message from backend if available
          throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
        }
        
        if (data.success && data.orders) {
          setOrders(data.orders);
        } else if (data.message === 'No orders found for this user.') {
          setOrders([]); // Explicitly set to empty array if no orders
        } else {
          // Handle cases where success might be false but no specific error given, or unexpected structure
          setOrders([]);
          console.warn('Received unexpected data structure or non-successful response:', data);
          // Optionally set an error message for the user in this case too
          // setError('Could not retrieve orders at this time.');
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching orders.');
        setOrders([]); // Clear orders on error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar links={navLinks} />
        <div className="flex flex-grow flex-col items-center justify-center p-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          <p className="mt-4 text-lg text-gray-700">Loading your orders...</p>
        </div>
        {/* Consider adding a Footer here if consistent with other pages */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar links={navLinks} />
        <div className="flex flex-grow flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg text-red-600">Error loading orders: {error}</p>
          <Link to="/" className="mt-6 inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-colors duration-200">
            Go to Homepage
          </Link>
        </div>
        {/* Consider adding a Footer here */}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar links={navLinks} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-10 text-center sm:text-left">
          <Package className="inline-block h-10 w-10 mr-3 align-text-bottom text-emerald-600" />
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-lg">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">You haven't placed any orders yet.</p>
            <p className="text-gray-500 mb-6">Looks like your order history is empty. Time to shop!</p>
            <Link 
              to="/Shop"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order.ID_Pedido} className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-4 sm:p-6 text-white">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">Order #{order.ID_Pedido}</h2>
                      <p className="text-sm sm:text-base opacity-90">
                        Placed on: {new Date(order.Fecha_Pedido).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0 text-left sm:text-right">
                      <p className="text-lg sm:text-xl font-semibold">
                        Total: {order.Total_Pedido !== null && !isNaN(Number(order.Total_Pedido))
                                ? Number(order.Total_Pedido).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })
                                : order.detalles.reduce((sum, item) => sum + (item.Precio_total || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                      </p>
                      <span 
                        className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full mt-1 inline-block ${ 
                          order.Estado_Pedido.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' : 
                          order.Estado_Pedido.toLowerCase() === 'shipped' ? 'bg-yellow-100 text-yellow-800' : 
                          order.Estado_Pedido.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.Estado_Pedido.toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-800' : // Example for 'pending'
                          order.Estado_Pedido.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' : // Example for 'cancelled'
                          'bg-gray-100 text-gray-800' // Default/other statuses
                        }`}
                      >
                        {order.Estado_Pedido}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Items Ordered:</h3>
                  <ul className="space-y-4 mb-6">
                    {order.detalles.map((item) => (
                      <li key={item.ID_Producto} className="flex items-start sm:items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                        <img 
                          src={item.ImagenProducto || 'https://via.placeholder.com/80x80.png?text=No+Image'}
                          alt={item.NombreProducto} 
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover border border-gray-200 bg-white"
                        />
                        <div className="flex-grow">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">{item.NombreProducto}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Quantity: {item.Cantidad}</p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Unit Price: {item.Precio_Unitario.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-700 text-sm sm:text-base">
                          {item.Precio_total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Shipping Address:</h3>
                    <div className="text-sm text-gray-600 bg-slate-50 p-3 rounded-md">
                      <p>{order.Direccion_entrega}</p>
                      {/* If Direccion_entrega is a JSON string with multiple fields, you'd parse it here */}
                      {/* Example if it were JSON: 
                          const addr = JSON.parse(order.Direccion_entrega);
                          <p>{addr.address}, {addr.city}, {addr.postalCode}</p> 
                      */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {/* Consider adding a Footer component here for consistency */}
      {/* <Footer /> */}
    </div>
  );
};

export default MyOrders;
