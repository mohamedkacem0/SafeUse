import { useState } from "react";
import PrimaryButton from "../components/PrimaryButton";

export default function PasswordReset() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    } 
    alert("Password changed!");
  };

  return (
    <div className="max-w-3xl mx-auto pt-16">
      <h1 className="text-[56px] font-bold mb-16">Password reset</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center mt-20"
      >
        <p className="text-[20px] mb-10 text-center">
          Set a new password
        </p>
        <label className="w-full max-w-md mb-2 text-gray-700 text-left" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-3 mb-6 text-[18px] focus:outline-none focus:ring-2 focus:ring-[#335A2C]"
          placeholder="Enter new password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <label className="w-full max-w-md mb-2 text-gray-700 text-left" htmlFor="confirm">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          required
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-3 mb-6 text-[18px] focus:outline-none focus:ring-2 focus:ring-[#335A2C]"
          placeholder="Confirm new password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />
        <PrimaryButton text="Confirm" className="w-[120px]" />
      </form>
    </div>
  );
}