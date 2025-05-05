import Header from '../components/Header';
import Footer from '../components/Footer'; 
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="">
      <div className="">
      <Header />
      </div>
      <main className="">
        <Outlet />
      </main>
      <div className="">
      <Footer /> 
      </div>
      </div>
  );
}
