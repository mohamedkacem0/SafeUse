import Banner from '../assets/images/Banner.webm';
import InfoDrugs from '../assets/images/InfoDrugs.png';
import HarmReduction from '../assets/images/HarmReduction.png';
import TestKits from '../assets/images/TestKits.png';
import PrimaryButton from '../components/PrimaryButton';
import SquareBox from '../components/SquareBox';

export default function Home() {
  return (
    <div className='relative'>
      <div className='sticky top-0 z-10'>
        <video autoPlay loop muted className="h-[730px] w-full object-fill">
          <source src={Banner} type="video/webm" />
          Your browser does not support the video tag.
        </video>
        <p className="absolute inset-0 text-center mt-[630px] text-white font-medium italic text-[36px]">
          “A platform to help you understand and reduce the risks of substance use.”
        </p>
        </div>
        <div className='sticky top-0 z-20 bg-white'>
      <div className="flex justify-evenly items-center pt-[33px] px-[138px]">
        <PrimaryButton text="Explore Substances" className="!bg-[#909E52] h-[81px] w-[422px] !text-[#111111] text-[36px] font-medium " />
        <PrimaryButton text="Learn Harm Reduction" className="!bg-[#44844D] h-[81px] w-[422px] text-[36px] font-medium " />
      </div>

      <div className="flex justify-between items-center mt-[77px] px-[120px]">
        <SquareBox
          image={InfoDrugs}
          title="InfoDrugs"
          subtitle="Effects, Risk, and Use tips "
        />
        <SquareBox
          image={HarmReduction}
          title="Harm Reduction"
          subtitle="Before, after and during use advice"
        />
        <SquareBox
          image={TestKits}
          title="Test Kits"
          subtitle="Shop drug chekcking kits"
        />
      </div>

      <div className='border-t-[1px] border-black mt-[37px]'>
      <p className="text-center text-[#111111] font-light italic text-[36px] py-[40px]">
          “This web site helped me understand the real risks.”
        </p>
      </div>

      <div className='border-t-[1px] border-black'>
        <p className="text-center text-black font-medium text-[48px] pt-[35px]">
          Create your account and stay safe
        </p>
        <div className='flex justify-center pt-[40px] pb-[52px]'>
        <PrimaryButton text="Get started" className="bg-black h-[66px] w-[229px] rounded-[20px] text-[36px] font-medium text-white" />
        </div>
        </div>
      </div>
    </div>
  );
}
