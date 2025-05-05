import { NavLink, Link } from 'react-router-dom';
import logo from '../assets/logo/logo.svg';
export default function Footer() {
  return (
    <footer className=" border-t-[1px] border-black">
        <div className='flex flex-row justify-between items-center p-[20px]'>
            <div className="flex flex-col items-center">
                <Link to="/" className="flex flex-col items-center">
                    <img src={logo} alt="logo" className="" />
                    <span className="font-lato font-bold text-[64px] leading-none tracking-normal">SafeUse</span>
                </Link>
                <div>
                    © 2025 SafeUse
                </div>
            </div>
            <div>
                <NavLink to="/" className="flex flex-row items-center gap-[45px] font-lato font-medium text-[36px] leading-none tracking-normal">
                    <span className="">Legal Terms</span>
                    <span className="">Privacy Policy</span>
                    <span className="">Navigation</span>
                </NavLink>
            </div>
        </div>
      
    </footer>
  );
}