// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '../components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Users, Activity, AlertCircle } from 'lucide-react';

interface AdminUser {
  ID_Usuario: number;
  Nombre: string;
  Correo: string;
  Tipo_Usuario: string;
  // añade más campos si quieres
}

const sampleChartData = [
  { date: '2025-01-01', users: 120 },
  { date: '2025-02-01', users: 200 },
  { date: '2025-03-01', users: 150 },
  { date: '2025-04-01', users: 250 },
  { date: '2025-05-01', users: 300 }
];

export default function AdminDashboard() {
  const [filter, setFilter] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from /api/users
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users', {
          method: 'GET',
          credentials: 'include'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredUsers = users.filter(u =>
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
            {loading ? (
              <p className="text-3xl font-bold">…</p>
            ) : (
              <p className="text-3xl font-bold">{users.length}</p>
            )}
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity size={20} />
              <span>Active Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sustituye por fetch real si tienes endpoint */}
            <p className="text-3xl font-bold">312</p>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>Incidents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sustituye por fetch real si tienes endpoint */}
            <p className="text-3xl font-bold">5</p>
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
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3182ce"
                strokeWidth={2}
              />
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
              onChange={e => setFilter(e.target.value)}
            />
            <Button onClick={() => {/* lógica de invitación */}}>
              Invite User
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
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(u => (
                <TableRow key={u.ID_Usuario}>
                  <TableCell>{u.Nombre}</TableCell>
                  <TableCell>{u.Correo}</TableCell>
                  <TableCell>{u.Tipo_Usuario}</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>
                    <Button onClick={() => {/* editar */}}>
                      Edit
                    </Button>
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
