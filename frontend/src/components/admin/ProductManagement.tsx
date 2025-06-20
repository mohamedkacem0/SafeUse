 
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
import { Edit3, Trash2 } from 'lucide-react';

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
  Imagen_Principal?: string;  
  imagenes_list?: string[]; 
  ID_Producto: number;
  Nombre: string;
  Precio: number;
  Stock: number;
  Descripcion: string | null;
  Fecha_Creacion: string;
}

export default function ProductManagement() {
  const [isProductFormVisible, setIsProductFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentProductName, setCurrentProductName] = useState('');
  const [currentProductPrice, setCurrentProductPrice] = useState('');
  const [currentProductStock, setCurrentProductStock] = useState('');
  const [currentProductDescription, setCurrentProductDescription] = useState('');
  const [currentProductImages, setCurrentProductImages] = useState<FileList | null>(null);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [productFormSuccess, setProductFormSuccess] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const { 
    data: productsData, 
    loading: loadingProducts, 
    error: productsError
  } = useFetchData<Product[]>('/api/admin/products');

  React.useEffect(() => {
    if (productsData) {
      const sanitizedProducts = productsData.map(p => ({
        ...p,
        Precio: Number(p.Precio),
        Stock: Number(p.Stock)
      }));
      setProducts(sanitizedProducts);
    }
  }, [productsData]);

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
    if (fileInput) fileInput.value = ''; 
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
      setCurrentProductImages(null);
      setProductFormError(null);
      setProductFormSuccess(null);
      setIsProductFormVisible(true);
      console.log('Editing product data loaded into form state:', productToEdit);
    } else {
      console.error('Product not found for editing:', id);
      setProductFormError('Product not found. It might have been deleted.');
    }
  }, [products]); 

  const handleCancelProductForm = () => {
    setIsProductFormVisible(false);
    resetProductFormFields();
    setEditingProduct(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const response = await fetch(`http://localhost/tfg/SafeUse/backend/api/public/?route=api/admin/products/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Error al eliminar el producto.');
        }

        setProducts(prevProducts => prevProducts.filter(p => p.ID_Producto !== id));
        setProductFormSuccess('Producto eliminado con éxito.');
        setTimeout(() => setProductFormSuccess(null), 3000);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
        setProductFormError(errorMessage);
        console.error('Error deleting product:', error);
        setTimeout(() => setProductFormError(null), 5000);
      }
    }
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

    if (currentProductImages) {
      for (let i = 0; i < currentProductImages.length; i++) {
        formData.append('imagenes[]', currentProductImages[i]);
      }
    }

    const url = editingProduct
      ? `/api/admin/products/${editingProduct.ID_Producto}`
      : '/api/admin/products';

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        console.error('Failed to parse JSON:', responseText);
        throw new Error(`El servidor ha devuelto una respuesta inesperada: ${responseText.substring(0, 200)}...`);
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Error al enviar el formulario.');
      }

      setProductFormSuccess(`Producto ${editingProduct ? 'actualizado' : 'añadido'} con éxito!`);
      setIsProductFormVisible(false);
      resetProductFormFields();
      window.location.reload();
    } catch (err) {
      console.error('Error en el formulario de producto:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ha ocurrido un error desconocido.';
      setProductFormError(errorMessage);
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
                      <Button
                        variant="outline"
                        className="ml-2 text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                        aria-label={`Eliminar producto ${p.Nombre}`}
                        onClick={() => handleDelete(p.ID_Producto)}
                      >
                        <Trash2 size={16} />
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
  </>
  );
}
