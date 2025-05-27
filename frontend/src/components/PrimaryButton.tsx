
interface ButtonProps {
  text: string;
  className?: string;
  onClick?: () => void;
}

export default function PrimaryButton({ text, className, onClick }: ButtonProps) {
  return (
    <button
      className={`w-[128px] h-[40px] bg-[#111111] text-white text-[16px] rounded-[20px] flex items-center justify-center hover:bg-neutral-800  ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}