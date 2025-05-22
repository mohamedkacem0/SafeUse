import { useState } from "react";
import PrimaryButton from "../components/PrimaryButton";

export default function Verification() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Reset link sent to ${email}`);
  };

  return (
    <div className="max-w-3xl mx-auto pt-16">
      <h1 className="text-[56px] font-bold mb-16">Verification</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center mt-20"
      >
        <p className="text-[20px] mb-10 text-center">
          Enter your email to receive reset link
        </p>
        <label className="w-full max-w-md mb-2 text-gray-700 text-left" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-3 mb-6 text-[18px] focus:outline-none focus:ring-2 focus:ring-[#335A2C]"
          placeholder="yourname@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <PrimaryButton text="Send" className="w-[120px]" />
      </form>
    </div>
  );
}