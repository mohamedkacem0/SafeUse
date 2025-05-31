// src/components/Admin/ProductManagement.tsx
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

interface Product {
  ID_Producto: number;
  Nombre: string;
  Precio: number;
  Stock: number;
  Descripcion: string | null;
  Fecha_Creacion: string;
}

export default function ProductManagement() {
  const {
    data: productsData,
    loading: loadingProducts,
    error: productsError,
  } = useFetchData<Product[]>('/api/productos', (json) => {
    // La API puede devolver un array directo o un objeto { productos: [...] }
    if (Array.isArray(json)) {
      return json as Product[];
    }
    if (Array.isArray((json as any).productos)) {
      return (json as any).productos as Product[];
    }
    return [];
  });

  const products = productsData ?? [];

  const [filter, setFilter] = useState('');
  const filteredProducts = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      p.Nombre.toLowerCase().includes(term) ||
      (p.Descripcion ?? '').toLowerCase().includes(term)
    );
  }, [products, filter]);

  const handleEdit = useCallback((id: number) => {
    console.log('Editar producto:', id);
    // Aquí podrías navegar a una ruta de edición, por ejemplo:
    // router.push(`/admin/products/${id}/edit`);
  }, []);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Product Management</CardTitle>
        <div className="flex space-x-2">
          <Input
            placeholder="Search products..."
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
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">ID</TableHead>
                <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Price</TableHead>
                <TableHead scope="col">Stock</TableHead>
                <TableHead scope="col" className="max-w-[250px]">Description</TableHead>
                <TableHead scope="col">Created at</TableHead>
                <TableHead scope="col">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingProducts ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : productsError ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-red-500 py-4">
                    Error loading products
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((p) => (
                  <TableRow key={p.ID_Producto}>
                    <TableCell>{p.ID_Producto}</TableCell>
                    <TableCell>{p.Nombre}</TableCell>
                    <TableCell>{p.Precio.toFixed(2)} €</TableCell>
                    <TableCell>{p.Stock}</TableCell>
                    <TableCell className="max-w-[250px] truncate">{p.Descripcion}</TableCell>
                    <TableCell>{formatDate(p.Fecha_Creacion)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button
                        aria-label={`Editar producto ${p.Nombre}`}
                        onClick={() => handleEdit(p.ID_Producto)}
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
