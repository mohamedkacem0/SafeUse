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
  Imagen_Principal?: string; // Optional: for displaying current primary image
  imagenes_list?: string[]; // Optional: for displaying list of current images
  ID_Producto: number;
  Nombre: string;
  Precio: number;
  Stock: number;
  Descripcion: string | null;
  Fecha_Creacion: string;
  // Add other fields if they are returned by the API and needed for display or editing
}

export default function ProductManagement() {
  const [isProductFormVisible, setIsProductFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // Form field states
  const [currentProductName, setCurrentProductName] = useState('');
  const [currentProductPrice, setCurrentProductPrice] = useState('');
  const [currentProductStock, setCurrentProductStock] = useState('');
  const [currentProductDescription, setCurrentProductDescription] = useState('');
  const [currentProductImages, setCurrentProductImages] = useState<FileList | null>(null);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [productFormSuccess, setProductFormSuccess] = useState<string | null>(null);

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

  const resetProductFormFields = useCallback(() => {
    setCurrentProductName('');
    setCurrentProductPrice('');
    setCurrentProductStock('');
    setCurrentProductDescription('');
    setCurrentProductImages(null);
    const fileInput = document.getElementById('productImagesInput') as HTMLInputElement;
    if (fileInput) fileInput.value = ''; // Reset file input
    setProductFormError(null);
    setProductFormSuccess(null);
  }, []);

  const handleShowAddProductForm = () => {
    setEditingProduct(null);
    resetProductFormFields();
    setIsProductFormVisible(true);
  };

  const handleEdit = useCallback((id: number) => {
    console.log('Attempting to edit product:', id);
    const productToEdit = products.find(p => p.ID_Producto === id);
    if (productToEdit) {
      setEditingProduct(productToEdit);
      setCurrentProductName(productToEdit.Nombre);
      setCurrentProductPrice(productToEdit.Precio.toString());
      setCurrentProductStock(productToEdit.Stock.toString());
      setCurrentProductDescription(productToEdit.Descripcion ?? '');
      setCurrentProductImages(null); // Reset file input for new uploads
      setProductFormError(null);
      setProductFormSuccess(null);
      setIsProductFormVisible(true);
      console.log('Editing product data loaded into form state:', productToEdit);
    } else {
      console.error('Product not found for editing:', id);
      setProductFormError('Product not found. It might have been deleted.');
    }
  }, [products]); // Add products to dependency array

  const handleCancelProductForm = () => {
    setIsProductFormVisible(false);
    resetProductFormFields();
    setEditingProduct(null);
  };

  const handleProductFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProductFormError(null);
    setProductFormSuccess(null);

    const formData = new FormData();
    formData.append('Nombre', currentProductName);
    formData.append('Precio', currentProductPrice);
    formData.append('Stock', currentProductStock);
    formData.append('Descripcion', currentProductDescription);

    // For updates, the backend expects ID_Producto in the URL, not in FormData for Slim's route matching.
    // However, your AdminProductController's update method might expect it in $_POST if not using Slim's args directly for ID.
    // Let's assume the ID is part of the endpoint URL as per typical REST patterns and Slim setup.
    // If your PHP backend specifically needs ID_Producto in POST body for updates, uncomment below:
    // if (editingProduct) {
    //   formData.append('ID_Producto', editingProduct.ID_Producto.toString());
    // }

    if (currentProductImages) {
      for (let i = 0; i < currentProductImages.length; i++) {
        formData.append('imagenes[]', currentProductImages[i]); // Key must match backend: $_FILES['imagenes']
      }
    }

    // TODO: Add a checkbox for 'clear_images' if desired for updates
    // if (editingProduct && shouldClearImages) { // shouldClearImages would be a state from a checkbox
    //  formData.append('clear_images', 'true');
    // }

    try {
      const endpoint = editingProduct 
        ? `/api/admin/products/${editingProduct.ID_Producto}` // Update endpoint
        : '/api/admin/products'; // Create endpoint
      
      const response = await fetch(endpoint, {
        method: 'POST', // Slim routes for update are POST in your index.php
        body: formData,
        // Headers are not needed for FormData; browser sets 'multipart/form-data' automatically
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Form submission failed');
      }

      setProductFormSuccess(`Product ${editingProduct ? 'updated' : 'added'} successfully! ${result.id ? `ID: ${result.id}` : ''}`);
      setIsProductFormVisible(false);
      resetProductFormFields();
      // Refresh data - simple reload for now
      // Consider a more sophisticated state update or re-fetch pattern later
      window.location.reload(); 
    } catch (err: any) {
      console.error('Product form submission error:', err);
      setProductFormError(err.message || 'An unknown error occurred during submission.');
    }
  };

  return (
    <>
      {isProductFormVisible && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProductFormSubmit} className="space-y-4">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Name</label>
                <Input id="productName" value={currentProductName} onChange={(e) => setCurrentProductName(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">Price (€)</label>
                <Input id="productPrice" type="number" step="0.01" value={currentProductPrice} onChange={(e) => setCurrentProductPrice(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="productStock" className="block text-sm font-medium text-gray-700">Stock</label>
                <Input id="productStock" type="number" step="1" value={currentProductStock} onChange={(e) => setCurrentProductStock(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">Description</label>
                <Input id="productDescription" value={currentProductDescription} onChange={(e) => setCurrentProductDescription(e.target.value)} />
              </div>
              <div>
                <label htmlFor="productImagesInput" className="block text-sm font-medium text-gray-700">Images (select new to replace all)</label>
                <Input id="productImagesInput" type="file" multiple onChange={(e) => setCurrentProductImages(e.target.files)} />
                {/* TODO: Display current images for editingProduct, with delete options? */}
              </div>
              {productFormError && <p className="text-red-500 text-sm">{productFormError}</p>}
              {productFormSuccess && <p className="text-green-500 text-sm">{productFormSuccess}</p>}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCancelProductForm}>Cancel</Button>
                <Button type="submit">{editingProduct ? 'Save Changes' : 'Add Product'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
          <Button onClick={handleShowAddProductForm} className="ml-auto">
            Add New Product
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
  </> // Closing tag for the React Fragment
  );
}
