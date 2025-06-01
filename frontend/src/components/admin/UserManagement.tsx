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
import { Edit3, Trash2 } from 'lucide-react';

// Función para formatear fechas al estilo "dd/MM/yyyy, hh:mm"
function formatDate(dateStr: string) {
  // Se reemplaza el espacio por 'T' para mayor compatibilidad
  const date = new Date(dateStr.replace(' ', 'T'));
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Definimos la forma que usará nuestra tabla
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
  // 1) Estado para refrescar la lista tras eliminar un usuario
  const [refresh, setRefresh] = useState(0);

  // 2) Traemos la data cruda de la API (el hook se recarga al cambiar "refresh")
  const {
    data: usersData,
    loading: loadingUsers,
    error: usersError,
  } = useFetchData<UserRow[]>('/api/users', (json) => {
    const rawArray: any[] = Array.isArray(json)
      ? json
      : Array.isArray((json as any).users)
      ? (json as any).users
      : [];
    return rawArray.map((item) => ({
      ID_Usuario: item.ID_Usuario ?? item.id ?? item.userId ?? 0,
      Nombre: item.Nombre ?? item.name ?? '',
      Correo: item.Correo ?? item.email ?? '',
      Tipo_Usuario: item.Tipo_Usuario ?? item.role ?? '',
      Direccion: item.Direccion ?? item.address ?? '',
      Telefono: item.Telefono ?? item.phone ?? '',
      created_at: item.created_at ?? item.createdAt ?? '',
    }));
  }, [refresh]);

  // 2) Normalizamos la lista de usuarios
  const users: UserRow[] = usersData ?? [];

  // 3) Estado y lógica de filtro
  const [filter, setFilter] = useState('');
  const filteredUsers = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => u.Nombre.toLowerCase().includes(term));
  }, [users, filter]);

  // 4) Handler para editar usuario (puedes reemplazar con navegación)
  const handleEdit = useCallback((id: number) => {
    console.log('Editar usuario:', id);
    // Por ejemplo, redirigir a `/admin/users/${id}/edit`
  }, []);

  // 5) Handler para eliminar usuario
  const handleDelete = useCallback((id: number) => {
    if (!window.confirm('¿Estás seguro de querer eliminar este usuario?')) return;
    fetch('/api/users/delete?route=api/users/delete', {
      method: 'DELETE', // O "POST" si el backend lo requiere
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Asegúrate de enviar la cookie de sesión
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRefresh((r) => r + 1);
        } else {
          alert(data.error || 'No se pudo eliminar el usuario');
        }
      })
      .catch(() => {
        alert('Error al eliminar el usuario');
      });
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
          <Button onClick={() => { /* Acción extra si es necesario */ }}>
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
                    <Button
                      aria-label={`Eliminar usuario ${u.Nombre}`}
                      onClick={() => handleDelete(u.ID_Usuario)}
                      variant="outline"
                      className="ml-2"
                    >
                      <Trash2 size={16} />
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
