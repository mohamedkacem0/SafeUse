
import PrimaryButton from './PrimaryButton'; 
interface DrugCardProps {
  imageSrc: string;
  name: string;
  title: string;
  formula: string;
  stock?: number;
  button?: string;
  onButtonClick?: () => void;
  onCardClick?: () => void;
  hideTitle?: boolean;  
  buttonDisabled?: boolean;
}

const DrugCard: React.FC<DrugCardProps> = ({
  imageSrc,
  name,
  title,
  formula,
  stock,
  button = "See more",
  onButtonClick,
  onCardClick,
  hideTitle = false,
  buttonDisabled = false,
}) => {
  return (
    <div
      className="w-[350px] bg-gradient-to-br from-white to-gray-100 rounded-[12px] flex flex-col items-center p-6 gap-4 shadow-lg cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl border-t-4 border-t-[#44844D] hover:border-t-emerald-500"
      onClick={onCardClick}
    >
      <img
        src={imageSrc}
        alt={name}
        className="w-[150px] h-[150px] object-contain mb-2 rounded-md"
      />
      <h3 className="font-lato font-bold text-[20px] leading-tight text-center truncate w-full text-ellipsis overflow-hidden">
  {name}
</h3>
      <p className="font-lato text-[16px] text-center font-bold text-emerald-600 my-2">
        {formula}
      </p>
      <div className="h-[20px]">
  {stock !== undefined && stock > 0 && stock < 5 ? (
    <p className="font-lato text-[14px] text-center text-red-600 font-bold">
      Only {stock} units left!
    </p>
  ) : (
    <span className="invisible">Only 4 units left!</span>
  )}
</div>

      {!hideTitle && (
        <p className="font-lato text-[14px] text-center leading-none">
          {title}
        </p>
      )}
      <div
        onClick={e => e.stopPropagation()}
      >
        <PrimaryButton
          className={`!bg-[#44844D] hover:scale-105 transition-all duration-300 ${buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          text={button}
          onClick={onButtonClick}
          disabled={buttonDisabled}
        />
      </div>
    </div>
  );
};
export default DrugCard;
