import { NavLink, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';


export default function Navbar() {
  const navLinkClasses =
  '';

  if (location.pathname === '/politica-de-cookies') return null

  return (
    <div className="">
      <div className="">
        {/* Logo + nombre */}
        <Link to="/" className="">
          <img src="/logo-pill.svg" alt="SafeUse logo" className="" />
          <span className="">SafeUse</span>
        </Link>

        {/* Navegación central – oculta en móvil */}
        <nav className="">
          <NavLink to="/sustances" className={navLinkClasses}>
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

        {/* Carrito + Login */}
        <div className="">
          <NavLink to="/cart" aria-label="Cart" className="">
            <ShoppingCart className="" />
            {/* Badge de unidades, descoméntalo si lo necesitas */}
            {/* <span className="absolute -top-1 -right-1 rounded-full bg-primary px-1 text-[10px] font-semibold text-white">2</span> */}
          </NavLink>

        
        </div>
      </div>
    </div>
  );
}
