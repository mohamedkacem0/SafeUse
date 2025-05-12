import React from 'react';

interface SquareBoxProps {
  image: string; 
  title: string; 
  subtitle: string; 
}

export default function SquareBox({ image, title, subtitle }: SquareBoxProps) {
  return (
    <div className="w-[320px] h-[320px] bg-[#44844D] flex flex-col gap-[20px] items-center justify-center rounded-[20px] pt-[2%]">
      <img src={image} alt={title} className="w-[100px] h-[100px] object-contain" />
      <h2 className="text-black text-[36px] font-medium text-center">{title}</h2>
      <div className='flex-grow '>
      <p className="text-black text-[24px] text-center font-normal">{subtitle}</p>
      </div>
    </div>
  );
}