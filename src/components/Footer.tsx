import { NavLink, Link } from 'react-router-dom';
import logo from '../assets/logo/logo.svg';
import NavigationList from './NavigationList';

export default function Footer() {
  return (
    <footer className="border-t-[1px] border-[#111111]">
      <div className="flex flex-row justify-evenly items-center p-[20px]">
        {/* Logo Section */}
        <div className="flex flex-col items-center">
          <Link to="/" className="flex flex-col items-center">
            <img src={logo} alt="logo" className="" />
            <span className="font-lato font-bold text-[64px] leading-none tracking-normal">
              SafeUse
            </span>
          </Link>
          <div className='text-[#7A7A7A]'>© 2025 SafeUse</div>
        </div>

        {/* Navigation Section */}
        <div className='flex flex-row justify-between items-center'>
          <NavLink
            to="/legal-terms"
            className="font-lato font-medium text-[24px] leading-none tracking-normal mr-[45px]"
          >
            Legal Terms
          </NavLink>
          <NavLink
            to="/privacy-policy"
            className="font-lato font-medium text-[24px] leading-none tracking-normal mr-[45px]"
          >
            Privacy Policy
          </NavLink>
          <NavigationList
            links={[
              { name: 'Home', path: '/' },
              { name: 'Substances', path: '/sustancias' },
              { name: 'Advice', path: '/advice' },
              { name: 'Shop', path: '/Shop' },
              { name: 'Contact', path: '/login' },
              { name: 'Log in/Sign up', path: '/login' },
            ]}
          />
        </div>
      </div>
    </footer>
  );
}