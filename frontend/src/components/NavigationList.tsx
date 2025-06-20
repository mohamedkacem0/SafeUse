import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import arrow from '../assets/icons/arrowNav.svg';

interface NavigationListProps {
  links: { name: string; path: string }[];  
}

export default function NavigationList({ links }: NavigationListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); 
  const buttonRef = useRef<HTMLButtonElement>(null);  

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
 
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      dropdownRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}> 
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="text-[20px] md:text-[24px] font-medium text-[#111111] flex items-center gap-2 "
      >
        Navigation 
        <div
          className={`transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <img src={arrow} alt="arrow" />
        </div>
      </button> 
      {isOpen && (
        <div className="absolute w-full top-[50px] left-0 bg-white border border-[#111111] rounded-lg shadow-lg p-[11px]">
          <ul className="flex flex-col gap-2">
            {links.map((link, index) => (
              <li key={index}>
                <NavLink
                  to={link.path}
                  className="text-[16px] text-[#111111] hover:underline"
                  onClick={() => setIsOpen(false)} 
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}