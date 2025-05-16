import Header from '../components/Header';
import Footer from '../components/Footer'; 
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop'; // <-- Import it

export default function AppLayout() {
  return (
    <div>
      <ScrollToTop /> {/* <-- Add it here */}
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer /> 
    </div>
  );
}
