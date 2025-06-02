// src/components/Admin/SubstancesManagement.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { useFetchData } from '../../pages/admin/useFetchData';
import {
  Card,
  CardContent,
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

export default function SubstancesManagement() {
  // State for the "Add New Substance" form
  const [newSubstanceName, setNewSubstanceName] = useState('');
  const [newSubstanceImage, setNewSubstanceImage] = useState<File | null>(null);
  const [newSubstanceTitle, setNewSubstanceTitle] = useState('');
  const [newSubstanceFormula, setNewSubstanceFormula] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [metodosConsumo, setMetodosConsumo] = useState('');
  const [efectosDeseados, setEfectosDeseados] = useState('');
  const [composicion, setComposicion] = useState('');
  const [riesgos, setRiesgos] = useState('');
  const [interaccionOtrasSustancias, setInteraccionOtrasSustancias] = useState('');
  const [reduccionRiesgos, setReduccionRiesgos] = useState('');
  const [legislacion, setLegislacion] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // State to control form visibility

  // Function to handle form submission
  const handleAddSubstance = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsAdding(true);
    setAddError(null);
    setAddSuccess(null);

    if (!newSubstanceName || !newSubstanceImage || !newSubstanceTitle || !newSubstanceFormula) { // Check if newSubstanceImage is null
      setAddError('All fields are required.');
      setIsAdding(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('Nombre', newSubstanceName);
      formData.append('Titulo', newSubstanceTitle);
      formData.append('Formula', newSubstanceFormula);
      if (newSubstanceImage) {
        formData.append('Imagen', newSubstanceImage);
      }
      formData.append('descripcion', descripcion);
      formData.append('metodos_consumo', metodosConsumo);
      formData.append('efectos_deseados', efectosDeseados);
      formData.append('composicion', composicion);
      formData.append('riesgos', riesgos);
      formData.append('interaccion_otras_sustancias', interaccionOtrasSustancias);
      formData.append('reduccion_riesgos', reduccionRiesgos);
      formData.append('legislacion', legislacion);

      const response = await fetch('/api/admin/substances/add', {
        method: 'POST',
        // headers: { 'Content-Type': 'application/json', } // REMOVED: Browser sets it for FormData
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add substance');
      }

      setAddSuccess(`Substance "${newSubstanceName}" added successfully! ID: ${result.substanceId}`);
      // Clear form
      setNewSubstanceName('');
      setNewSubstanceImage(null);
      setNewSubstanceTitle('');
      setNewSubstanceFormula('');
      setDescripcion('');
      setMetodosConsumo('');
      setEfectosDeseados('');
      setComposicion('');
      setRiesgos('');
      setInteraccionOtrasSustancias('');
      setReduccionRiesgos('');
      setLegislacion('');
      // TODO: Optionally, refresh the substances list here or notify parent for a refetch.
      setIsFormVisible(false); // Hide the form after successful submission
      window.location.reload(); // Reload the page to see the new substance in the list
    } catch (error) {
      setAddError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsAdding(false);
    }
  };

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
        {/* Button to toggle form visibility */}
        <div className="mb-4">
          <Button onClick={() => setIsFormVisible(prev => !prev)} className="mb-4">
            {isFormVisible ? 'Hide New Substance Form' : 'Add New Substance'}
          </Button>
        </div>

        {/* Conditionally rendered "Add New Substance" Form Section */}
        {isFormVisible && (
          <div className="mb-6 border-b pb-6">
        <h3 className="text-lg font-semibold mb-3">Add New Substance</h3>
        <form onSubmit={handleAddSubstance} className="space-y-4">
          <div>
            <label htmlFor="newSubstanceName" className="block text-sm font-medium text-gray-700">Name</label>
            <Input
              id="newSubstanceName"
              type="text"
              value={newSubstanceName}
              onChange={(e) => setNewSubstanceName(e.target.value)}
              placeholder="e.g., Cannabis"
              required
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label htmlFor="newSubstanceImage" className="block text-sm font-medium text-gray-700">Image File</label>
            <Input
              id="newSubstanceImage"
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setNewSubstanceImage(e.target.files[0]);
                } else {
                  setNewSubstanceImage(null);
                }
              }}
              required
              className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label htmlFor="newSubstanceTitle" className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              id="newSubstanceTitle"
              type="text"
              value={newSubstanceTitle}
              onChange={(e) => setNewSubstanceTitle(e.target.value)}
              placeholder="e.g., Marijuana, Hierba"
              required
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label htmlFor="newSubstanceFormula" className="block text-sm font-medium text-gray-700">Formula</label>
            <Input
              id="newSubstanceFormula"
              type="text"
              value={newSubstanceFormula}
              onChange={(e) => setNewSubstanceFormula(e.target.value)}
              placeholder="e.g., THC (C₂₁H₃₀O₂)"
              required
              className="mt-1 block w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-gray-700 text-sm font-bold mb-2">Descripción:</label>
            <textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3}></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="metodosConsumo" className="block text-gray-700 text-sm font-bold mb-2">Métodos de Consumo:</label>
            <textarea id="metodosConsumo" value={metodosConsumo} onChange={(e) => setMetodosConsumo(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3}></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="efectosDeseados" className="block text-gray-700 text-sm font-bold mb-2">Efectos Deseados:</label>
            <textarea id="efectosDeseados" value={efectosDeseados} onChange={(e) => setEfectosDeseados(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3}></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="composicion" className="block text-gray-700 text-sm font-bold mb-2">Composición:</label>
            <textarea id="composicion" value={composicion} onChange={(e) => setComposicion(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3}></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="riesgos" className="block text-gray-700 text-sm font-bold mb-2">Riesgos:</label>
            <textarea id="riesgos" value={riesgos} onChange={(e) => setRiesgos(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3}></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="interaccionOtrasSustancias" className="block text-gray-700 text-sm font-bold mb-2">Interacción con Otras Sustancias:</label>
            <textarea id="interaccionOtrasSustancias" value={interaccionOtrasSustancias} onChange={(e) => setInteraccionOtrasSustancias(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3}></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="reduccionRiesgos" className="block text-gray-700 text-sm font-bold mb-2">Reducción de Riesgos:</label>
            <textarea id="reduccionRiesgos" value={reduccionRiesgos} onChange={(e) => setReduccionRiesgos(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3}></textarea>
          </div>
          <div className="mb-6">
            <label htmlFor="legislacion" className="block text-gray-700 text-sm font-bold mb-2">Legislación:</label>
            <textarea id="legislacion" value={legislacion} onChange={(e) => setLegislacion(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows={3}></textarea>
          </div>
          <Button type="submit" disabled={isAdding} className="w-full sm:w-auto">
            {isAdding ? 'Adding...' : 'Add Substance'}
          </Button>
          {addSuccess && <p className="text-green-600 mt-2 text-sm">{addSuccess}</p>}
          {addError && <p className="text-red-600 mt-2 text-sm">{addError}</p>}
        </form>
          </div>
        )} {/* End of isFormVisible conditional rendering */}

      {/* EXISTING: Filter and Table Section */}
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
