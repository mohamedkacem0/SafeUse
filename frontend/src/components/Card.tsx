import React from "react";
import PrimaryButton from './PrimaryButton'; 


interface DrugCardProps {
  imageSrc: string;
  name: string;
  title: string;
  formula: string;
  button?: string;
}

const DrugCard: React.FC<DrugCardProps> = ({
  imageSrc,
  name,
  title,
  formula,
  button = "See more",
}) => {
  return (
    <div className="w-[350px] border border-gray-300 rounded-[12px] flex flex-col items-center p-6 gap-2 shadow-sm">
      <img
        src={imageSrc}
        alt={name}
        className="w-[120px] h-[120px] object-contain mb-2"
      />

      <h3 className="font-lato font-bold text-[20px] leading-tight text-center">
        {name}
      </h3>

      <p className="font-lato text-[14px] text-center leading-none">
        {title}
      </p>

      <p className="font-lato text-[12px] italic text-center leading-tight mb-4">
        {formula}
      </p>

      <PrimaryButton className="!bg-[#335A2C]" text={button} />
    </div>
  );
};

export default DrugCard;
