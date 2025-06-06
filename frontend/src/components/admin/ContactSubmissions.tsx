// src/components/admin/ContactSubmissions.tsx
import { useState, useMemo, useCallback, useEffect } from 'react';
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

interface ContactSubmission {
  ID_Submission: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string;
  checked: number;
  created_at: string;
}

export default function ContactSubmissions() {
  // 1) Carga inicial desde la API de ADMIN (se necesita incluir credenciales)
  const [localSubmissions, setLocalSubmissions] = useState<ContactSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmissions() {
      setLoadingSubmissions(true);
      setSubmissionsError(null);

      try {
        const res = await fetch('/api/admin/contact', {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error loading submissions');
        }
        const json = await res.json();
        // La ruta devuelve { submissions: ContactSubmission[] }
        const array: any[] = Array.isArray(json.submissions) ? json.submissions : [];
        const parsed: ContactSubmission[] = array.map((item) => ({
          ID_Submission:
            item.ID_Submission ??
            item.id_submission ??
            item.ID ??
            item.id ??
            0,
          first_name: item.first_name ?? item.firstName ?? '',
          last_name: item.last_name ?? item.lastName ?? '',
          email: item.email ?? '',
          phone: item.phone ?? null,
          message: item.message ?? '',
          checked:
            typeof item.checked === 'number'
              ? item.checked
              : item.checked === '1' || item.checked === 'true'
              ? 1
              : 0,
          created_at: item.created_at ?? item.createdAt ?? '',
        }));
        setLocalSubmissions(parsed);
      } catch (err: any) {
        console.error(err);
        setSubmissionsError(err.message);
      } finally {
        setLoadingSubmissions(false);
      }
    }

    fetchSubmissions();
  }, []);

  // 2) Filtro sencillo
  const [filter, setFilter] = useState('');
  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return localSubmissions;
    return localSubmissions.filter((s) => {
      const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
      return (
        fullName.includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.phone ?? '').toLowerCase().includes(term)
      );
    });
  }, [localSubmissions, filter]);

  // 3) Función que borra una submission dado su ID (admin)
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('¿Seguro que quieres borrar esta submission?')) return;

    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al borrar la submission');
      }
      setLocalSubmissions((prev) =>
        prev.filter((item) => item.ID_Submission !== id)
      );
    } catch (err: any) {
      console.error(err);
      alert('No se pudo borrar la submission: ' + err.message);
    }
  }, []);

  // 4) Función que cambia el estado "checked" (0 ó 1) (admin)
  async function handleToggleChecked(id: number, currentChecked: number) {
    const newChecked = currentChecked === 1 ? 0 : 1;

    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: newChecked }),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || 'Error al actualizar el estado');
      }

      // Si fue 200 OK, actualizamos localmente:
      setLocalSubmissions((prev) =>
        prev.map((item) =>
          item.ID_Submission === id
            ? { ...item, checked: newChecked }
            : item
        )
      );
    } catch (err: any) {
      console.error(err);
      alert('No se pudo actualizar el estado: ' + err.message);
    }
  }

  // 5) Estado para el modal de mensaje completo
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  const openModal = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSubmission(null);
    setModalOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Contact Submissions</CardTitle>
          <div className="flex space-x-2">
            <Input
              placeholder="Search submissions..."
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
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">ID</TableHead>
                  <TableHead scope="col">First Name</TableHead>
                  <TableHead scope="col">Last Name</TableHead>
                  <TableHead scope="col">Email</TableHead>
                  <TableHead scope="col">Phone</TableHead>
                  <TableHead scope="col" className="max-w-[300px]">
                    Message
                  </TableHead>
                  <TableHead scope="col">Checked</TableHead>
                  <TableHead scope="col">Created At</TableHead>
                  <TableHead scope="col">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingSubmissions ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : submissionsError ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-red-500 py-4">
                      {submissionsError}
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s.ID_Submission}>
                      <TableCell>{s.ID_Submission}</TableCell>
                      <TableCell>{s.first_name}</TableCell>
                      <TableCell>{s.last_name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.phone ?? '—'}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        <button
                          onClick={() => openModal(s)}
                          className="text-blue-600 hover:underline text-left w-full"
                          title="Ver mensaje completo"
                        >
                          {s.message}
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={s.checked === 1}
                          onChange={() =>
                            handleToggleChecked(s.ID_Submission, s.checked)
                          }
                        />
                      </TableCell>
                      <TableCell>{formatDate(s.created_at)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(s.ID_Submission)}
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

      {/* 6) Modal para mostrar el mensaje completo */}
      {modalOpen && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full mx-4">
            <div className="flex justify-between items-center border-b px-4 py-2">
              <h3 className="text-lg font-semibold">
                Mensaje de {selectedSubmission.first_name}{' '}
                {selectedSubmission.last_name}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-4 max-h-96 overflow-y-auto">
              <p className="whitespace-pre-wrap text-gray-800">
                {selectedSubmission.message}
              </p>
            </div>
            <div className="flex justify-end border-t px-4 py-3">
              <Button variant="outline" onClick={closeModal}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
