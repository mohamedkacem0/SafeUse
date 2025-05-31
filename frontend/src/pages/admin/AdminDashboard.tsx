// src/pages/AdminDashboard.tsx
import React from 'react';
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
} from 'lucide-react';
import UserManagement from '../../components/admin/UserManagement';
import SubstancesManagement from '../../components/admin/SubstancesManagement';
import ProductManagement from '../../components/admin/ProductManagement';

export default function AdminDashboard() {
  // Fetch users (for total count)
  const {
    data: usersData,
    loading: loadingUsers,
    error: usersError,
  } = useFetchData<{ users: any[] }>('/api/users', (json) => ({
    users: Array.isArray(json.users) ? json.users : [],
  }));
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

      {/* User Management Component */}
      <UserManagement />

      {/* Substances Management Component */}
      <SubstancesManagement />

      {/* Product Management Component */}
      <ProductManagement />
    </div>
  );
}
