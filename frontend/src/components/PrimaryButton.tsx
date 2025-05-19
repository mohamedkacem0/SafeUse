import React from 'react';

interface ButtonProps {
  text: string;
  className?: string;
  onClick?: () => void;
}

export default function PrimaryButton({ text, className, onClick }: ButtonProps) {
  return (
    <button
      className={`w-[128px] h-[40px] bg-[#335A2C] text-white text-[16px] rounded-[20px] flex items-center justify-center hover:scale-105 duration-300  ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}