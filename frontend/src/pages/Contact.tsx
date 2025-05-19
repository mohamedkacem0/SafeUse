import { Mail, MapPin, Phone, Twitter, Instagram, MessageCircle } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: send to backend / email service
    console.log(form);
  };

  const inputBase =
    "w-full border-b border-gray-400 bg-transparent py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary";

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="border-t-[1px]  border-[#111111]">
        <p className="text-center text-[#111111] font-light text-[36px] py-[40px]">
          “We’d love to hear from you. Get in touch!”
        </p>
      </div>

      <div className="overflow-hidden bg-[#335A2C] rounded-xl border border-gray-300 shadow-sm md:grid md:grid-cols-3 md:gap-8 ">
        {/* Left panel */}
        <aside className="flex flex-col gap-8 bg-primary px-8 py-10 text-white sm:px-10 md:col-span-1">
          <header>
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <p className="mt-1 text-sm opacity-90">Reach out to us – we’d love to help.</p>
          </header>

          <ul className="space-y-6 text-sm">
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5" />
              <span>+696 969 696</span>
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
            <a href="https://www.instagram.com/safeusetfg/" aria-label="Instagram" className="transition hover:opacity-100">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Discord" className="transition hover:opacity-100">
              <MessageCircle className="h-5 w-5" />
            </a>
          </footer>
        </aside>

        {/* Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 md:px-12 md:py-10 p-8 grid grid-cols-1 gap-6 sm:grid-cols-2 bg-white">
          {/* Row 1 */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-700" htmlFor="firstName">First Name</label>
            <input id="firstName" name="firstName" type="text" className={inputBase} value={form.firstName} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-700" htmlFor="lastName">Last Name</label>
            <input id="lastName" name="lastName" type="text" className={inputBase} value={form.lastName} onChange={handleChange} required />
          </div>

          {/* Row 2 */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-700" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={inputBase} value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-700" htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" type="tel" className={inputBase} value={form.phone} onChange={handleChange} />
          </div>

          {/* Row 3 – textarea full width */}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-700" htmlFor="message">Message</label>
            <textarea id="message" name="message" rows={4} className={clsx(inputBase, 'resize-none')} placeholder="Write your message…" value={form.message} onChange={handleChange} required />
          </div>

          {/* Submit button */}
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="rounded-full bg-[#335A2C] px-8 py-2 text-white transition hover:bg-neutral-800">Send</button>
          </div>
        </form>
      </div>
    </section>
  );
}
