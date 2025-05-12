import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';

interface NavigationListProps {
  links: { name: string; path: string }[]; // Array of links with name and path
}

export default function NavigationList({ links }: NavigationListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Reference to the dropdown container

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close the dropdown when clicking outside
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navigation Button */}
      <button
        onClick={toggleDropdown}
        className="text-[36px] font-medium text-black flex items-center gap-2"
      >
        Navigation
        {/* Arrow Icon */}
        <div
          className={`transform transition-transform duration-100 -rotate-90 flex items-center ${
            isOpen ? '!rotate-90' : 'rotate-0'
          }`}
        >
          &lt;
        </div>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute w-full top-[50px] left-0 bg-white border border-black rounded-lg shadow-lg p-4">
          <ul className="flex flex-col gap-2">
            {links.map((link, index) => (
              <li key={index}>
                <NavLink
                  to={link.path}
                  className="text-[24px] text-black hover:underline"
                  onClick={() => setIsOpen(false)} // Close dropdown on click
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