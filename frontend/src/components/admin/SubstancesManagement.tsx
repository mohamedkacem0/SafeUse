// src/components/Admin/SubstancesManagement.tsx
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

interface SubstanceBasic {
  ID_Sustancia: number;
  Nombre: string;
  Imagen: string;
  Titulo: string;
  Formula: string;
}

interface SubstanceDetail {
  ID_Sustancia: number;
  descripcion: string | null;
  metodos_consumo: string | null;
  efectos_deseados: string | null;
  composicion: string | null;
  riesgos: string | null;
  interaccion_otras_sustancias: string | null;
  reduccion_riesgos: string | null;
  legislacion: string | null;
}

interface SubstanceMerged {
  ID_Sustancia: number;
  Nombre: string;
  Imagen: string;
  Titulo: string;
  Formula: string;
  descripcion: string | null;
  metodos_consumo: string | null;
  efectos_deseados: string | null;
  composicion: string | null;
  riesgos: string | null;
  interaccion_otras_sustancias: string | null;
  reduccion_riesgos: string | null;
  legislacion: string | null;
}

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

export default function SubstancesManagement() {
  // 1) Fetch lista básica de sustancias
  const {
    data: basicListData,
    loading: loadingBasicList,
    error: basicListError,
  } = useFetchData<SubstanceBasic[]>('/api/sustancias', (json) => {
    const arr: any[] = Array.isArray(json)
      ? json
      : Array.isArray((json as any).sustancias)
      ? (json as any).sustancias
      : [];
    return arr.map((item) => ({
      ID_Sustancia: item.ID_Sustancia,
      Nombre: item.Nombre,
      Imagen: item.Imagen,
      Titulo: item.Titulo,
      Formula: item.Formula,
    }));
  });
  const basicList = basicListData ?? [];

  // 2) Fetch detalles de sustancias
  const {
    data: detailListData,
    loading: loadingDetailList,
    error: detailListError,
  } = useFetchData<SubstanceDetail[]>('/api/detalles_sustancias', (json) => {
    const arr: any[] = Array.isArray(json)
      ? json
      : Array.isArray((json as any).detalles)
      ? (json as any).detalles
      : [];
    return arr.map((item) => ({
      ID_Sustancia: item.ID_Sustancia,
      descripcion: item.descripcion ?? null,
      metodos_consumo: item.metodos_consumo ?? null,
      efectos_deseados: item.efectos_deseados ?? null,
      composicion: item.composicion ?? null,
      riesgos: item.riesgos ?? null,
      interaccion_otras_sustancias: item.interaccion_otras_sustancias ?? null,
      reduccion_riesgos: item.reduccion_riesgos ?? null,
      legislacion: item.legislacion ?? null,
    }));
  });
  const detailList = detailListData ?? [];

  // 3) Unir ambas listas por ID_Sustancia
  const mergedSubstances: SubstanceMerged[] = useMemo(() => {
    const detalleMap = detailList.reduce<Record<number, SubstanceDetail>>(
      (acc, det) => {
        acc[det.ID_Sustancia] = det;
        return acc;
      },
      {}
    );

    return basicList.map((basic) => {
      const det = detalleMap[basic.ID_Sustancia] || {
        ID_Sustancia: basic.ID_Sustancia,
        descripcion: null,
        metodos_consumo: null,
        efectos_deseados: null,
        composicion: null,
        riesgos: null,
        interaccion_otras_sustancias: null,
        reduccion_riesgos: null,
        legislacion: null,
      };
      return {
        ID_Sustancia: basic.ID_Sustancia,
        Nombre: basic.Nombre,
        Imagen: basic.Imagen,
        Titulo: basic.Titulo,
        Formula: basic.Formula,
        descripcion: det.descripcion,
        metodos_consumo: det.metodos_consumo,
        efectos_deseados: det.efectos_deseados,
        composicion: det.composicion,
        riesgos: det.riesgos,
        interaccion_otras_sustancias: det.interaccion_otras_sustancias,
        reduccion_riesgos: det.reduccion_riesgos,
        legislacion: det.legislacion,
      };
    });
  }, [basicList, detailList]);

  // Estado y filtro para la tabla
  const [filter, setFilter] = useState('');
  const filteredSubstances = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return mergedSubstances;
    return mergedSubstances.filter((s) =>
      s.Nombre.toLowerCase().includes(term)
    );
  }, [mergedSubstances, filter]);

  const handleEdit = useCallback((id: number) => {
    console.log('Editar sustancia:', id);
  }, []);

  return (
    <Card>
      {/* Search bar y título en la misma línea */}
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[20px] font-semibold">Substance Management</span>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search substances..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button onClick={() => { /* opcional */ }}>
              Filter
            </Button>
          </div>
        </div>

        {/* Tabla responsiva */}
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">ID</TableHead>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Image</TableHead>
                <TableHead scope="col" className="max-w-[150px]">Title</TableHead>
                <TableHead scope="col" className="max-w-[120px]">Formula</TableHead>
                <TableHead scope="col" className="max-w-[200px]">Description</TableHead>
                <TableHead scope="col" className="max-w-[200px]">Consumption Methods</TableHead>
                <TableHead scope="col" className="max-w-[200px]">Desired Effects</TableHead>
                <TableHead scope="col" className="max-w-[200px]">Composition</TableHead>
                <TableHead scope="col" className="max-w-[200px]">Risks</TableHead>
                <TableHead scope="col" className="max-w-[200px]">Interaction</TableHead>
                <TableHead scope="col" className="max-w-[200px]">Risk Reduction</TableHead>
                <TableHead scope="col" className="max-w-[200px]">Legislation</TableHead>
                <TableHead scope="col">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Estados: loading, error, vacío, datos */}
              {loadingBasicList || loadingDetailList ? (
                <TableRow>
                  <TableCell colSpan={15} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : basicListError || detailListError ? (
                <TableRow>
                  <TableCell colSpan={15} className="text-center text-red-500 py-4">
                    Error loading substances
                  </TableCell>
                </TableRow>
              ) : filteredSubstances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="text-center py-4">
                    No substances found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubstances.map((s) => (
                  <TableRow key={s.ID_Sustancia}>
                    <TableCell>{s.ID_Sustancia}</TableCell>
                    <TableCell className="whitespace-nowrap">{s.Nombre}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <img
                        src={s.Imagen}
                        alt={s.Nombre}
                        loading="lazy"
                        className="h-8 w-8 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">{s.Titulo}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{s.Formula}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{s.descripcion}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{s.metodos_consumo}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{s.efectos_deseados}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{s.composicion}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{s.riesgos}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{s.interaccion_otras_sustancias}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{s.reduccion_riesgos}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{s.legislacion}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button
                        aria-label={`Editar sustancia ${s.Nombre}`}
                        onClick={() => handleEdit(s.ID_Sustancia)}
                      >
                        <Edit3 size={16} />
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
