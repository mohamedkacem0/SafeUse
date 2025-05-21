import { NavLink, Link } from 'react-router-dom';
import logo from '../assets/logo/logo.svg';
import NavigationList from './NavigationList';

export default function Footer() {
  return (
    <footer className="border-t-[1px] border-[#111111] sticky top-0 z-40 bg-white">
      <div className="flex flex-col md:flex-row justify-evenly items-center p-[20px] gap-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-4 md:mb-0">
          <Link to="/" className="flex flex-col items-center">
            <img src={logo} alt="logo" className="w-12 h-12 md:w-auto md:h-auto" />
            <span className="font-lato font-bold text-[40px] md:text-[64px] leading-none tracking-normal">
              SafeUse
            </span>
          </Link>
          <div className='text-[#7A7A7A] text-sm md:text-base'>© 2025 SafeUse</div>
        </div>

        {/* Navigation Section */}
        <div className='flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8'>
          <NavLink
            to="/LegalTerms"
            className="font-lato font-medium text-[20px] md:text-[24px] leading-none tracking-normal md:mr-[45px]"
          >
            Legal Terms
          </NavLink>
          <NavLink
            to="/PrivacyPolicy"
            className="font-lato font-medium text-[20px] md:text-[24px] leading-none tracking-normal md:mr-[45px]"
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
            ]}/>
        </div>
      </div>
    </footer>
  );
}