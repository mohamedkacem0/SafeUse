interface ButtonProps {
  text: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function PrimaryButton({ text, className, onClick, type = "button", disabled = false }: ButtonProps) {
  return (
    <button
      type={type}
      className={`w-[128px] h-[40px] bg-[#111111] text-white text-[16px] rounded-[20px] flex items-center justify-center hover:bg-neutral-800 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}