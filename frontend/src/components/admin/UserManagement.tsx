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
  password?: string; // <-- Añadido para el hash bcrypt
}

export default function UserManagement() {
  const [refresh, setRefresh] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<UserRow & { password?: string }>>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [addUserValues, setAddUserValues] = useState<Partial<UserRow & { password?: string }>>({});
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);
  const [isAddUserFormVisible, setIsAddUserFormVisible] = useState(false);

  const handleShowAddUserForm = () => {
    setAddUserValues({}); // Reset form fields
    setAddUserError(null);
    setAddUserSuccess(null);
    setIsAddUserFormVisible(true);
  };

  const handleCancelAddUser = () => {
    setIsAddUserFormVisible(false);
    setAddUserValues({});
    setAddUserError(null);
    setAddUserSuccess(null);
  };

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
      password: item.password ?? '', // <-- Añadido
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
        password: '', // <-- Añadido para el input de nueva contraseña
      });
      setEditError(null);
    }
  }, [users]);

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
    setEditError(null);
    setResetError(null); // Added to match existing inline cancel logic
  };

  const handleSaveEdit = async () => {
    if (editingId === null) return;

    const payload: any = {
      id: editingId,
      Nombre: editValues.Nombre ?? '',
      Correo: editValues.Correo ?? '',
      Direccion: editValues.Direccion ?? '',
      Telefono: editValues.Telefono ?? '',
    };
    if (editValues.password && editValues.password.trim()) {
      payload.password = editValues.password;
    }

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
        setResetError(null);
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

  const handleAddUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setAddUserError(null);
    setAddUserSuccess(null);

    // Validación básica
    if (
      !addUserValues.Nombre ||
      !addUserValues.Correo ||
      !addUserValues.password 
    ) {
      setAddUserError('Todos los campos obligatorios deben estar completos.');
      return;
    }

    setAddUserLoading(true);

    try {
      const res = await fetch(
  'http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/admin/users/addUser',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      Nombre: addUserValues.Nombre,
      Correo: addUserValues.Correo,
      password: addUserValues.password,      // coincide con la clave que espera el controlador
      // NO hace falta enviar Tipo_Usuario, pero si lo envías, el backend lo ignora
      // Tipo_Usuario: "usuario",
      Direccion: addUserValues.Direccion ?? '',
      Telefono: addUserValues.Telefono ?? '',
    }),
  }
);

      const data = await res.json();
      if (data.success) {
        setAddUserSuccess('Usuario añadido correctamente');
        setAddUserValues({}); // Limpiar formulario
        setIsAddUserFormVisible(false); // Hide form
        setRefresh((r) => r + 1); // Refrescar la lista de usuarios
      } else {
        setAddUserError(data.error || 'No se pudo crear el usuario');
      }
    } catch {
      setAddUserError('Error al crear el usuario');
    } finally {
      setAddUserLoading(false);
    }
  };

  return (
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <CardTitle className="mb-2 sm:mb-0">User Management</CardTitle>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Input
              placeholder="Search users..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-grow sm:flex-grow-0"
            />
          </div>
        </CardHeader>
        <CardContent>
          {!isAddUserFormVisible && (
            <Button onClick={handleShowAddUserForm} className="mb-4">
              Add New User
            </Button>
          )}
          {isAddUserFormVisible && (
            <form onSubmit={handleAddUser} className="mb-6 flex flex-wrap gap-2 items-end bg-gray-50 p-4 rounded">
              {/* Form inputs remain the same as before */}
              <Input
                placeholder="Nombre"
                value={addUserValues.Nombre ?? ''}
                onChange={e => setAddUserValues(v => ({ ...v, Nombre: e.target.value }))}
                required
                className="w-full sm:w-40"
              />
              <Input
                placeholder="Correo"
                type="email"
                value={addUserValues.Correo ?? ''}
                onChange={e => setAddUserValues(v => ({ ...v, Correo: e.target.value }))}
                required
                className="w-full sm:w-40"
              />
              <Input
                placeholder="Contraseña"
                type="password"
                value={addUserValues.password ?? ''}
                onChange={e => setAddUserValues(v => ({ ...v, password: e.target.value }))}
                required
                className="w-full sm:w-40"
              />
              <Input
                placeholder="Rol"
                value="usuario"
                disabled
                className="w-full sm:w-32 bg-gray-100 text-gray-500"
              />
              <Input
                placeholder="Dirección"
                value={addUserValues.Direccion ?? ''}
                onChange={e => setAddUserValues(v => ({ ...v, Direccion: e.target.value }))}
                className="w-full sm:w-40"
              />
              <Input
                placeholder="Teléfono"
                value={addUserValues.Telefono ?? ''}
                onChange={e => setAddUserValues(v => ({ ...v, Telefono: e.target.value }))}
                className="w-full sm:w-32"
              />
              <div className="flex w-full sm:w-auto">
                <Button type="submit" disabled={addUserLoading} className="flex-grow sm:flex-grow-0">
                  {addUserLoading ? 'Adding...' : 'Add User'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelAddUser} className="ml-2 flex-grow sm:flex-grow-0">
                  Cancel
                </Button>
              </div>
              {addUserError && <span className="text-red-500 ml-4 w-full">{addUserError}</span>}
              {addUserSuccess && <span className="text-green-600 ml-4 w-full">{addUserSuccess}</span>}
            </form>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">ID</TableHead>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Email</TableHead>
                <TableHead scope="col">Role</TableHead>
                <TableHead scope="col">Direccion</TableHead>
                <TableHead scope="col">Telefono</TableHead>
                <TableHead scope="col">Password</TableHead> {/* Nueva columna */}
                <TableHead scope="col">Created At</TableHead>
                <TableHead scope="col">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingUsers ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : usersError ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-red-500 py-4">
                    Error loading users
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
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
                      ) : u.Nombre?.trim() ? u.Nombre : <span className="text-gray-400 italic">No name</span>}
                    </TableCell>
                    <TableCell>
                      {editingId === u.ID_Usuario ? (
                        <input
                          value={editValues.Correo ?? ''}
                          onChange={e => setEditValues(v => ({ ...v, Correo: e.target.value }))}
                          className="border px-2 py-1"
                          type="email"
                        />
                      ) : u.Correo?.trim() ? u.Correo : <span className="text-gray-400 italic">No mail</span>}
                    </TableCell>
                    <TableCell>
                      {u.Tipo_Usuario?.trim() ? u.Tipo_Usuario : <span className="text-gray-400 italic">No rol</span>}
                    </TableCell>
                    <TableCell>
                      {editingId === u.ID_Usuario ? (
                        <input
                          value={editValues.Direccion ?? ''}
                          onChange={e => setEditValues(v => ({ ...v, Direccion: e.target.value }))}
                          className="border px-2 py-1"
                        />
                      ) : u.Direccion?.trim() ? u.Direccion : <span className="text-gray-400 italic">No address</span>}
                    </TableCell>
                    <TableCell>
                      {editingId === u.ID_Usuario ? (
                        <input
                          value={editValues.Telefono ?? ''}
                          onChange={e => setEditValues(v => ({ ...v, Telefono: e.target.value }))}
                          className="border px-2 py-1"
                        />
                      ) : u.Telefono?.trim() ? u.Telefono : <span className="text-gray-400 italic">No phone number</span>}
                    </TableCell>
                    {/* Password */}
                    <TableCell>
                      {editingId === u.ID_Usuario ? (
                        <input
                          type="password"
                          value={editValues.password ?? ''}
                          onChange={e => setEditValues(v => ({ ...v, password: e.target.value }))}
                          placeholder="Nueva contraseña"
                          className="border px-2 py-1"
                        />
                      ) : (
                        '••••••'
                      )}
                      {resetError && editingId === u.ID_Usuario && (
                        <div className="text-red-500 text-xs">{resetError}</div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(u.created_at)}</TableCell>
                    <TableCell>
                      {u.Tipo_Usuario === 'admin' ? (
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
