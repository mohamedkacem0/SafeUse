import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginSignup() {
  const [login, setLogin] = useState({ email: "", password: "", show: false });
  const [sign, setSign] = useState({ name: "", email: "", phone: "", address: "", password: "", confirm: "", showPwd: false, showConf: false });

  const input =
    "w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm placeholder:text-gray-500 focus:border-primary focus:outline-none";
  const label = "mb-2 text-xs font-semibold tracking-wide text-gray-600";

  return (
    <section className="mx-auto max-w-5xl mt-10 px-4 py-16">
      <h1 className="mb-12 text-center text-5xl font-extrabold">Login/Sign up</h1>

      {/* contenedor responsive: column en móvil, row en desktop */}
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-0">
        {/* LOGIN */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full flex-col items-center lg:w-1/2 lg:pr-12"
        >
          <h2 className="mb-8 text-[30px] font-bold">Log in</h2>

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
            <button type="button" className="absolute right-3 top-8 text-gray-500" onClick={() => setLogin({ ...login, show: !login.show })}>
              {login.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <a href="#" className="mb-8 text-xs text-gray-600 underline">
            Forget your password
          </a>

          <button className="rounded-full bg-neutral-900 px-8 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
            Log in
          </button>
        </form>

        {/* DIVIDER (solo desktop) */}
        <div className="hidden h-auto w-px self-stretch bg-gray-300 lg:block" />

        {/* SIGN UP */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full flex-col items-center lg:w-1/2 lg:pl-12"
        >
          <h2 className="mb-8 text-[30px] font-bold">Sign up</h2>

          {[
            { label: "Name",   name: "name",   type: "text",   req: true },
            { label: "Email account", name: "email", type: "email", req: true },
            { label: "Mobile number (optional)", name: "phone", type: "tel", req: false },
            { label: "Address (optional)", name: "address", type: "text", req: false },
          ].map((f) => (
            <div key={f.name} className="mb-4 w-full max-w-xs">
              <label className={label}>{f.label}</label>
              <input
                className={input}
                type={f.type}
                required={f.req}
                value={(sign as any)[f.name]}
                onChange={(e) => setSign({ ...sign, [f.name]: e.target.value })}
              />
            </div>
          ))}

          {/* Password */}
          <div className="mb-4 w-full max-w-xs relative">
            <label className={label}>Password</label>
            <input
              className={input}
              type={sign.showPwd ? "text" : "password"}
              required
              value={sign.password}
              onChange={(e) => setSign({ ...sign, password: e.target.value })}
            />
            <button type="button" className="absolute right-3 top-8 text-gray-500" onClick={() => setSign({ ...sign, showPwd: !sign.showPwd })}>
              {sign.showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Confirm */}
          <div className="mb-6 w-full max-w-xs relative">
            <label className={label}>Confirm password</label>
            <input
              className={input}
              type={sign.showConf ? "text" : "password"}
              required
              value={sign.confirm}
              onChange={(e) => setSign({ ...sign, confirm: e.target.value })}
            />
            <button type="button" className="absolute right-3 top-8 text-gray-500" onClick={() => setSign({ ...sign, showConf: !sign.showConf })}>
              {sign.showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <p className="mb-8 max-w-xs text-center text-xs text-gray-600">
            By signing up, you agree to the <a className="underline" href="#">Terms of Service</a> and acknowledge you've read our <a className="underline" href="#">Privacy Policy</a>.
          </p>

          <button className="rounded-full bg-neutral-900 px-8 py-2 text-sm font-semibold text-white hover:bg-neutral-800">
            Sign up
          </button>
        </form>
      </div>
    </section>
  );
}
