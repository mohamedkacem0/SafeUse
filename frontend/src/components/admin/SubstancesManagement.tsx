
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
import { Edit3, Trash2 } from 'lucide-react';

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
const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export default function SubstancesManagement() {
  const [editingSubstance, setEditingSubstance] = useState<SubstanceMerged | null>(null);
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
  const [isFormVisible, setIsFormVisible] = useState(false); 

  const resetFormFields = useCallback(() => {
    setNewSubstanceName('');
    setNewSubstanceImage(null);
    const fileInput = document.getElementById('newSubstanceImage') as HTMLInputElement;
    if (fileInput) fileInput.value = ''; 
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
    setAddError(null);
    setAddSuccess(null);
  }, []);

  const handleShowAddForm = () => {
    setEditingSubstance(null); 
    resetFormFields();
    setIsFormVisible(true);
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    resetFormFields();
    setEditingSubstance(null);
  };

  const handleDeleteSubstance = async (substanceId: number, substanceName: string) => {
    if (window.confirm(`Are you sure you want to delete the substance "${substanceName}"?`)) {
      try {
        const response = await fetch(`/api/admin/substances/delete/${substanceId}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete substance');
        }
        alert(`Substance "${substanceName}" deleted successfully!`);
        window.location.reload(); 
      } catch (error) {
        console.error('Error deleting substance:', error);
        alert(`Error deleting substance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };
 
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsAdding(true);
    setAddError(null);
    setAddSuccess(null);
 
    if (!newSubstanceName || !newSubstanceTitle || !newSubstanceFormula) {
      setAddError('Name, Title, and Formula are required.');
      setIsAdding(false);
      return;
    } 
    if (!editingSubstance && !newSubstanceImage) {
      setAddError('Image is required for new substances.');
      setIsAdding(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('Nombre', newSubstanceName);
      formData.append('Slug', createSlug(newSubstanceName));
      formData.append('Titulo', newSubstanceTitle);
      formData.append('Formula', newSubstanceFormula);
      
      if (newSubstanceImage) {
        formData.append('Imagen', newSubstanceImage);
      } 
      if (editingSubstance) {
        formData.append('ID_Sustancia', editingSubstance.ID_Sustancia.toString());
      }

      formData.append('descripcion', descripcion);
      formData.append('metodos_consumo', metodosConsumo);
      formData.append('efectos_deseados', efectosDeseados);
      formData.append('composicion', composicion);
      formData.append('riesgos', riesgos);
      formData.append('interaccion_otras_sustancias', interaccionOtrasSustancias);
      formData.append('reduccion_riesgos', reduccionRiesgos);
      formData.append('legislacion', legislacion);

      const endpoint = editingSubstance ? '/api/admin/substances/update' : '/api/admin/substances/add';
      const response = await fetch(endpoint, {
        method: 'POST', 
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${editingSubstance ? 'update' : 'add'} substance`);
      }

      setAddSuccess(`Substance "${newSubstanceName}" ${editingSubstance ? 'updated' : 'added'} successfully! ${result.substanceId ? `ID: ${result.substanceId}` : ''}`);
      resetFormFields();
      setIsFormVisible(false); 
      if (editingSubstance) setEditingSubstance(null);  
      window.location.reload();  
    } catch (error) {
      setAddError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsAdding(false);
    }
  };
 
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
 
  const [filter, setFilter] = useState('');
  const filteredSubstances = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return mergedSubstances;
    return mergedSubstances.filter((s) =>
      s.Nombre.toLowerCase().includes(term)
    );
  }, [mergedSubstances, filter]);

  const handleEditClick = useCallback((id: number) => {
    const substanceToEdit = mergedSubstances.find(s => s.ID_Sustancia === id);
    if (substanceToEdit) {
      setEditingSubstance(substanceToEdit);
      setNewSubstanceName(substanceToEdit.Nombre);
      setNewSubstanceTitle(substanceToEdit.Titulo);
      setNewSubstanceFormula(substanceToEdit.Formula);
      setNewSubstanceImage(null);  
      const fileInput = document.getElementById('newSubstanceImage') as HTMLInputElement;
      if (fileInput) fileInput.value = '';  
      
      setDescripcion(substanceToEdit.descripcion || '');
      setMetodosConsumo(substanceToEdit.metodos_consumo || '');
      setEfectosDeseados(substanceToEdit.efectos_deseados || '');
      setComposicion(substanceToEdit.composicion || '');
      setRiesgos(substanceToEdit.riesgos || '');
      setInteraccionOtrasSustancias(substanceToEdit.interaccion_otras_sustancias || '');
      setReduccionRiesgos(substanceToEdit.reduccion_riesgos || '');
      setLegislacion(substanceToEdit.legislacion || '');
      
      setIsFormVisible(true);
      setAddError(null);
      setAddSuccess(null);
    } else {
      console.error('Substance not found for editing:', id);
      setAddError('Could not find the substance to edit.');
    }
  }, [mergedSubstances, resetFormFields]);

  return (
    <Card>
      
      <CardContent>
       
        <div className="mb-4">
          {!isFormVisible && (
            <Button onClick={handleShowAddForm} className="mb-4">
              Add New Substance
            </Button>
          )}
        </div>

        
        {isFormVisible && (
          <div className="mb-6 border-b pb-6">
        <h3 className="text-lg font-semibold mb-3">{editingSubstance ? `Edit Substance: ${editingSubstance.Nombre}` : 'Add New Substance'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              required={!editingSubstance}  
              className="mt-1 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {newSubstanceImage && <img src={URL.createObjectURL(newSubstanceImage)} alt="New Preview" className="mt-2 h-24 w-24 object-cover rounded-md shadow" />}
            {editingSubstance && !newSubstanceImage && editingSubstance.Imagen && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img src={`/api/uploads/${editingSubstance.Imagen}`} alt={editingSubstance.Nombre} className="h-24 w-24 object-cover rounded-md shadow" />
              </div>
            )}
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
          <div className="flex items-center justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleCancelForm}>Cancel</Button>
            <Button type="submit" disabled={isAdding} className={`w-full sm:w-auto ${isAdding ? 'bg-gray-400' : (editingSubstance ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')}`}>
              {isAdding ? (editingSubstance ? 'Saving...' : 'Adding...') : (editingSubstance ? 'Save Changes' : 'Add Substance')}
            </Button>
          </div>
          {addSuccess && <p className="text-green-600 mt-2 text-sm">{addSuccess}</p>}
          {addError && <p className="text-red-600 mt-2 text-sm">{addError}</p>}
        </form>
          </div>
        )}  
  
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
 
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Image</TableHead>
                <TableHead scope="col" className="max-w-[100px]">Title</TableHead>
                <TableHead scope="col" className="max-w-[80px]">Formula</TableHead>
                <TableHead scope="col" className="max-w-[120px]">Description</TableHead>
                <TableHead scope="col" className="max-w-[120px]">Consumption Methods</TableHead>
                <TableHead scope="col" className="max-w-[120px]">Desired Effects</TableHead>
                <TableHead scope="col" className="max-w-[120px]">Composition</TableHead>
                <TableHead scope="col" className="max-w-[120px]">Risks</TableHead>
                <TableHead scope="col" className="max-w-[120px]">Interaction</TableHead>
                <TableHead scope="col" className="max-w-[120px]">Risk Reduction</TableHead>
                <TableHead scope="col" className="max-w-[120px]">Legislation</TableHead>
                <TableHead scope="col">Edit</TableHead>
                <TableHead scope="col">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody> 
              {loadingBasicList || loadingDetailList ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : basicListError || detailListError ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center text-red-500 py-4">
                    Error loading substances
                  </TableCell>
                </TableRow>
              ) : filteredSubstances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-4">
                    No substances found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubstances.map((s) => (
                  <TableRow key={s.ID_Sustancia}>
                    <TableCell className="whitespace-nowrap">{s.Nombre}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <img
                        src={s.Imagen}
                        alt={s.Nombre}
                        loading="lazy"
                        className="h-8 w-8 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate">{s.Titulo}</TableCell>
                    <TableCell className="max-w-[80px] truncate">{s.Formula}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{s.descripcion}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{s.metodos_consumo}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{s.efectos_deseados}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{s.composicion}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{s.riesgos}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{s.interaccion_otras_sustancias}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{s.reduccion_riesgos}</TableCell>
                    <TableCell className="max-w-[120px] truncate">{s.legislacion}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button
                        aria-label={`Editar sustancia ${s.Nombre}`}
                        onClick={() => handleEditClick(s.ID_Sustancia)}
                      >
                        <Edit3 size={16} />
                      </Button>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 border-red-500 hover:border-red-600 hover:bg-red-50 p-2"
                        aria-label={`Delete sustancia ${s.Nombre}`}
                        onClick={() => handleDeleteSubstance(s.ID_Sustancia, s.Nombre)}
                      >
                        <Trash2 className="h-4 w-4" />
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
