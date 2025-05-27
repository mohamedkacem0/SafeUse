import { useState } from "react";
import { Pencil } from "lucide-react";
import PrimaryButton from "../components/PrimaryButton";

export default function Profile() {
  const [user] = useState({
    name: "Your name",
    email: "SafeUse@gmail.com",
    mobile: "",
    address: "USA",
  });

  return (
    <div className="max-w-2xl mx-auto pt-12 pb-8 flex flex-col items-center">
      <h1 className="text-[56px] font-bold mb-8 w-full text-left">Profile</h1>
      {/* Avatar */}
      <div className="relative flex flex-col items-center mb-6">
        <div className="w-[140px] h-[140px] rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-[80px]">
          <span>
            <svg width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path stroke="currentColor" strokeWidth="2" d="M4 20c0-4 4-7 8-7s8 3 8 7" />
            </svg>
          </span>
        </div>
        <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 border border-gray-300 hover:bg-gray-100">
          <Pencil size={20} className="text-gray-400" />
        </button>
      </div>
      {/* Name and Email */}
      <div className="text-center mb-10">
        <div className="text-[28px] font-semibold">{user.name}</div>
        <div className="text-gray-400 text-[18px]">{user.email}</div>
      </div>
      {/* Info Table */}
      <div className="w-full bg-white rounded-xl">
        <div className="flex justify-between items-center border-b px-4 py-4">
          <span className="text-gray-500">Name</span>
          <span className="flex items-center gap-2 text-gray-700">{user.name} <Pencil size={18} className="text-gray-400 cursor-pointer" /></span>
        </div>
        <div className="flex justify-between items-center border-b px-4 py-4">
          <span className="text-gray-500">Email account</span>
          <span className="flex items-center gap-2 text-gray-700">{user.email} <Pencil size={18} className="text-gray-400 cursor-pointer" /></span>
        </div>
        <div className="flex justify-between items-center border-b px-4 py-4">
          <span className="text-gray-500">Mobile number</span>
          <span className="flex items-center gap-2 text-gray-700">{user.mobile || "Add number"} <Pencil size={18} className="text-gray-400 cursor-pointer" /></span>
        </div>
        <div className="flex justify-between items-center px-4 py-4">
          <span className="text-gray-500">Address</span>
          <span className="flex items-center gap-2 text-gray-700">{user.address} <Pencil size={18} className="text-gray-400 cursor-pointer" /></span>
        </div>
      </div>
      {/* Change password & Logout */}
      <div className="flex flex-col items-center mt-10">
        <a href="#" className="text-xs underline text-gray-600 mb-4">Change your password</a>
        <PrimaryButton text="Logout" className="w-[120px]" />
      </div>
    </div>
  );
}