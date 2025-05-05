// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import * as Pages from './pages';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,        // layout raíz
    children: [
      { path: '/',              element: <Pages.Home /> },
      { path: '/sustancias',    element: <Pages.Substances /> },
      { path: '/sustancia/:slug', element: <Pages.SubstanceDetail /> },
      { path: '/reduccion',     element: <Pages.HarmReduction /> },
      { path: '/recursos',      element: <Pages.Resources /> },
      { path: '/login',         element: <Pages.Login /> },
    ],
  },
]);
