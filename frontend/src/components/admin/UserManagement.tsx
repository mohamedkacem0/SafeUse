// src/components/Admin/UserManagement.tsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
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

// Función para formatear fechas al estilo "dd/MM/yyyy, hh:mm"
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

// Definimos la “forma” que usará nuestra tabla
interface UserRow {
  ID_Usuario: number;
  Nombre: string;
  Correo: string;
  Tipo_Usuario: string;
  Direccion: string;
  Telefono: string;
  created_at: string;
}

export default function UserManagement() {
  // 1) Traemos la data cruda de la API
  //    Suponemos que la API hace GET a /api/users y devuelve un array de objetos,
  //    cada uno con (al menos) id, name, email, role, address, phone, created_at.
  const {
    data: usersData,
    loading: loadingUsers,
    error: usersError,
  } = useFetchData<UserRow[]>('/api/users', (json) => {
    // json podría ser un array directo o un objeto { users: [...] }
    const rawArray: any[] = Array.isArray(json)
      ? json
      : Array.isArray((json as any).users)
      ? (json as any).users
      : [];

    // Mapeamos cada item a un objeto UserRow
    return rawArray.map((item) => ({
      // Cogemos el ID que venga en “id” o “ID_Usuario” o similar
      ID_Usuario:
        item.ID_Usuario ??
        item.id ??
        item.userId ??
        0,
      // Para el nombre: primero “Nombre” si existe, sino “name”
      Nombre: item.Nombre ?? item.name ?? '',
      // Email: “Correo” o “email”
      Correo: item.Correo ?? item.email ?? '',
      // Tipo de usuario: “Tipo_Usuario” o “role”
      Tipo_Usuario: item.Tipo_Usuario ?? item.role ?? '',
      // Dirección: “Direccion” o “address”
      Direccion: item.Direccion ?? item.address ?? '',
      // Teléfono: “Telefono” o “phone”
      Telefono: item.Telefono ?? item.phone ?? '',
      // created_at: suponemos que la API devuelve “created_at”
      created_at: item.created_at ?? item.createdAt ?? '',
    }));
  });

  // 2) Mantenemos los usuarios ya normalizados
  const users: UserRow[] = usersData ?? [];

  // 3) Estado y lógica de filtro
  const [filter, setFilter] = useState('');
  const filteredUsers = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) =>
      u.Nombre.toLowerCase().includes(term)
    );
  }, [users, filter]);

  // 4) Handler para “Editar” (ahora solo hace console.log)
  const handleEdit = useCallback((id: number) => {
    console.log('Editar usuario:', id);
    // Si quisieras navegar a "/admin/users/{id}/edit", por ejemplo:
    // router.push(`/admin/users/${id}/edit`);
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
          <Button onClick={() => { /* podrías aplicar algo más aquí */ }}>
            Filter
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">ID</TableHead>
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
