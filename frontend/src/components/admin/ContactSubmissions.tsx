// src/components/admin/ContactSubmissions.tsx
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

interface ContactSubmission {
  ID_Submission: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string;
  checked: number;
  created_at: string;
}

export default function ContactSubmissions() {
  // 1) Carga inicial desde la API
  const {
    data: submissionsData,
    loading: loadingSubmissions,
    error: submissionsError,
  } = useFetchData<ContactSubmission[]>('/api/contact', (json) => {
    const rawArray: any[] = Array.isArray(json)
      ? json
      : Array.isArray((json as any).contact_submission)
      ? (json as any).contact_submission
      : [];

    return rawArray.map((item) => ({
      ID_Submission:
        item.ID_Submission ??
        item.id_submission ??
        item.ID ??
        item.id ??
        0,
      first_name: item.first_name ?? item.firstName ?? '',
      last_name: item.last_name ?? item.lastName ?? '',
      email: item.email ?? '',
      phone: item.phone ?? null,
      message: item.message ?? '',
      checked:
        typeof item.checked === 'number'
          ? item.checked
          : item.checked === '1' || item.checked === 'true'
          ? 1
          : 0,
      created_at: item.created_at ?? item.createdAt ?? '',
    }));
  });

  // 2) Mantener una copia local para poder actualizar tras borrar/toggle
  const [localSubmissions, setLocalSubmissions] = useState<ContactSubmission[]>([]);

  useEffect(() => {
    if (submissionsData) {
      setLocalSubmissions(submissionsData);
    }
  }, [submissionsData]);

  // 3) Filtro sencillo
  const [filter, setFilter] = useState('');
  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return localSubmissions;
    return localSubmissions.filter((s) => {
      const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
      return (
        fullName.includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.phone ?? '').toLowerCase().includes(term)
      );
    });
  }, [localSubmissions, filter]);

  // 4) Función que borra una submission dado su ID
  const handleDelete = useCallback(async (id: number) => {
    // Confirmación opcional
    if (!confirm('¿Seguro que quieres borrar esta submission?')) return;

    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Error al borrar la submission');
      }
      // Si el DELETE fue OK, actualizamos el estado local para remover la fila
      setLocalSubmissions((prev) =>
        prev.filter((item) => item.ID_Submission !== id)
      );
    } catch (err) {
      console.error(err);
      alert('No se pudo borrar la submission.');
    }
  }, []);

  // 5) Función que cambia el estado "checked" (0 ó 1)
  const handleToggleChecked = useCallback(
    async (id: number, current: number) => {
      const newChecked = current === 1 ? 0 : 1;

      try {
        const res = await fetch(`/api/contact/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checked: newChecked }),
        });
        if (!res.ok) {
          throw new Error('Error al actualizar el estado');
        }
        // Si el PUT fue OK, actualizamos localmente solo ese registro
        setLocalSubmissions((prev) =>
          prev.map((item) =>
            item.ID_Submission === id
              ? { ...item, checked: newChecked }
              : item
          )
        );
      } catch (err) {
        console.error(err);
        alert('No se pudo actualizar el estado.');
      }
    },
    []
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Contact Submissions</CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Search submissions..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button onClick={() => { /* opcional */ }}>
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">ID</TableHead>
                <TableHead scope="col">First Name</TableHead>
                <TableHead scope="col">Last Name</TableHead>
                <TableHead scope="col">Email</TableHead>
                <TableHead scope="col">Phone</TableHead>
                <TableHead scope="col" className="max-w-[300px]">
                  Message
                </TableHead>
                <TableHead scope="col">Checked</TableHead>
                <TableHead scope="col">Created At</TableHead>
                <TableHead scope="col">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingSubmissions ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : submissionsError ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-red-500 py-4">
                    Error loading submissions
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.ID_Submission}>
                    <TableCell>{s.ID_Submission}</TableCell>
                    <TableCell>{s.first_name}</TableCell>
                    <TableCell>{s.last_name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.phone ?? '—'}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {s.message}
                    </TableCell>
                    <TableCell className="text-center">
                      {/* Aquí asignamos la función al checkbox */}
                      <input
                        type="checkbox"
                        checked={s.checked === 1}
                        onChange={() =>
                          handleToggleChecked(s.ID_Submission, s.checked)
                        }
                      />
                    </TableCell>
                    <TableCell>{formatDate(s.created_at)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {/* Aquí asignamos la función al botón */}
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(s.ID_Submission)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
