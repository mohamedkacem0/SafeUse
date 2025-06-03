// src/pages/AdminDashboard.tsx
import React, { useState } from 'react';
import AdminHeader from '../../components/admin/AdminHeader';
import { useFetchData } from '../admin/useFetchData';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '../../components/ui/card';
import {
  Users,
  Package,
  FlaskConical,
  Mail,
  ChevronDown,
  ChevronUp,
  ShoppingCart, // ícono para Orders
} from 'lucide-react';

import UserManagement from '../../components/admin/UserManagement';
import SubstancesManagement from '../../components/admin/SubstancesManagement';
import ProductManagement from '../../components/admin/ProductManagement';
import ContactSubmissions from '../../components/admin/ContactSubmissions';
import AdviceManagement from '../../components/admin/AdviceManagement';
import OrdersManagement from '../../components/admin/OrdersManagement'; // Importamos aquí

export default function AdminDashboard() {
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSubstancesManagement, setShowSubstancesManagement] = useState(false);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [showContactSubmissions, setShowContactSubmissions] = useState(false);
  const [showAdviceManagement, setShowAdviceManagement] = useState(false);
  const [showOrdersManagement, setShowOrdersManagement] = useState(false); // Nuevo estado

  // Fetches para métricas (usuarios, productos, sustancias, contactos) ...
  const {
    data: usersData,
    loading: loadingUsers,
    error: usersError,
  } = useFetchData<{ users: any[] }>('/api/users', (json) => {
    if (Array.isArray(json)) {
      return { users: json };
    }
    if (Array.isArray((json as any).users)) {
      return { users: (json as any).users };
    }
    return { users: [] };
  });
  const usersCount = usersData?.users.length ?? 0;

  const {
    data: productsCount,
    loading: loadingProducts,
    error: productsError,
  } = useFetchData<number>('/api/productos', (json) => {
    if (Array.isArray(json)) return json.length;
    if (Array.isArray((json as any).productos)) return (json as any).productos.length;
    if (typeof (json as any).total === 'number') return (json as any).total;
    return 0;
  });

  const {
    data: substancesCount,
    loading: loadingSubstances,
    error: substancesError,
  } = useFetchData<number>('/api/sustancias', (json) => {
    if (Array.isArray(json)) return json.length;
    if (Array.isArray((json as any).sustancias)) return (json as any).sustancias.length;
    if (typeof (json as any).total === 'number') return (json as any).total;
    return 0;
  });

  const {
    data: contactsData,
    loading: loadingContacts,
    error: contactsError,
  } = useFetchData<any[]>('/api/contact', (json) =>
    Array.isArray(json)
      ? json
      : Array.isArray((json as any).contact_submission)
      ? (json as any).contact_submission
      : []
  );
  const contactsCount = contactsData?.length ?? 0;
  const uncheckedCount = contactsData
    ? contactsData.filter((c) => c.checked === 0).length
    : 0;

  return (
    <>
      <AdminHeader />
      <div className="p-6 space-y-6 mt-[70px]">
        {/* Metrics Cards */}
        <div className="grid grid-cols-5 gap-4">
          {/* Total Users */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users size={20} />
                <span>Total Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <p className="text-3xl font-bold">…</p>
              ) : usersError ? (
                <p className="text-red-500">Error</p>
              ) : (
                <p className="text-3xl font-bold">{usersCount}</p>
              )}
            </CardContent>
          </Card>

          {/* Total Products */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package size={20} />
                <span>Total Products</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <p className="text-3xl font-bold">…</p>
              ) : productsError ? (
                <p className="text-red-500">Error</p>
              ) : (
                <p className="text-3xl font-bold">{productsCount}</p>
              )}
            </CardContent>
          </Card>

          {/* Total Substances */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FlaskConical size={20} />
                <span>Total Substances</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSubstances ? (
                <p className="text-3xl font-bold">…</p>
              ) : substancesError ? (
                <p className="text-red-500">Error</p>
              ) : (
                <p className="text-3xl font-bold">{substancesCount}</p>
              )}
            </CardContent>
          </Card>

          {/* Total Contact Submissions */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail size={20} />
                <span>Total Contact Submissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingContacts ? (
                <p className="text-3xl font-bold">…</p>
              ) : contactsError ? (
                <p className="text-red-500">Error</p>
              ) : (
                <p className="text-3xl font-bold">{contactsCount}</p>
              )}
            </CardContent>
          </Card>

          {/* Unchecked Submissions */}
          <Card className="p-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail size={20} />
                <span>Unchecked Submissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingContacts ? (
                <p className="text-3xl font-bold">…</p>
              ) : contactsError ? (
                <p className="text-red-500">Error</p>
              ) : (
                <p className="text-3xl font-bold">{uncheckedCount}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Management Section */}
        <div className="bg-white shadow rounded-lg p-4">
          <button
            onClick={() => setShowUserManagement(!showUserManagement)}
            className="w-full flex justify-between items-center text-left text-xl font-semibold text-gray-700 hover:text-gray-900 focus:outline-none mb-2"
          >
            User Management
            {showUserManagement ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          {showUserManagement && <UserManagement />}
        </div>

        {/* Substances Management Section */}
        <div className="bg-white shadow rounded-lg p-4">
          <button
            onClick={() => setShowSubstancesManagement(!showSubstancesManagement)}
            className="w-full flex justify-between items-center text-left text-xl font-semibold text-gray-700 hover:text-gray-900 focus:outline-none mb-2"
          >
            Substances Management
            {showSubstancesManagement ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          {showSubstancesManagement && <SubstancesManagement />}
        </div>

        {/* Product Management Section */}
        <div className="bg-white shadow rounded-lg p-4">
          <button
            onClick={() => setShowProductManagement(!showProductManagement)}
            className="w-full flex justify-between items-center text-left text-xl font-semibold text-gray-700 hover:text-gray-900 focus:outline-none mb-2"
          >
            Product Management
            {showProductManagement ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          {showProductManagement && <ProductManagement />}
        </div>

        {/* Contact Submissions Section */}
        <div className="bg-white shadow rounded-lg p-4">
          <button
            onClick={() => setShowContactSubmissions(!showContactSubmissions)}
            className="w-full flex justify-between items-center text-left text-xl font-semibold text-gray-700 hover:text-gray-900 focus:outline-none mb-2"
          >
            Contact Submissions
            {showContactSubmissions ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          {showContactSubmissions && <ContactSubmissions />}
        </div>

        {/* Advice Management Section */}
        <div className="bg-white shadow rounded-lg p-4">
          <button
            onClick={() => setShowAdviceManagement(!showAdviceManagement)}
            className="w-full flex justify-between items-center text-left text-xl font-semibold text-gray-700 hover:text-gray-900 focus:outline-none mb-2"
          >
            Advice Management
            {showAdviceManagement ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          {showAdviceManagement && <AdviceManagement />}
        </div>

        {/* Orders Management Section */}
        <div className="bg-white shadow rounded-lg p-4">
          <button
            onClick={() => setShowOrdersManagement(!showOrdersManagement)}
            className="w-full flex justify-between items-center text-left text-xl font-semibold text-gray-700 hover:text-gray-900 focus:outline-none mb-2"
          >
            <div className="flex items-center space-x-2">
              <ShoppingCart size={20} />
              <span>Orders Management</span>
            </div>
            {showOrdersManagement ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          {showOrdersManagement && <OrdersManagement />}
        </div>
      </div>
    </>
  );
}
