import Navbar from '../components/NavBar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="">
    <Navbar />

    <main className="">
      <Outlet />
    </main>

    <footer className="">
      © 2025 SafeUse
    </footer>
  </div>
  );
}
