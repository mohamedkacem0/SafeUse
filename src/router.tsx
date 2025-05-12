// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import * as Pages from './pages';

export const router = createBrowserRouter([
  {
    element: <AppLayout />, 
    children: [
      { path: '/', element: <Pages.Home /> }, 
      { path: '/sustancias', element: <Pages.Substances /> },
      { path: '/sustancia/:slug', element: <Pages.SubstanceDetail /> },
      { path: '/Advice', element: <Pages.Advice /> },
      { path: '/Shop', element: <Pages.Shop /> },
      { path: '/Contact', element: <Pages.Contact /> },
      { path: '/login', element: <Pages.Login /> },
    ],
  },
]);
