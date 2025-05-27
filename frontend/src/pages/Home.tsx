import Banner from '../assets/images/homeBanner4K.mp4';
import InfoDrugs from '../assets/images/InfoDrugs.png';
import HarmReduction from '../assets/images/HarmReduction.png';
import TestKits from '../assets/images/TestKits.png';
import PrimaryButton from '../components/PrimaryButton';
import SquareBox from '../components/SquareBox';
import { NavLink } from 'react-router-dom';

export default function Home() {
  return (
    <div className='relative'>
      <div className='sticky top-0 z-10'>
        <video autoPlay loop muted className="h-[300px] md:h-[500px] lg:h-[730px] w-full object-cover pt-[50px] md:pt-0">
          <source src={Banner} type="video/webm" />
          Your browser does not support the video tag.
        </video>
        <p className="absolute inset-0 flex items-end justify-center text-center pb-[0px] md:pb-12 lg:mt-[630px] text-white font-medium italic text-[16px] md:text-[28px] lg:text-[36px]">
          “A platform to help you understand and reduce the risks of substance use.”
        </p>
      </div>

      
      <div className='sticky top-0 z-20 bg-white'>
        <div className="flex flex-col md:flex-row justify-evenly items-center pt-6 md:pt-10 px-4 md:px-[40px] lg:px-[200px] gap-4 md:gap-0">
          <PrimaryButton text="Explore Substances" className="!bg-[#909E52] h-[60px] md:h-[80px] w-full md:w-[400px] !text-[#111111] text-[20px] md:text-[32px] font-medium " />
          <PrimaryButton text="Learn Harm Reduction" className="!bg-[#44844D] h-[60px] md:h-[80px] w-full md:w-[400px] text-[20px] md:text-[32px] font-medium " />
        </div>

        
        <div className="flex md:flex-row flex-col  items-center justify-center gap-[60px] mt-10 md:mt-[77px] ">
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

       
        <div className='border-t-[1px] border-[#111111] mt-10 md:mt-[37px]'>
          <p className="text-center text-[#111111] font-light italic text-[20px] md:text-[28px] lg:text-[32px] py-8 md:py-[40px]">
            “This web site helped me understand the real risks.”
          </p>
        </div>

        
        <div className='border-t-[1px] border-[#111111]'>
          <p className="text-center text-[#111111] font-medium text-[24px] md:text-[32px] lg:text-[36px] pt-8 md:pt-[35px]">
            Create your account and stay safe
          </p>
          <div className='flex justify-center pt-8 md:pt-[40px] pb-12 md:pb-[52px]'>
            <NavLink to="/Login" className="inline-block">
              <PrimaryButton
                text="Get started"
                className="bg-[#111111] h-[50px] md:h-[66px] w-[180px] md:w-[229px] rounded-[20px] text-[20px] md:text-[32px] font-medium text-white"
              />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
