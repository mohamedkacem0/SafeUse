// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
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
  const enhancedInputClass = "w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm placeholder:text-gray-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 focus:outline-none transition-all duration-300 ease-in-out";

  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Change Password Form
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);

  // Inline editing state
  const [editing, setEditing] = useState<EditableField>(null);
  const [draftValue, setDraftValue] = useState<string>("");

  // Load profile on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api?route=api/profile", {
          method: "GET",
          credentials: "include",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const userData = await res.json();
        console.log("Datos del perfil recibidos:", userData);
        setUser(userData);
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
        setError("No se pudieron cargar los datos de perfil. Por favor, inicia sesión nuevamente.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/api?route=api/logout", { 
        method: "POST", 
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  // Password Change Handler
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("New passwords do not match.");
      return;
    }
    if (!currentPassword || !newPassword) {
      setPasswordChangeError("All password fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordChangeError(data.error || "Failed to change password.");
      } else {
        setPasswordChangeSuccess("Password changed successfully!");
        setShowChangePasswordForm(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (err) {
      console.error(err);
      setPasswordChangeError("An unexpected error occurred. Please try again.");
    }
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
    fieldKey: keyof UserProfile, // Changed 'field' to 'fieldKey' for clarity with UserProfile keys
    type: string = "text"
  ) => (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center py-4">
      <span className="text-gray-600 font-medium mb-1 sm:mb-0">{label}</span>
      <div className="flex items-center gap-2 mt-1 sm:mt-0">
        {editing === fieldKey ? (
          <>
            <input
              type={type}
              value={draftValue}
              onChange={e => setDraftValue(e.target.value)}
              className={`${enhancedInputClass} py-1.5 flex-grow`}
              autoFocus
            />
            <button onClick={saveEdit} title="Save changes" className="p-1.5 rounded-md hover:bg-green-100">
              <Check className="text-green-600 h-5 w-5" />
            </button>
            <button onClick={cancelEdit} title="Cancel edit" className="p-1.5 rounded-md hover:bg-red-100">
              <CloseIcon className="text-red-600 h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <span className="text-gray-800">{user[fieldKey] || "Not set"}</span>
            <button onClick={() => startEdit(fieldKey as EditableField)} title={`Edit ${label}`} className="p-1.5 rounded-md hover:bg-gray-100">
              <Pencil className="text-gray-500 hover:text-sky-600 cursor-pointer h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Main content structure for user details
  const userDetailsContent = (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl mt-10 w-full divide-y divide-gray-200 border-t-4 border-emerald-500">
      {renderField("Full Name", "Nombre")}
      {renderField("Email Address", "Correo", "email")}
      {renderField("Phone Number", "Telefono", "tel")}
      {renderField("Address", "Direccion")}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-2xl w-full">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-10 text-center sm:text-left mt-10">Your Profile</h1>

      {/* User Info Fields Card */}
      {userDetailsContent}

      {/* My Orders Button */}
      <div className="mt-10 w-full max-w-md mx-auto">
        <PrimaryButton
          text="My Orders"
          onClick={() => navigate('/my-orders')} // Assuming '/my-orders' is the route for orders
          className="w-full !bg-emerald-600 hover:!bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out active:scale-[0.98]"
        />
      </div>

      {/* Change Password Section */}
      <div className="mt-10 w-full max-w-md mx-auto">
        <PrimaryButton
          text={showChangePasswordForm ? "Cancel Change Password" : "Change Password"}
          onClick={() => {
            setShowChangePasswordForm(!showChangePasswordForm);
            setPasswordChangeError(null);
            setPasswordChangeSuccess(null);
            // Clear fields if canceling
            if (showChangePasswordForm) {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            }
          }}
          className={`w-full font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out active:scale-[0.98] ${
            showChangePasswordForm
              ? "!bg-amber-500 hover:!bg-amber-600 text-white"
              : "!bg-emerald-600 hover:!bg-emerald-700 text-white"
          }`}
        />
      </div>

      {showChangePasswordForm && (
        <div className="mt-6 mb-4 w-full max-w-md mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Change Your Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={enhancedInputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={enhancedInputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={enhancedInputClass}
                required
              />
            </div>

            {passwordChangeError && (
              <p className="text-sm text-red-600 text-center p-2 bg-red-50 rounded-md">{passwordChangeError}</p>
            )}
            {passwordChangeSuccess && (
              <p className="text-sm text-green-600 text-center p-2 bg-green-50 rounded-md">{passwordChangeSuccess}</p>
            )}

            <div>
              <PrimaryButton
                type="submit"
                text="Update Password"
                className="w-full !bg-emerald-600 hover:!bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out active:scale-[0.98]"
              />
            </div>
          </form>
        </div>
      )}

      {/* Logout Button */}
      <div className="mt-12 w-full max-w-xs mx-auto">
        {/* <a href="#" className="text-sm text-sky-600 hover:underline text-center block mb-4">
          Change your password
        </a> */}
        <PrimaryButton
          text="Logout"
          onClick={handleLogout}
          className="w-full !bg-red-600 hover:!bg-red-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out active:scale-[0.98]"
        />
      </div>
      </div> {/* Closes max-w-2xl w-full */}
    </div>   /* Closes min-h-screen */
  );
}
