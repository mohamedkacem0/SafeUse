import React from 'react';

interface DescriptionProps {
  title: string;
  subtitle: string;
  link: string;
  active?: boolean; // Add the active prop
}

export default function Description({ title, subtitle, link, active }: DescriptionProps) {
  return (
    <div
      className={`w-[65%] h-[381px] border-[1px] rounded-[20px] text-center flex flex-col justify-center gap-[32px] transition-all duration-500
        ${active ? 'border-[#44844D] shadow-[0_0_24px_0_rgba(68,132,77,0.18)] scale-[1.02]' : 'border-[#111111]' }
      `}
    >
      <h2 className="text-[32px] font-medium text-[#111111]">{title}</h2>
      <p className="text-[24px] font-medium text-[#111111] px-[50px]">{subtitle}</p>
      <a href={link} className="text-[#111111] underline text-[20px]">
        Article Link
      </a>
    </div>
  );
}