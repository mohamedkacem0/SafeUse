import { Outlet, NavLink } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white px-4 py-3">
        <nav className="flex gap-4 font-semibold">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/sustancias">Sustancias</NavLink>
        </nav>
      </header>

      <main className="flex-1 p-4">
        <Outlet />
      </main>

      <footer className="p-4 text-center text-sm text-gray-500">
        © 2025 SafeUse
      </footer>
    </div>
  );
}
