// src/components/admin/OrdersManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '../ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useFetchData } from '../../pages/admin/useFetchData';

interface Order {
  id: number;
  user_id: number;
  total: string | number | null;
  status: string;
  created_at: string;
  shipping_address: string;
}

interface OrderDetail {
  detail_id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
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

export default function OrdersManagement() {
  // 1) Traemos órdenes (cabeceras)
  const {
    data: ordersData,
    loading: loadingOrders,
    error: ordersError,
  } = useFetchData<Order[]>(
    'http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/admin/orders',
    (json) => {
      if (json && Array.isArray((json as any).orders)) {
        return (json as any).orders;
      }
      return [];
    }
  );

  // 2) Estado local para filtrar y eliminar
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  useEffect(() => {
    if (ordersData) {
      setLocalOrders(ordersData);
    }
  }, [ordersData]);

  // 3) Filtro por ID, estado o dirección
  const [filter, setFilter] = useState('');
  const filteredOrders = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return localOrders;
    return localOrders.filter((o) => {
      return (
        o.id.toString().includes(term) ||
        o.status.toLowerCase().includes(term) ||
        o.shipping_address.toLowerCase().includes(term)
      );
    });
  }, [localOrders, filter]);

  // 4) Eliminar orden
  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres borrar esta orden?')) return;

    try {
      const res = await fetch(
        `http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/admin/orders/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error deleting order');
      }
      setLocalOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      console.error('Error en DELETE:', err);
      alert('No se pudo borrar la orden: ' + err.message);
    }
  };

  // 5) Modal de detalles
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Abrir modal y cargar detalles (convertir strings a números)
  const openModal = async (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
    setLoadingDetails(true);
    setDetailsError(null);

    try {
      const res = await fetch(
        `http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/admin/orders/${order.id}/details`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error fetching details');
      }
      const json = await res.json();

      // Este mapeo convierte los campos de cadena a número:
      const detailsParsed: OrderDetail[] = (json.details as any[]).map((d) => ({
        detail_id: Number(d.detail_id),
        order_id: Number(d.order_id),
        product_id: Number(d.product_id),
        product_name: d.product_name,
        quantity: Number(d.quantity),
        unit_price: Number(d.unit_price),
        total_price: Number(d.total_price),
      }));
      setOrderDetails(detailsParsed);
    } catch (e: any) {
      console.error('Error al cargar detalles:', e);
      setDetailsError(e.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
    setOrderDetails([]);
    setDetailsError(null);
  };

  // 6) Actualizar campo en el estado local antes de enviar al backend
  const handleDetailChange = (
    detailId: number,
    field: 'quantity' | 'unit_price',
    value: number
  ) => {
    setOrderDetails((prev) =>
      prev.map((d) =>
        d.detail_id === detailId
          ? {
              ...d,
              [field]: value,
              // Recalculamos total_price
              total_price:
                field === 'quantity'
                  ? Number((value * d.unit_price).toFixed(2))
                  : Number((d.quantity * value).toFixed(2)),
            }
          : d
      )
    );
  };

  // 7) Guardar cambios en backend
  const handleSaveChanges = async () => {
    if (!selectedOrder) return;

    let hadError = false;
    for (const detail of orderDetails) {
      try {
        const res = await fetch(
          `http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/admin/orders/${selectedOrder.id}/details/${detail.detail_id}`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              quantity: detail.quantity,
              unit_price: detail.unit_price,
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error updating detail');
        }
      } catch (e: any) {
        console.error(`Error al actualizar detalle ${detail.detail_id}:`, e);
        alert(`No se pudo actualizar línea ${detail.detail_id}: ${e.message}`);
        hadError = true;
      }
    }

    if (!hadError) {
      alert('Detalles del pedido actualizados correctamente');
      if (selectedOrder) {
        openModal(selectedOrder);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Orders Management</CardTitle>
          <Input
            placeholder="Search by ID, status or address..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-64"
          />
        </CardHeader>

        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Order ID</TableHead>
                  <TableHead scope="col">User ID</TableHead>
                  <TableHead scope="col">Total (€)</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Created At</TableHead>
                  <TableHead scope="col">Address</TableHead>
                  <TableHead scope="col">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingOrders ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : ordersError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-red-500 py-4">
                      Error loading orders
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="whitespace-nowrap">{o.id}</TableCell>
                      <TableCell className="whitespace-nowrap">{o.user_id}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {(Number(o.total) || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap uppercase">{o.status}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(o.created_at)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {o.shipping_address}
                      </TableCell>
                      <TableCell className="whitespace-nowrap space-x-2">
                        <Button
                          onClick={() => openModal(o)}
                          variant="default"
                          className="bg-blue-600 text-white"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleDelete(o.id)}
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
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

      {/* ------------------------ MODAL DE DETALLES ------------------------ */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center border-b px-4 py-2">
              <h3 className="text-lg font-semibold">
                Detalles del Pedido #{selectedOrder.id}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="px-4 py-4 max-h-[70vh] overflow-y-auto">
              {loadingDetails ? (
                <p>Cargando detalles…</p>
              ) : detailsError ? (
                <p className="text-red-500">Error: {detailsError}</p>
              ) : (
                <>
                  {/* Cabecera del pedido */}
                  <div className="mb-4 space-y-1">
                    <p>
                      <strong>Usuario ID:</strong> {selectedOrder.user_id}
                    </p>
                    <p>
                      <strong>Estado:</strong> {selectedOrder.status}
                    </p>
                    <p>
                      <strong>Dirección de entrega:</strong>{' '}
                      {selectedOrder.shipping_address}
                    </p>
                    <p>
                      <strong>Creado en:</strong>{' '}
                      {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>

                  {/* Tabla de líneas de detalle */}
                  <Table className="min-w-full border">
                    <TableHeader>
                      <TableRow>
                        <TableHead scope="col">Detalle ID</TableHead>
                        <TableHead scope="col">Producto</TableHead>
                        <TableHead scope="col">Cantidad</TableHead>
                        <TableHead scope="col">Precio Unitario (€)</TableHead>
                        <TableHead scope="col">Precio Total (€)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.map((d) => (
                        <TableRow key={d.detail_id}>
                          <TableCell className="whitespace-nowrap">
                            {d.detail_id}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {d.product_name}
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              min={1}
                              value={d.quantity}
                              onChange={(e) =>
                                handleDetailChange(
                                  d.detail_id,
                                  'quantity',
                                  Number(e.target.value)
                                )
                              }
                              className="w-16 border px-1"
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={d.unit_price.toFixed(2)}
                              onChange={(e) =>
                                handleDetailChange(
                                  d.detail_id,
                                  'unit_price',
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 border px-1"
                            />
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {d.total_price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </div>

            <div className="flex justify-end border-t px-4 py-3 space-x-2">
              <Button variant="outline" onClick={closeModal}>
                Cerrar
              </Button>
              <Button
                variant="default"
                className="bg-green-600 text-white"
                onClick={handleSaveChanges}
                disabled={loadingDetails || !!detailsError}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
