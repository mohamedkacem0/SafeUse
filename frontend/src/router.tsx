// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import * as Pages from './pages';
import OrderConfirmation from './pages/OrderConfirmation'; 
import MyOrders from './pages/MyOrders';  

export const router = createBrowserRouter([
  {
    element: <AppLayout />, 
    children: [
      { path: '/', element: <Pages.Home /> }, 
      { path: '/sustancias', element: <Pages.Substances /> },
      { path: '/sustancia/:slug', element: <Pages.SubstanceDetail /> },
      { path: '/advice', element: <Pages.Advice /> },
      { path: '/Shop', element: <Pages.Shop /> },
      { path: '/shop/:id', element: <Pages.ProductDetails /> },
      { path: '/contact', element: <Pages.Contact /> },
      { path: '/profile', element: <Pages.Profile /> },
      { path: '/verification', element: <Pages.Verification /> },
      { path: '/passwordReset', element: <Pages.PasswordReset /> },
      { path: '/success', element: <Pages.Success /> },
      { path: '/login', element: <Pages.Login /> },
      { path: '/LegalTerms', element: <Pages.LegalTerms /> },
      { path: '/PrivacyPolicy', element: <Pages.PrivacyPolicy /> },
      { path: '/cart', element: <Pages.Cart /> },
      { path: '/Checkout', element: <Pages.Checkout /> },
      { path: '/order-confirmation', element: <OrderConfirmation /> }, 
      { path: '/my-orders', element: <MyOrders /> }, 

    ],
  },
  { path: '/AdminDashboard', element: <Pages.AdminDashboard /> },
]);
