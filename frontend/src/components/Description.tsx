

interface DescriptionProps {
  title: string;
  subtitle: string;
  link: string;
  active?: boolean;
  width?: string;  
  className?: string; 
}

export default function Description({
  title,
  subtitle,
  link,
  active,
  width = "w-[65%]",  
  className = "",
}: DescriptionProps) {
  return (
    <div
      className={`
        ${width}
        h-auto p-[2%] border-[1px] rounded-[20px] text-center flex flex-col justify-center gap-[32px] transition-all duration-500
        ${active ? 'border-[#44844D] shadow-[0_0_24px_0_rgba(68,132,77,0.18)] scale-[1.02]' : 'border-[#111111]'}
        ${className}
      `}
    >
      <h2 className="text-[16px] md:text-[24px] font-medium text-[#111111]">{title}</h2>
      <p className="text-[12px] md:text-[18px] font-light text-[#111111] px-[50px]">{subtitle}</p>
      {link && (
        <a href={link} className="text-[#111111] underline text-[20px]">
          Article Link
        </a>
      )}
    </div>
  );
}