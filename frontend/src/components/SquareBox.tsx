

interface SquareBoxProps {
  image: string; 
  title: string; 
  subtitle: string; 
}

export default function SquareBox({ image, title, subtitle }: SquareBoxProps) {
  return (
    <div className="w-[300px] h-[280px] bg-[#44844D] flex flex-col gap-[20px] items-center justify-center rounded-[20px] pt-[2%]">
      <img src={image} alt={title} className="w-[100px] h-[100px] object-contain" />
      <h2 className="text-[#111111] text-[32px] font-medium text-center">{title}</h2>
      <div className='flex-grow '>
      <p className="text-[#111111] text-[18px] text-center font-normal">{subtitle}</p>
      </div>
    </div>
  );
}