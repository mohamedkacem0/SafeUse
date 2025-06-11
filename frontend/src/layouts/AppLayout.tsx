import Header from '../components/Header';
import Footer from '../components/Footer'; 
import { Outlet } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop'; 

export default function AppLayout() {
  return (
    <div>
      <ScrollToTop />  
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer /> 
    </div>
  );
}
