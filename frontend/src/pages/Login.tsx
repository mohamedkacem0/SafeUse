  
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function LoginSignup() {
  const navigate = useNavigate();
 
  const [login, setLogin] = useState({ email: "", password: "", show: false });
  const [loginError, setLoginError] = useState<string | null>(null);
 
  const [sign, setSign] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm: "",
    showPwd: false,
    showConf: false,
  });
  const [signError, setSignError] = useState<string | null>(null);
 
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [showSignupCard, setShowSignupCard] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowLoginCard(true), 100);
    const timer2 = setTimeout(() => setShowSignupCard(true), 300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const input =
    "w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm placeholder:text-gray-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 focus:outline-none transition-all duration-300 ease-in-out";
  const label = "mb-2 text-xs font-semibold tracking-wide text-gray-600";
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: login.email, password: login.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Error al iniciar sesión");
      } else { 
        localStorage.setItem("user", JSON.stringify(data.user));
 
        if (data.user.Tipo_Usuario === "admin") {
          if (data.users) {
            localStorage.setItem("users", JSON.stringify(data.users));
          }
          navigate("/adminDashboard");
        } else {
  
          navigate("/");
        }
      }
    } catch (err) {
      setLoginError("Error de red");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignError(null);
    if (sign.password !== sign.confirm) {
      setSignError("Las contraseñas no coinciden");
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: sign.name,
          correo: sign.email,
          password: sign.password,
          telefono: sign.phone,
          direccion: sign.address,
          tipo_usuario: "usuario",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignError(data.error || "Error al crear cuenta");
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      }
    } catch (err) {
      setSignError("Error de red");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl w-full">
        <h1 className="mb-12 text-center text-5xl font-extrabold mt-10">Login/Sign up</h1>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-0">
 
          <div
            className={`w-full lg:w-1/2 lg:pr-6 transform transition-all duration-700 ease-out ${
              showLoginCard ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}>
            <form
              onSubmit={handleLogin}
              className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center w-full hover:-translate-y-1 hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out"
            >
              <h2 className="mb-8 text-[30px] font-bold">Log in</h2>

              {loginError && <p className="mb-4 text-red-600">{loginError}</p>}

              <div className="mb-6 w-full max-w-xs">
                <label className={label}>Email address</label>
                <input
                  className={input}
                  type="email"
                  required
                  value={login.email}
                  onChange={(e) => setLogin({ ...login, email: e.target.value })}
                />
              </div>

              <div className="mb-8 w-full max-w-xs relative">
                <label className={label}>Password</label>
                <input
                  className={input}
                  type={login.show ? "text" : "password"}
                  required
                  value={login.password}
                  onChange={(e) => setLogin({ ...login, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-500"
                  onClick={() => setLogin({ ...login, show: !login.show })}
                >
                  {login.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button className="w-full max-w-xs rounded-md bg-sky-600 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 active:scale-[0.98] active:brightness-95 transition-all duration-150 ease-in-out">
                Log in
              </button>
            </form>
          </div>

          <div className="hidden lg:block h-auto w-px self-stretch bg-gray-300 mx-6" />
 
          <div
            className={`w-full lg:w-1/2 lg:pl-6 transform transition-all duration-700 ease-out ${
              showSignupCard ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}>
            <form
              onSubmit={handleSignup}
              className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center w-full hover:-translate-y-1 hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out"
            >
              <h2 className="mb-8 text-[30px] font-bold">Sign up</h2>

              {signError && <p className="mb-4 text-red-600">{signError}</p>}

              <div className="mb-4 w-full max-w-xs">
                <label className={label}>Name</label>
                <input
                  className={input}
                  type="text"
                  required
                  value={sign.name}
                  onChange={(e) => setSign({ ...sign, name: e.target.value })}
                />
              </div>
              <div className="mb-4 w-full max-w-xs">
                <label className={label}>Email</label>
                <input
                  className={input}
                  type="email"
                  required
                  value={sign.email}
                  onChange={(e) => setSign({ ...sign, email: e.target.value })}
                />
              </div>
              <div className="mb-4 w-full max-w-xs">
                <label className={label}>Mobile number (optional)</label>
                <input
                  className={input}
                  type="tel"
                  value={sign.phone}
                  onChange={(e) => setSign({ ...sign, phone: e.target.value })}
                />
              </div>
              <div className="mb-4 w-full max-w-xs">
                <label className={label}>Address (optional)</label>
                <input
                  className={input}
                  type="text"
                  value={sign.address}
                  onChange={(e) => setSign({ ...sign, address: e.target.value })}
                />
              </div>

              <div className="mb-4 w-full max-w-xs relative">
                <label className={label}>Password</label>
                <input
                  className={input}
                  type={sign.showPwd ? "text" : "password"}
                  required
                  value={sign.password}
                  onChange={(e) => setSign({ ...sign, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-500"
                  onClick={() => setSign({ ...sign, showPwd: !sign.showPwd })}
                >
                  {sign.showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="mb-6 w-full max-w-xs relative">
                <label className={label}>Confirm password</label>
                <input
                  className={input}
                  type={sign.showConf ? "text" : "password"}
                  required
                  value={sign.confirm}
                  onChange={(e) => setSign({ ...sign, confirm: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-500"
                  onClick={() => setSign({ ...sign, showConf: !sign.showConf })}
                >
                  {sign.showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button className="w-full max-w-xs rounded-md bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98] active:brightness-95 transition-all duration-150 ease-in-out">
                Sign up
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
