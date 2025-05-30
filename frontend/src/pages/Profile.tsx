// src/pages/Profile.tsx
import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { Pencil, Check, X as CloseIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";

interface UserProfile {
  ID_Usuario: number;
  Nombre: string;
  Correo: string;
  Telefono: string;
  Direccion: string;
  Tipo_Usuario: string;
  foto_perfil?: string;
}

type EditableField = "Nombre" | "Correo" | "Telefono" | "Direccion" | null;

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline editing state
  const [editing, setEditing] = useState<EditableField>(null);
  const [draftValue, setDraftValue] = useState<string>("");

  // Load profile on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { user: u } = await res.json();
        setUser(u);
        if (u.foto_perfil) setPreviewUrl(u.foto_perfil);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos de perfil.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Logout
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    localStorage.removeItem("user");
    navigate("/");
  };

  // Photo upload helpers
  const triggerFileInput = () => fileInputRef.current?.click();
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleImageUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("foto", selectedFile);
    const res = await fetch("/api/upload-photo", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { foto_perfil: newUrl } = await res.json();
    setUser(u => u ? { ...u, foto_perfil: newUrl } : u);
    setPreviewUrl(newUrl);
    setSelectedFile(null);
    alert("Foto de perfil actualizada.");
  };

  // Inline edit helpers
  const startEdit = (field: EditableField) => {
    if (!user || !field) return;
    setEditing(field);
    setDraftValue(user[field] || "");
  };
  const cancelEdit = () => {
    setEditing(null);
    setDraftValue("");
  };
  const saveEdit = async () => {
    if (!user || !editing) return;
    const payload: any = { [editing]: draftValue };
    const res = await fetch("/api/update-profile", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { user: updated } = await res.json();
    setUser(updated);
    setEditing(null);
  };

  if (loading) return <div className="p-8 text-center">Cargando perfil…</div>;
  if (error || !user)
    return (
      <div className="p-8 text-center text-red-600">
        {error || "Perfil no disponible"}
      </div>
    );

  const renderField = (
    label: string,
    field: EditableField,
    type: string = "text"
  ) => (
    <div className="flex justify-between items-center border-b px-4 py-4">
      <span className="text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        {editing === field ? (
          <>
            <input
              type={type}
              value={draftValue}
              onChange={e => setDraftValue(e.target.value)}
              className="border px-2 py-1 rounded"
            />
            <button onClick={saveEdit}>
              <Check className="text-green-600" />
            </button>
            <button onClick={cancelEdit}>
              <CloseIcon className="text-red-600" />
            </button>
          </>
        ) : (
          <>
            <span className="text-gray-700">{user[field] || ""}</span>
            <button onClick={() => startEdit(field)}>
              <Pencil className="text-gray-400 cursor-pointer" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pt-12 pb-8 flex flex-col items-center">
      <h1 className="text-[56px] font-bold mb-8 w-full text-left">Profile</h1>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar */}
      <div className="relative flex flex-col items-center mb-6">
        <div className="w-[140px] h-[140px] rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-[80px]">
              <svg
                width="80"
                height="80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle cx="12" cy="8" r="4" strokeWidth="2" />
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" strokeWidth="2" />
              </svg>
            </span>
          )}
        </div>
        <button
          onClick={triggerFileInput}
          className="absolute bottom-2 right-2 bg-white rounded-full p-2 border border-gray-300 hover:bg-gray-100"
        >
          <Pencil size={20} className="text-gray-400" />
        </button>
      </div>
      {selectedFile && (
        <PrimaryButton
          text="Guardar foto"
          onClick={handleImageUpload}
          className="mb-6"
        />
      )}

      {/* User fields */}
      <div className="w-full bg-white rounded-xl">
        {renderField("Name", "Nombre")}
        {renderField("Email", "Correo", "email")}
        {renderField("Mobile number", "Telefono", "tel")}
        {renderField("Address", "Direccion")}
      </div>

      {/* Logout */}
      <div className="flex flex-col items-center mt-10">
        <a href="#" className="text-xs underline text-gray-600 mb-4">
          Change your password
        </a>
        <PrimaryButton
          text="Logout"
          className="w-[120px]"
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}
