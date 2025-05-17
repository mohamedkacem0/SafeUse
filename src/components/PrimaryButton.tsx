import React from 'react';

interface ButtonProps {
  text: string;
  className?: string; 
}

export default function PrimaryButton({ text, className }: ButtonProps) {
  return (
    <button
      className={`w-[128px] h-[40px] bg-[#111111] text-white text-[16px] rounded-[20px] flex items-center justify-center hover:scale-105 duration-300  ${className}`}
    >
      {text}
    </button>
  );
}