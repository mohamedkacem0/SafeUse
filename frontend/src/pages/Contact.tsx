// src/pages/Contact.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  Twitter,
  Instagram,
  MessageCircle,
} from "lucide-react";
import clsx from "clsx";

export default function Contact() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  const inputBase =
    "w-full border-b border-gray-400 bg-transparent py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
    first_name: data.get('firstName'),
     last_name:  data.get('lastName'),
     email:      data.get('email'),
     phone:      data.get('phone'),
     message:    data.get('message'),
   };
   try {
     const dbRes = await fetch(
       'http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/contact',
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
       }
     );
     if (!dbRes.ok) throw new Error('DB error');
   } catch (err) {
     console.error(err);
     setStatus('error');
     return;
   }

    try {
      const res = await fetch("https://formspree.io/f/mnndklal", {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: data,
      });

      if (res.ok) {
        // redirige a /success
        navigate("/success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus("error");
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="border-t-[1px] border-[#111111]">
        <p className="text-center text-[#111111] font-light text-[20px] md:text-[36px] py-[40px]">
          “We’d love to hear from you. Get in touch!”
        </p>
      </div>

      <div className="overflow-hidden bg-[#335A2C] rounded-xl border border-gray-300 shadow-sm md:grid md:grid-cols-3 md:gap-8">
        {/* Left panel */}
        <aside className="flex flex-col gap-8 bg-primary px-8 py-10 text-white sm:px-10 md:col-span-1">
          <header>
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <p className="mt-1 text-sm opacity-90">
              Reach out to us – we’d love to help.
            </p>
          </header>

          <ul className="space-y-6 text-sm">
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5" /> <span>+696 969 696</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5" /> <span>SafeUse@gmail.com</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-5 w-5" /> <span>Madrid</span>
            </li>
          </ul>

          <footer className="mt-auto flex gap-4 text-white/80">
            <a href="#" aria-label="Twitter" className="transition hover:opacity-100">
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/safeusetfg/"
              aria-label="Instagram"
              className="transition hover:opacity-100"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Discord" className="transition hover:opacity-100">
              <MessageCircle className="h-5 w-5" />
            </a>
          </footer>
        </aside>

        {/* Form or Error Message */}
        <div className="md:col-span-2 md:px-12 md:py-10 p-8 bg-white">
          {status === "error" && (
            <p className="text-red-600 mb-4">Error al enviar, inténtalo de nuevo.</p>
          )}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            <input type="hidden" name="_subject" value="Nuevo mensaje de SafeUse" />

            <div>
              <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className={inputBase}
                placeholder="Your first name"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className={inputBase}
                placeholder="Your last name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={inputBase}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={inputBase}
                placeholder="Optional"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className={clsx(inputBase, "resize-none")}
                placeholder="Write your message…"
                required
              />
            </div>

            <div className="sm:col-span-2 flex justify-center md:justify-end">
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-full bg-[#335A2C] px-8 py-2 text-white transition hover:bg-neutral-800 disabled:opacity-50"
              >
                {status === "sending" ? "Enviando…" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
