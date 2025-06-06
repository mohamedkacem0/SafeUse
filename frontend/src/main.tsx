import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import CookieBanner from './components/CookieBanner';
import './index.css';             // Tailwind

const App = () => (
  <>
    <RouterProvider router={router} />
    <CookieBanner />
  </>
);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
