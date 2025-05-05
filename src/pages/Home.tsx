import Banner from '../assets/images/Banner.jpg';
import InfoDrugs from '../assets/images/InfoDrugs.png';
import HarmReduction from '../assets/images/HarmReduction.png';
import TestKits from '../assets/images/TestKits.png';
import PrimaryButton from '../components/PrimaryButton';
import SquareBox from '../components/SquareBox';

export default function Home() {
  return (
    <div>
      <div className="relative">
        <img src={Banner} alt="banner" className="h-auto w-full" />

        <p className="absolute inset-0 text-center mt-[692px] text-white font-medium text-[36px]">
          “A platform to help you understand and reduce the risks of substance use.”
        </p>
      </div>
      <div className="flex justify-between items-center mt-[33px] px-[138px]">
        <PrimaryButton text="Explore Substances" className="!bg-[#546843] h-[88px] w-[459px] text-[36px] font-medium" />
        <PrimaryButton text="Learn Harm Reduction" className="!bg-[#4D9e81] h-[88px] w-[459px] text-[36px] font-medium !text-black" />
      </div>

      <div className="flex justify-around items-center mt-[77px] px-[68px]">
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
      <p className="text-center text-black font-light text-[36px] py-[40px]">
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
  );
}
