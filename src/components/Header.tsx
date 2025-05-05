import { NavLink, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Button from './PrimaryButton'; // Importa el componente Button
import logo from '../assets/logo/logo.svg';

export default function Header() {
  const navLinkClasses = '';

  if (location.pathname === '/politica-de-cookies') return null;

  return (
    <div className="bg-white h-[70px] w-[1440] flex flex-row justify-between items-center">
      <div className="">
        {/* Logo + nombre */}
        <Link to="/" className="flex flex-row items-center">
          <img src={logo} alt="logo" className="" />
          <span className="font-lato font-bold text-[64px] leading-none tracking-normal">SafeUse</span>
        </Link>
      </div>
      <div>
        {/* Navegación central – oculta en móvil */}
        <nav className="space-x-[30px] text-[36px] font-medium">
          <NavLink to='/sustancias' className={navLinkClasses}>
            Substances
          </NavLink>
          <NavLink to="/advice" className={navLinkClasses}>
            Advice
          </NavLink>
          <NavLink to="/shop" className={navLinkClasses}>
            Shop
          </NavLink>
          <NavLink to="/contact" className={navLinkClasses}>
            Contact
          </NavLink>
        </nav>
      </div>
      {/* Carrito + Login */}
      <div className="flex flex-row items-center gap-[12px] mr-[65px] ">
        <NavLink to="/cart" aria-label="Cart" className="">
          <ShoppingCart className="" />
          {/* Badge de unidades, descoméntalo si lo necesitas */}
          {/* <span className="absolute -top-1 -right-1 rounded-full bg-primary px-1 text-[10px] font-semibold text-white">2</span> */}
        </NavLink>
        {/* Botón Login */}
        <Button text="Log in/Sign up" />
      </div>
    </div>
  );
}
