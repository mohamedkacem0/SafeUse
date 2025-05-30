// src/pages/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, Package, FlaskConical } from 'lucide-react';

interface AdminUser {
  ID_Usuario: number;
  Nombre: string;
  Correo: string;
  Tipo_Usuario: string;
  Direccion: string;
  Telefono: string;
  created_at: string;
}

const sampleChartData = [
  { date: '2025-01-01', users: 120 },
  { date: '2025-02-01', users: 200 },
  { date: '2025-03-01', users: 150 },
  { date: '2025-04-01', users: 250 },
  { date: '2025-05-01', users: 300 },
];

export default function AdminDashboard() {
  const [filter, setFilter] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [productsCount, setProductsCount] = useState<number>(0);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [substancesCount, setSubstancesCount] = useState<number>(0);
  const [loadingSubstances, setLoadingSubstances] = useState(true);

  // Fetch users
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users', { method: 'GET', credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  // Fetch total products
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/productos', { method: 'GET', credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        let count = 0;
        if (Array.isArray(data)) count = data.length;
        else if (Array.isArray((data as any).productos)) count = (data as any).productos.length;
        else if (typeof (data as any).total === 'number') count = (data as any).total;
        setProductsCount(count);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  // Fetch total substances
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/sustancias', { method: 'GET', credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        let count = 0;
        if (Array.isArray(data)) count = data.length;
        else if (Array.isArray((data as any).sustancias)) count = (data as any).sustancias.length;
        else if (typeof (data as any).total === 'number') count = (data as any).total;
        setSubstancesCount(count);
      } catch (err) {
        console.error('Error fetching substances:', err);
      } finally {
        setLoadingSubstances(false);
      }
    })();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.Nombre.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 mt-[70px]">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users size={20} />
              <span>Total Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <p className="text-3xl font-bold">…</p>
            ) : (
              <p className="text-3xl font-bold">{users.length}</p>
            )}
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package size={20} />
              <span>Total Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProducts ? (
              <p className="text-3xl font-bold">…</p>
            ) : (
              <p className="text-3xl font-bold">{productsCount}</p>
            )}
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FlaskConical size={20} />
              <span>Total Substances</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSubstances ? (
              <p className="text-3xl font-bold">…</p>
            ) : (
              <p className="text-3xl font-bold">{substancesCount}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Active Users</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3182ce" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <div className="flex space-x-2">
            <Input
              placeholder="Search users..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button onClick={() => { /* lógica de invitación */ }}>
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Direccion</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.ID_Usuario}>
                  <TableCell>{u.Nombre}</TableCell>
                  <TableCell>{u.Correo}</TableCell>
                  <TableCell>{u.Tipo_Usuario}</TableCell>
                  <TableCell>{u.Direccion}</TableCell>
                  <TableCell>{u.Telefono}</TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button onClick={() => { /* editar */ }}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
