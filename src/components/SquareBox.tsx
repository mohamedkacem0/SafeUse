import React from 'react';

interface SquareBoxProps {
  image: string; // Ruta de la imagen
  title: string; // Texto principal (36px)
  subtitle: string; // Texto secundario (24px)
}

export default function SquareBox({ image, title, subtitle }: SquareBoxProps) {
  return (
    <div className="w-[350px] h-[350px] bg-[#6AA397] flex flex-col gap-[36px] items-center justify-center rounded-[20px] ">
      <img src={image} alt={title} className="w-[100px] h-[100px] object-contain" />
      <h2 className="text-black text-[36px] font-medium text-center">{title}</h2>
      <p className="text-black text-[24px] text-center font-normal">{subtitle}</p>
    </div>
  );
}