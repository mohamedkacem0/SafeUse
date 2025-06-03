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
  total: string | number | null; // puede venir como string desde la BD
  status: string;
  created_at: string;
  shipping_address: string;
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
  // 1) Traemos órdenes desde el endpoint admin
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

  // 2) Copia local para poder filtrar
  const [localOrders, setLocalOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (ordersData) {
      setLocalOrders(ordersData);
    }
  }, [ordersData]);

  // 3) Filtro por ID o por estado
  const [filter, setFilter] = useState('');
  const filteredOrders = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return localOrders;
    return localOrders.filter((o) => {
      return (
        o.id.toString().includes(term) ||
        o.status.toLowerCase().includes(term)
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
      console.error(err);
      alert('No se pudo borrar la orden: ' + err.message);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Orders Management</CardTitle>
        <Input
          placeholder="Search by ID or status..."
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
                      {/* Convertimos total a número antes de toFixed */}
                      {(Number(o.total) || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap uppercase">{o.status}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(o.created_at)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {o.shipping_address}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
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
  );
}
