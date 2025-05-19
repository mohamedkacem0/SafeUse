import { NavLink, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Button from './PrimaryButton'; 
import logo from '../assets/logo/logo.svg';

export default function Header() {
  const navLinkClasses = '';

  if (location.pathname === '/politica-de-cookies') return null;

  return (
    <div className='fixed top-0 left-0 right-0 z-50  border-b-[1px] border-[#111111]'>
    <div className="bg-white h-[70px] w-[1440] flex flex-row justify-between items-center">
      <div className="">

        <Link to="/" className="flex flex-row items-center">
          <img src={logo} alt="logo" className="" />
          <span className="font-lato font-bold text-[64px] leading-none tracking-normal">SafeUse</span>
        </Link>
      </div>
      <div>
        <nav className="space-x-[30px] text-[24px] font-medium">
          <NavLink to='/sustancias' className={navLinkClasses}>
            Substances
          </NavLink>
          <NavLink to="/Advice" className={navLinkClasses}>
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

      <div className="flex flex-row items-center  gap-[12px] mr-[65px] ">
        <NavLink to="/cart" aria-label="Cart" className="">
          <ShoppingCart className="" />
          </NavLink>
          <NavLink to="/login" aria-label="Cart" className="">
          <Button text="Log in/Sign up" />
          </NavLink>
 
      </div>
    </div>
    </div>
  );
}
