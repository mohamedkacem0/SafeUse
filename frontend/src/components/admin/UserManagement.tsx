// src/components/Admin/UserManagement.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useFetchData } from '../../pages/admin/useFetchData';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../ui/table';
import { Edit3 } from 'lucide-react';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function UserManagement() {
  const {
    data: usersData,
    loading: loadingUsers,
    error: usersError,
  } = useFetchData<{ users: any[] }>('/api/users', (json) => ({
    users: Array.isArray(json.users) ? json.users : [],
  }));
  const users = usersData?.users ?? [];

  const [filter, setFilter] = useState('');
  const filteredUsers = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      u.Nombre.toLowerCase().includes(term)
    );
  }, [users, filter]);

  const handleEdit = useCallback((id: number) => {
    console.log('Editar usuario:', id);
  }, []);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>User Management</CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Search users..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button onClick={() => { /* opcional */ }}>
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" >ID</TableHead>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Email</TableHead>
              <TableHead scope="col">Role</TableHead>
              <TableHead scope="col">Direccion</TableHead>
              <TableHead scope="col">Telefono</TableHead>
              <TableHead scope="col">Created At</TableHead>
              <TableHead scope="col">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingUsers ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : usersError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-red-500 py-4">
                  Error loading users
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.ID_Usuario}>
                  <TableCell>{u.ID_Usuario}</TableCell>
                  <TableCell>{u.Nombre}</TableCell>
                  <TableCell>{u.Correo}</TableCell>
                  <TableCell>{u.Tipo_Usuario}</TableCell>
                  <TableCell>{u.Direccion}</TableCell>
                  <TableCell>{u.Telefono}</TableCell>
                  <TableCell>{formatDate(u.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      aria-label={`Editar usuario ${u.Nombre}`}
                      onClick={() => handleEdit(u.ID_Usuario)}
                    >
                      <Edit3 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
