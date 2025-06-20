 
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
import CatchyQuoteSection from "../components/CatchyQuoteSection";

export default function Contact() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");

  const inputBase =
    "w-full border border-gray-300 rounded-md bg-transparent px-3 py-2 text-base placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200";

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
       'api/contact',
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
    <section className="bg-gray-50 mx-auto max-w-6xl px-4 py-16">
      <CatchyQuoteSection quote="We’d love to hear from you. Get in touch!" ariaLabel="Contact page slogan" />
 
      <div className="mx-auto max-w-6xl overflow-hidden bg-[#335A2C] rounded-xl shadow-xl md:grid md:grid-cols-3 md:gap-0">  
 
        <aside className="flex flex-col gap-8 bg-primary px-8 py-10 text-white sm:px-10 md:col-span-1 md:rounded-l-xl">
          <header>
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <p className="mt-1 text-sm opacity-90">
              Reach out to us – we’d love to help.
            </p>
          </header>

          <ul className="space-y-6 text-base">
            <li className="flex items-center gap-3">
              <Phone className="h-6 w-6" /> <span>+696 969 696</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-6 w-6" /> <span>SafeUse@gmail.com</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-6 w-6" /> <span>Madrid</span>
            </li>
          </ul>

          <footer className="mt-auto flex gap-4 text-white/80">
            <a href="#" aria-label="Twitter" className="transition hover:opacity-100">
              <Twitter className="h-6 w-6" />
            </a>
            <a
              href="https://www.instagram.com/safeusetfg/"
              aria-label="Instagram"
              className="transition hover:opacity-100"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" aria-label="Discord" className="transition hover:opacity-100">
              <MessageCircle className="h-6 w-6" />
            </a>
          </footer>
        </aside>
 
        <div className="md:col-span-2 md:px-12 md:py-10 p-8 bg-white md:rounded-r-xl">
          {status === "error" && (
            <p className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
              Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.
            </p>
          )}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          >
            <input type="hidden" name="_subject" value="Nuevo mensaje de SafeUse" />

            <div>
              <label htmlFor="firstName" className="block mb-1.5 text-sm font-medium text-gray-700">
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
              <label htmlFor="lastName" className="block mb-1.5 text-sm font-medium text-gray-700">
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
              <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-gray-700">
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
              <label htmlFor="phone" className="block mb-1.5 text-sm font-medium text-gray-700">
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
              <label htmlFor="message" className="block mb-1.5 text-sm font-medium text-gray-700">
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
                className="rounded-full bg-[#335A2C] px-8 py-2.5 text-white font-semibold transition-all duration-300 ease-out hover:bg-[#2A4A23] disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105"
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
