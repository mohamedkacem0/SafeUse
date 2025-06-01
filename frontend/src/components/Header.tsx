// src/components/Header.tsx
import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import Button from "./PrimaryButton";
import logo from "../assets/logo/logo.svg";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ ID_Usuario: number; Nombre: string; Correo: string; Tipo_Usuario: string } | null>(null);
  const [cartItemCount, setCartItemCount] = useState<number>(0);
  const navLinkClasses = "block md:inline px-4 py-2 md:p-0";
  const location = useLocation();

  // Cada vez que cambie la ruta (login/logout produce un cambio de ruta), recarga el user
  useEffect(() => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : null);

    // Fetch cart item count
    const fetchCartCount = async () => {
      try {
        const response = await fetch('/api?route=api/cart/count', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCartItemCount(data.count || 0);
        } else {
          // console.error('Failed to fetch cart count');
          setCartItemCount(0); // Reset or handle error appropriately
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartItemCount(0);
      }
    };

    fetchCartCount();

    // Listen for custom cart update events
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [location.pathname]);

  if (location.pathname === "/politica-de-cookies") return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b-[1px] border-[#111111] bg-white">
      <div className="h-[70px] max-w-[1440px] mx-auto flex flex-row justify-between items-center px-4">
        {/*  */}
        <Link to="/" className="flex flex-row items-center">
          <img src={logo} alt="logo" className="w-10 h-10 mr-2" />
          <span className="font-lato font-bold text-[32px] md:text-[64px] leading-none tracking-normal">
            SafeUse
          </span>
        </Link>

        {/* */}
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

        {/**/}
        <div className="hidden md:flex flex-row items-center gap-[12px]">
          <NavLink to="/cart" aria-label="Cart" className="relative">
            <ShoppingCart />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {cartItemCount}
              </span>
            )}
          </NavLink>
          {user ? (
            <NavLink to="/profile" aria-label="Profile">
              <User />
            </NavLink>
          ) : (
            <NavLink to="/login" aria-label="Login">
              <Button text="Log in/Sign up" />
            </NavLink>
          )}
        </div>

        {}
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
                Cart <span className="relative"><ShoppingCart className="inline-block" />{cartItemCount > 0 && <span className="absolute -top-1 -right-2 ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">{cartItemCount}</span>}</span>
              </span>
            </NavLink>
            {user ? (
              <NavLink
                to="/profile"
                className={navLinkClasses}
                onClick={() => setMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  Profile<User />
                </span>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className={navLinkClasses}
                onClick={() => setMenuOpen(false)}
              >
                <Button text="Log in/Sign up" />
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
