import React from 'react';

interface DescriptionProps {
  title: string;
  subtitle: string;
  link: string;
}

export default function Description({ title, subtitle, link }: DescriptionProps) {
  return (
    <div className="w-[1064px] h-[381px] border-[1px] border-black rounded-[20px] text-center flex flex-col justify-center gap-[32px]">
      <h2 className="text-[36px] font-medium text-black">{title}</h2>
      <p className="text-[24px] font-medium text-black">{subtitle}</p>
      <a href={link} className="text-black underline text-[20px]">
        Article Link
      </a>
    </div>
  );
}