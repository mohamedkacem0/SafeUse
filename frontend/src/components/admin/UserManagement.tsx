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
import { Edit3, Trash2, Ban } from 'lucide-react';

function formatDate(dateStr: string) {
  const date = new Date(dateStr.replace(' ', 'T'));
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
  const [refresh, setRefresh] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<UserRow>>({});
  const [editError, setEditError] = useState<string | null>(null);

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
  });

  const users: UserRow[] = usersData ?? [];

  const [filter, setFilter] = useState('');
  const filteredUsers = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => u.Nombre.toLowerCase().includes(term));
  }, [users, filter]);

  const handleEdit = useCallback((id: number) => {
    const user = users.find(u => u.ID_Usuario === id);
    if (user) {
      setEditingId(id);
      setEditValues({
        Nombre: user.Nombre,
        Telefono: user.Telefono,
        Direccion: user.Direccion,
        Correo: user.Correo,
      });
      setEditError(null);
    }
  }, [users]);

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (editingId === null) return;

    const payload = {
      id: editingId,
      Nombre: editValues.Nombre ?? '',
      Correo: editValues.Correo ?? '',
      Direccion: editValues.Direccion ?? '',
      Telefono: editValues.Telefono ?? '',
    };

    try {
      const res = await fetch(
        "http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/users/updateUserByAdmin",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        setEditValues({});
        setEditError(null);
        setRefresh(r => r + 1);
        window.location.reload(); 
      } else {
        setEditError(data.error || "No se pudo actualizar el usuario");
      }
    } catch {
      setEditError("Error al actualizar el usuario");
    }
  };

  const handleDelete = useCallback((id: number) => {
    if (!window.confirm('¿Estás seguro de querer eliminar este usuario?')) return;
    fetch(
      'http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/users/delete',
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRefresh((r) => r + 1);
          window.location.reload(); 
        } else {
          alert(data.error || 'No se pudo eliminar el usuario');
        }
      })
      .catch(() => {
        alert('Error al eliminar el usuario');
      });
  }, [refresh]);

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
                  <TableCell>
                    {editingId === u.ID_Usuario ? (
                      <input
                        value={editValues.Nombre ?? ''}
                        onChange={e => setEditValues(v => ({ ...v, Nombre: e.target.value }))}
                        className="border px-2 py-1"
                      />
                    ) : u.Nombre}
                  </TableCell>
                  <TableCell>
                    {editingId === u.ID_Usuario ? (
                      <input
                        value={editValues.Correo ?? ''}
                        onChange={e => setEditValues(v => ({ ...v, Correo: e.target.value }))}
                        className="border px-2 py-1"
                        type="email"
                      />
                    ) : u.Correo}
                  </TableCell>
                  <TableCell>{u.Tipo_Usuario}</TableCell>
                  <TableCell>
                    {editingId === u.ID_Usuario ? (
                      <input
                        value={editValues.Direccion ?? ''}
                        onChange={e => setEditValues(v => ({ ...v, Direccion: e.target.value }))}
                        className="border px-2 py-1"
                      />
                    ) : u.Direccion}
                  </TableCell>
                  <TableCell>
                    {editingId === u.ID_Usuario ? (
                      <input
                        value={editValues.Telefono ?? ''}
                        onChange={e => setEditValues(v => ({ ...v, Telefono: e.target.value }))}
                        className="border px-2 py-1"
                      />
                    ) : u.Telefono}
                  </TableCell>
                  <TableCell>{formatDate(u.created_at)}</TableCell>
                  <TableCell>
                    {u.Tipo_Usuario === 'admin' ? (
                      // Si es admin, muestra icono de prohibición y tooltip
                      <span title="No puedes editar ni eliminar un admin">
                        <Ban size={20} className="text-gray-400 mx-auto" />
                      </span>
                    ) : editingId === u.ID_Usuario ? (
                      <>
                        <Button onClick={handleSaveEdit} variant="default" className="mr-2">
                          Guardar
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline">
                          Cancelar
                        </Button>
                        {editError && (
                          <div className="text-red-500 text-xs">{editError}</div>
                        )}
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
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
