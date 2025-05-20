import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import Button from "./PrimaryButton";
import logo from "../assets/logo/logo.svg";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinkClasses = "block md:inline px-4 py-2 md:p-0";

  if (location.pathname === "/politica-de-cookies") return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b-[1px] border-[#111111] bg-white">
      <div className="h-[70px] max-w-[1440px] mx-auto flex flex-row justify-between items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex flex-row items-center">
          <img src={logo} alt="logo" className="w-10 h-10 mr-2" />
          <span className="font-lato font-bold text-[32px] md:text-[64px] leading-none tracking-normal">
            SafeUse
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-[30px] text-[20px] md:text-[24px] font-medium">
          <NavLink to="/sustancias" className={navLinkClasses}>
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

        {/* Desktop Right */}
        <div className="hidden md:flex flex-row items-center gap-[12px]">
          <NavLink to="/cart" aria-label="Cart">
            <ShoppingCart />
          </NavLink>
          <NavLink to="/login" aria-label="Login">
            <Button text="Log in/Sign up" />
          </NavLink>
        </div>

        {/* Hamburger menu (mobile only) */}
        <button
          className="md:hidden ml-2"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open menu"
        >
          {menuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-[70px] left-0 w-full bg-white border-b border-[#111111] z-50">
          <nav className="flex flex-col items-center py-4 space-y-4 text-[20px] font-medium">
            <NavLink
              to="/sustancias"
              className={navLinkClasses}
              onClick={() => setMenuOpen(false)}
            >
              Substances
            </NavLink>
            <NavLink
              to="/Advice"
              className={navLinkClasses}
              onClick={() => setMenuOpen(false)}
            >
              Advice
            </NavLink>
            <NavLink
              to="/shop"
              className={navLinkClasses}
              onClick={() => setMenuOpen(false)}
            >
              Shop
            </NavLink>
            <NavLink
              to="/contact"
              className={navLinkClasses}
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </NavLink>
            <NavLink
              to="/cart"
              className={navLinkClasses}
              onClick={() => setMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                Cart<ShoppingCart /> 
              </span>
            </NavLink>
            <NavLink
              to="/login"
              className={navLinkClasses}
              onClick={() => setMenuOpen(false)}
            >
              <Button text="Log in/Sign up" />
            </NavLink>
          </nav>
        </div>
      )}
    </div>
  );
}