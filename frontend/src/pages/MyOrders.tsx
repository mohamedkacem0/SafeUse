import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertCircle, Loader2, ShoppingCart, Home } from 'lucide-react';
import Navbar from '../components/NavigationList'; // Assuming you have a Navbar component

interface OrderItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string; // More user-friendly than just ID
  date: string;
  totalAmount: number;
  status: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
}

// Mock data - replace with API call
const mockOrders: Order[] = [
  {
    id: '12345XYZ',
    orderNumber: 'ORD-20240530-001',
    date: '2024-05-30T10:30:00Z',
    totalAmount: 75.99,
    status: 'Delivered',
    shippingAddress: {
      name: 'John Doe',
      address: '123 Main St, Apt 4B',
      city: 'Anytown',
      postalCode: '12345',
      country: 'USA',
    },
    items: [
      { id: 'prod1', name: 'Premium Substance A', quantity: 1, price: 49.99, image: 'https://via.placeholder.com/100x100.png?text=Product+A' },
      { id: 'prod2', name: 'Accessory Pack', quantity: 1, price: 26.00, image: 'https://via.placeholder.com/100x100.png?text=Accessory' },
    ],
  },
  {
    id: '67890ABC',
    orderNumber: 'ORD-20240601-002',
    date: '2024-06-01T14:15:00Z',
    totalAmount: 120.50,
    status: 'Shipped',
    shippingAddress: {
      name: 'Jane Smith',
      address: '456 Oak Ave',
      city: 'Otherville',
      postalCode: '67890',
      country: 'USA',
    },
    items: [
      { id: 'prod3', name: 'Advanced Kit B', quantity: 2, price: 60.25, image: 'https://via.placeholder.com/100x100.png?text=Product+B' },
    ],
  },
];

const navLinks = [
    { name: 'Home', path: '/', current: false, icon: Home },
    { name: 'Shop', path: '/Shop', current: false, icon: ShoppingCart },
    // Add other nav links as needed
];

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with actual API call: e.g., const response = await fetch('/api?route=api/orders');
        // const data = await response.json();
        // if (!response.ok) throw new Error(data.error || 'Failed to fetch orders');
        // setOrders(data.orders);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setOrders(mockOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setOrders([]); // Clear orders on error
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar links={navLinks} />
        <div className="flex flex-grow flex-col items-center justify-center p-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          <p className="mt-4 text-lg text-gray-700">Loading your orders...</p>
        </div>
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
              <div key={order.id} className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out">
                <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-4 sm:p-6 text-white">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">Order #{order.orderNumber}</h2>
                      <p className="text-sm sm:text-base opacity-90">Placed on: {new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-3 sm:mt-0 text-left sm:text-right">
                      <p className="text-lg sm:text-xl font-semibold">
                        Total: ${order.totalAmount.toFixed(2)}
                      </p>
                      <span 
                        className={`px-3 py-1 text-xs sm:text-sm font-semibold rounded-full mt-1 inline-block ${ 
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Shipped' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Items Ordered:</h3>
                  <ul className="space-y-4 mb-6">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-start sm:items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                        <img 
                          src={item.image || 'https://via.placeholder.com/80x80.png?text=No+Image'}
                          alt={item.name} 
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover border border-gray-200 bg-white"
                        />
                        <div className="flex-grow">
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">{item.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-700 text-sm sm:text-base">${(item.price * item.quantity).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-md font-semibold text-gray-700 mb-2">Shipping Address:</h3>
                    <div className="text-sm text-gray-600 bg-slate-50 p-3 rounded-md">
                      <p className="font-medium">{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {/* Footer can be added here if needed */}
    </div>
  );
};

export default MyOrders;
