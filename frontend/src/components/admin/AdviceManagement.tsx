// src/components/admin/AdviceManagement.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../ui/table';
import { Button } from '../ui/button';

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  if (!isNaN(Number(dateStr))) {
    const date = new Date(Number(dateStr) * 1000);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  const fixed = dateStr.replace(' ', 'T');
  const date = new Date(fixed);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Advice {
  ID_Advice: number;
  title: string;
  description: string;
  articulo: string | null;
  stage: 'before' | 'while' | 'after' | string;
  created_at: string;
  updated_at: string;
}

const emptyAdvice: Omit<Advice, 'ID_Advice' | 'created_at' | 'updated_at'> = {
  title: '',
  description: '',
  articulo: '',
  stage: 'before',
};

export default function AdviceManagement() {
  const [localAdvice, setLocalAdvice] = useState<Advice[]>([]);
  const [loadingAdvice, setLoadingAdvice] = useState(true);
  const [adviceError, setAdviceError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAdvice, setEditingAdvice] = useState<Advice | null>(null);
  const [form, setForm] = useState(emptyAdvice);

  // Fetch advice
  useEffect(() => {
    fetchAdvice();
  }, []);

  async function fetchAdvice() {
    setLoadingAdvice(true);
    setAdviceError(null);
    try {
      const res = await fetch(
        'http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/admin/advice',
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error loading advice');
      }
      const json = await res.json();
      const arr: any[] = Array.isArray(json.advice) ? json.advice : [];
      const parsed: Advice[] = arr.map((item) => ({
        ID_Advice:
          item.ID_Advice ??
          item.id_advice ??
          item.ID ??
          item.id ??
          0,
        title: item.title ?? '',
        description: item.description ?? '',
        articulo: item.articulo ?? null,
        stage: item.stage ?? '',
        created_at: item.created_at ?? item.createdAt ?? '',
        updated_at: item.updated_at ?? item.updatedAt ?? '',
      }));
      setLocalAdvice(parsed);
    } catch (err: any) {
      setAdviceError(err.message);
    } finally {
      setLoadingAdvice(false);
    }
  }

  // Filtro
  const [filter, setFilter] = useState('');
  const filteredAdvice = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return localAdvice;
    return localAdvice.filter((a) => {
      return (
        a.title.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term)
      );
    });
  }, [localAdvice, filter]);

  // Eliminar
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('¿Seguro que quieres borrar este consejo?')) return;
    try {
      const res = await fetch(
        `http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/admin/advice/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error deleting advice');
      }
      setLocalAdvice((prev) =>
        prev.filter((item) => item.ID_Advice !== id)
      );
    } catch (err: any) {
      alert('No se pudo borrar el consejo: ' + err.message);
    }
  }, []);

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingAdvice(null);
    setForm(emptyAdvice);
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEdit = (advice: Advice) => {
    setEditingAdvice(advice);
    setForm({
      title: advice.title,
      description: advice.description,
      articulo: advice.articulo ?? '',
      stage: advice.stage,
    });
    setShowModal(true);
  };

  // Guardar (crear o editar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!editingAdvice;
      const url = isEdit
        ? `http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/admin/advice/${editingAdvice?.ID_Advice}`
        : 'http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/admin/advice';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Error guardando consejo');
      }
      setShowModal(false);
      setEditingAdvice(null);
      setForm(emptyAdvice);
      fetchAdvice();
    } catch (err: any) {
      alert('No se pudo guardar: ' + err.message);
    }
  };

  return (
    <Card>
      {/* ------------------------------------------------- */}
      {/* Renderizado condicional “inline” del Modal:      */}
      {/* ------------------------------------------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow-lg min-w-[350px] max-w-[90vw]"
            onSubmit={handleSave}
          >
            <h2 className="text-lg font-bold mb-4">
              {editingAdvice ? 'Editar consejo' : 'Nuevo consejo'}
            </h2>
            <div className="mb-2">
              <label className="block text-sm mb-1">Título</label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">Descripción</label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">
                Artículo (opcional, URL)
              </label>
              <Input
                value={form.articulo ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, articulo: e.target.value }))
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Etapa</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={form.stage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stage: e.target.value as any }))
                }
                required
              >
                <option value="before">Antes</option>
                <option value="while">Durante</option>
                <option value="after">Después</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingAdvice ? 'Guardar' : 'Crear'}
              </Button>
            </div>
          </form>
        </div>
      )}
      {/* ------------------------------------------------- */}

      <CardHeader className="flex items-center justify-between">
        <CardTitle>Advice Management</CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Search advice..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button onClick={handleCreate}>Nuevo consejo</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">ID</TableHead>
                <TableHead scope="col">Title</TableHead>
                <TableHead scope="col" className="max-w-[250px]">
                  Description
                </TableHead>
                <TableHead scope="col">Artículo</TableHead>
                <TableHead scope="col">Stage</TableHead>
                <TableHead scope="col">Created At</TableHead>
                <TableHead scope="col">Updated At</TableHead>
                <TableHead scope="col">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAdvice ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : adviceError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-red-500 py-4"
                  >
                    {adviceError}
                  </TableCell>
                </TableRow>
              ) : filteredAdvice.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No advice found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdvice.map((a) => (
                  <TableRow key={a.ID_Advice}>
                    <TableCell>{a.ID_Advice}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {a.title}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {a.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {a.articulo ? (
                        <a
                          href={a.articulo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Link
                        </a>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="uppercase">{a.stage}</TableCell>
                    <TableCell>{formatDate(a.created_at)}</TableCell>
                    <TableCell>{formatDate(a.updated_at)}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        onClick={() => handleEdit(a)}
                        className="text-gray-700 hover:text-gray-900"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(a.ID_Advice)}
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
