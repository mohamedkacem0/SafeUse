// src/pages/LoginSignup.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function LoginSignup() {
  const navigate = useNavigate();

  // Estado login
  const [login, setLogin] = useState({ email: "", password: "", show: false });
  const [loginError, setLoginError] = useState<string | null>(null);
  // Estado signup
  const [sign, setSign] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm: "",
    showPwd: false,
    showConf: false
  });
  const [signError, setSignError] = useState<string | null>(null);

  const input =
    "w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm placeholder:text-gray-500 focus:border-primary focus:outline-none";
  const label = "mb-2 text-xs font-semibold tracking-wide text-gray-600";

  // Handler login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: login.email, password: login.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Error al iniciar sesión");
      } else {
        // Guardamos datos de usuario y redirigimos
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      }
    } catch (err) {
      setLoginError("Error de red");
    }
  };

  // Handler signup
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: sign.name,
          correo: sign.email,
          password: sign.password,
          telefono: sign.phone,
          direccion: sign.address,
          tipo_usuario: "user",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignError(data.error || "Error al crear cuenta");
      } else {
        // Guardamos datos de usuario y redirigimos
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      }
    } catch (err) {
      setSignError("Error de red");
    }
  };

  return (
    <section className="mx-auto max-w-5xl mt-10 px-4 py-16">
      <h1 className="mb-12 text-center text-5xl font-extrabold">Login/Sign up</h1>

      <div className="flex flex-col gap-12 lg:flex-row lg:gap-0">
        {/* FORM LOGIN */}
        <form
          onSubmit={handleLogin}
          className="flex w-full flex-col items-center lg:w-1/2 lg:pr-12"
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

          <button className="rounded-full bg-neutral-900 px-8 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
            Log in
          </button>
        </form>

        <div className="hidden h-auto w-px self-stretch bg-gray-300 lg:block" />

        {/* FORM SIGNUP */}
        <form
          onSubmit={handleSignup}
          className="flex w-full flex-col items-center lg:w-1/2 lg:pl-12"
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

          <button className="rounded-full bg-neutral-900 px-8 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
            Sign up
          </button>
        </form>
      </div>
    </section>
  );
}
