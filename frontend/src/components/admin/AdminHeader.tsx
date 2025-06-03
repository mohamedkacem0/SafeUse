import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api?route=api/logout', { // Align with Profile.tsx
        method: 'POST',
        credentials: 'include', // Align with Profile.tsx
        headers: {
          'Content-Type': 'application/json',
          // Include authorization headers if your logout endpoint requires them
          // For example, if using a token:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        // Clear client-side session storage
        localStorage.removeItem('user'); // Align with Profile.tsx
        // localStorage.removeItem('token'); // Profile.tsx only removes 'user'
        
        // Redirect to login page
        navigate('/'); // Redirect to home page, align with Profile.tsx
      } else {
        const errorData = await response.json();
        alert(`Error al cerrar sesión: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Error de red o del servidor al intentar cerrar sesión.');
    }
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-semibold">SafeUse - Administration Panel</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors duration-150"
      >
        <LogOut size={18} className="mr-2" />
        Logout
      </button>
    </header>
  );
};

export default AdminHeader;
