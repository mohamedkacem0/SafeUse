import React from 'react';

interface ButtonProps {
  text: string;
}

export default function PrimaryButton({ text }: ButtonProps) {
  return (
    <button
      className="w-[128px] h-[40px] bg-black text-white text-[16px] font-lato rounded-[20px] flex items-center justify-center"
    >
      {text}
    </button>
  );
}