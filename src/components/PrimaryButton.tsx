import React from 'react';

interface ButtonProps {
  text: string;
  className?: string; // Optional className prop for additional styles
}

export default function PrimaryButton({ text, className }: ButtonProps) {
  return (
    <button
      className={`w-[128px] h-[40px] bg-black text-white text-[16px] rounded-[20px] flex items-center justify-center ${className}`}
    >
      {text}
    </button>
  );
}