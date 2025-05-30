
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
  button = "See more",
  onButtonClick,
  onCardClick,
  hideTitle = false,
}) => {
  return (
    <div
      className="w-[350px] bg-gradient-to-br from-white to-gray-100 rounded-[12px] flex flex-col items-center p-6 gap-4 shadow-lg cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl border-t-4 border-t-[#44844D]"
      onClick={onCardClick}
    >
      <img
        src={imageSrc}
        alt={name}
        className="w-[150px] h-[150px] object-contain mb-2 rounded-md"
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
