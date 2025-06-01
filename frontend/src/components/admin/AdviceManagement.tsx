// src/components/admin/AdviceManagement.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useFetchData } from '../../pages/admin/useFetchData';
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
  // Si es timestamp numérico (MySQL puede devolverlo así)
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
  // Si es string tipo "2024-06-01 12:34:56"
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

export default function AdviceManagement() {
  // 1) Fetch de consejos (advice) desde la API
  const {
    data: adviceData,
    loading: loadingAdvice,
    error: adviceError,
  } = useFetchData<Advice[]>('/api/advice', (json) => {
    // La API podría devolver un array directo o un objeto { advice: [...] }
    const rawArray: any[] = Array.isArray(json)
      ? json
      : Array.isArray((json as any).advice)
      ? (json as any).advice
      : [];

    return rawArray.map((item) => ({
      ID_Advice:
        item.ID_Advice ??
        item.id_advice ??
        item.idAdvice ??
        item.id ??
        0,
      title: item.title ?? '',
      description: item.description ?? '',
      articulo: item.articulo ?? null,
      stage: item.stage ?? '',
      created_at: item.created_at ?? item.createdAt ?? '',
      updated_at: item.updated_at ?? item.updatedAt ?? '',
    }));
  });

  const [localAdvice, setLocalAdvice] = useState<Advice[]>([]);

  // 2) Sincronizar copia local con lo que llega de la API
  useEffect(() => {
    if (adviceData) {
      setLocalAdvice(adviceData);
    }
  }, [adviceData]);

  // 3) Filtro por título o descripción
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

  // 4) Opcional: handler para hacer algo al editar (si se extiende en el futuro)
  const handleEdit = useCallback((id: number) => {
    console.log('Editar consejo con ID:', id);
    // Aquí podrías navegar a una página de edición:
    // router.push(`/admin/advice/${id}/edit`);
  }, []);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Advice Management</CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Search advice..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
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
                <TableHead scope="col">Edit</TableHead>
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
                  <TableCell colSpan={8} className="text-center text-red-500 py-4">
                    Error loading advice
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
                    <TableCell className="whitespace-nowrap">{a.title}</TableCell>
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
                    <TableCell>
                      <Button
                        onClick={() => handleEdit(a.ID_Advice)}
                        className="text-gray-700 hover:text-gray-900"
                      >
                        Edit
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

