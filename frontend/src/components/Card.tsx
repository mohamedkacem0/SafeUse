import React from "react";
import PrimaryButton from './PrimaryButton'; 
interface DrugCardProps {
  imageSrc: string;
  name: string;
  title: string;
  formula: string;
  button?: string;
  onButtonClick?: () => void;
  onCardClick?: () => void;
  hideTitle?: boolean; // NUEVO
}

const DrugCard: React.FC<DrugCardProps> = ({
  imageSrc,
  name,
  title,
  formula,
  button = "See more",
  onButtonClick,
  onCardClick,
  hideTitle = false,
}) => {
  return (
    <div
      className="w-[350px] border border-gray-300 rounded-[12px] flex flex-col items-center p-6 gap-2 shadow-sm cursor-pointer hover:shadow-lg transition"
      onClick={onCardClick}
    >
      <img
        src={imageSrc}
        alt={name}
        className="w-[120px] h-[120px] object-contain mb-2"
      />
      <h3 className="font-lato font-bold text-[20px] leading-tight text-center">
        {name}
      </h3>
      {!hideTitle && (
        <p className="font-lato text-[14px] text-center leading-none">
          {title}
        </p>
      )}
      {/*<p className="font-lato text-[12px] italic text-center leading-tight mb-4">
        {formula}
      </p>*/}
      <div
        onClick={e => e.stopPropagation()}
      >
        <PrimaryButton
          className={`!bg-[#44844D] hover:scale-105 transition-all duration-300`}
          text={button}
          onClick={onButtonClick}
        />
      </div>
    </div>
  );
};
export default DrugCard;
