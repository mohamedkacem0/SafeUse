// src/pages/AdminDashboard.tsx
import React, { useState } from 'react'; // Added useState
import AdminHeader from '../../components/admin/AdminHeader'; // Import the header
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
} from 'lucide-react'; // Added ChevronDown, ChevronUp
import UserManagement from '../../components/admin/UserManagement';
import SubstancesManagement from '../../components/admin/SubstancesManagement';
import ProductManagement from '../../components/admin/ProductManagement';
import ContactSubmissions from '../../components/admin/ContactSubmissions';
import AdviceManagement from '../../components/admin/AdviceManagement';

export default function AdminDashboard() {
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSubstancesManagement, setShowSubstancesManagement] = useState(false);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [showContactSubmissions, setShowContactSubmissions] = useState(false);
  const [showAdviceManagement, setShowAdviceManagement] = useState(false);
  // Fetch users (for total count)
  const {
    data: usersData,
    loading: loadingUsers,
    error: usersError,
  } = useFetchData<{ users: any[] }>('/api/users', (json) => {
    // Si la API devuelve un array directo: json es array
    if (Array.isArray(json)) {
      return { users: json };
    }
    // Si la API devuelve { users: [...] }
    if (Array.isArray((json as any).users)) {
      return { users: (json as any).users };
    }
    // Por defecto, devolvemos array vacío
    return { users: [] };
  });
  const usersCount = usersData?.users.length ?? 0;

  // Fetch total products count
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

  // Fetch total substances count
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

  // Fetch total contacts count
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
    </div>
    </>
  );
}
