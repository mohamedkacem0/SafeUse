 
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
 
  const [showModal, setShowModal] = useState(false);
  const [editingAdvice, setEditingAdvice] = useState<Advice | null>(null);
  const [form, setForm] = useState(emptyAdvice);
 
  const fetchAdvice = useCallback(async () => {
    setLoadingAdvice(true);
    setAdviceError(null);
    try {
      const res = await fetch(
        '/api/admin/advice',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error loading advice');
      }
      const json = await res.json();
      
      type AdviceItem = {
        ID_Advice?: number; id_advice?: number; ID?: number; id?: number;
        title?: string; description?: string; articulo?: string | null;
        stage?: string; created_at?: string; createdAt?: string;
        updated_at?: string; updatedAt?: string;
      };

      const arr: AdviceItem[] = Array.isArray(json.advice) ? json.advice : [];
      const parsed: Advice[] = arr.map((item) => ({
        ID_Advice: item.ID_Advice ?? item.id_advice ?? item.ID ?? item.id ?? 0,
        title: item.title ?? '',
        description: item.description ?? '',
        articulo: item.articulo ?? null,
        stage: item.stage ?? '',
        created_at: item.created_at ?? item.createdAt ?? '',
        updated_at: item.updated_at ?? item.updatedAt ?? '',
      }));
      setLocalAdvice(parsed);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAdviceError(err.message);
      } else {
        setAdviceError('An unknown error occurred');
      }
    } finally {
      setLoadingAdvice(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice]);

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
 
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Are you sure you want to delete this advice?')) return;
    try {
      const res = await fetch(
        `/api/admin/advice/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error deleting advice');
      }
      setLocalAdvice((prev) =>
        prev.filter((item) => item.ID_Advice !== id)
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert('Could not delete advice: ' + err.message);
      } else {
        alert('An unknown error occurred while deleting advice.');
      }
    }
  }, []);
 
  const handleCreate = () => {
    setEditingAdvice(null);
    setForm(emptyAdvice);
    setShowModal(true);
  };
 
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
  
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const isEdit = !!editingAdvice;
      const url = isEdit
        ? `/api/admin/advice/${editingAdvice?.ID_Advice}`
        : '/api/admin/advice';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Error saving advice');
      }
      setShowModal(false);
      setEditingAdvice(null);
      setForm(emptyAdvice);
      fetchAdvice();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert('Could not save advice: ' + err.message);
      } else {
        alert('An unknown error occurred while saving advice.');
      }
    }
  };

  return (
    <Card> 
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow-lg min-w-[350px] max-w-[90vw]"
            onSubmit={handleSave}
          >
            <h2 className="text-lg font-bold mb-4">
              {editingAdvice ? 'Edit Advice' : 'New Advice'}
            </h2>
            <div className="mb-2">
              <label className="block text-sm mb-1" htmlFor="title">Title</label>
              <Input
                id="title"
                value={form.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1" htmlFor="description">Description</label>
              <Input
                id="description"
                value={form.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1" htmlFor="articulo">
                Article (optional, URL)
              </label>
              <Input
                id="articulo"
                value={form.articulo ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, articulo: e.target.value }))
                }
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1" htmlFor="stage">Stage</label>
              <select
                id="stage"
                className="w-full border rounded px-2 py-1"
                value={form.stage}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm((f) => ({ ...f, stage: e.target.value as 'before' | 'while' | 'after' }))
                }
                required
              >
                <option value="before">Before</option>
                <option value="while">During</option>
                <option value="after">After</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingAdvice ? 'Save Changes' : 'Create Advice'}
              </Button>
            </div>
          </form>
        </div>
      )} 

      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Advice Management</CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Search advice..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleCreate}>New Advice</Button>
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
                <TableHead scope="col">Article</TableHead>
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
                    Loading advice...
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
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(a)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
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
