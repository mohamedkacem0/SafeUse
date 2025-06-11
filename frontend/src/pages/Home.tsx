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
        <p className="absolute inset-0 flex items-end justify-center text-center pb-8 md:pb-12 lg:pb-16 text-white font-medium italic text-[16px] md:text-[28px] lg:text-[36px] [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
          “A platform to help you understand and reduce the risks of substance use.”
        </p>
      </div>

      
      <div className='sticky top-0 z-20'> 

 
      <div className="bg-gray-50 shadow-md py-12 md:py-16 px-4"> 
        <h2 className="text-center text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
          Explore Our Core Resources
        </h2>
        <p className="text-center text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-10 md:mb-12">
          Dive into detailed information on substances, learn essential harm reduction strategies, and find resources for testing.
        </p>
        <div className="flex flex-wrap justify-center items-stretch gap-8 md:gap-10 lg:gap-12 max-w-5xl mx-auto">
          <NavLink to="/substances" className="block transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <SquareBox
              image={InfoDrugs}
              title="InfoDrugs"
              subtitle="Effects, Risk, and Use tips "
            />
          </NavLink>
          <NavLink to="/advice" className="block transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <SquareBox
              image={HarmReduction}
              title="Harm Reduction"
              subtitle="Before, after and during use advice"
            />
          </NavLink>
          <NavLink to="/shop" className="block transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <SquareBox
              image={TestKits}
              title="Test Kits"
              subtitle="Shop drug chekcking kits"
            />
          </NavLink>
        </div> 
        <div className="mt-10 md:mt-12 flex justify-center">
          <NavLink to="/contact" className="w-full sm:w-auto sm:max-w-sm block transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <PrimaryButton text="Contact Us" className="!bg-gray-700 hover:!bg-gray-800 text-white h-[45px] md:h-[60px] w-[180px] md:w-[229px] text-[16px] md:text-[24px] font-medium" />
          </NavLink>
        </div>
      </div>

       
        <div className='bg-white border-t border-gray-300 px-4 py-12 md:py-16'>
          <p className="text-center text-gray-700 font-normal italic text-[20px] md:text-[28px] lg:text-[32px] max-w-3xl mx-auto">
            “This web site helped me understand the real risks.”
          </p>
        </div>

        
        <div className='bg-slate-100 border-t border-gray-300 py-10 md:py-16'>
          <p className="text-center text-gray-800 font-medium text-[24px] md:text-[32px] lg:text-[36px] px-4 mb-8 md:mb-10">
            Create your account and stay safe
          </p>
          <div className='flex justify-center px-4'>
            <NavLink to="/Login" className="inline-block transform hover:scale-105 transition-transform duration-300 ease-in-out">
              <PrimaryButton
                text="Get started"
                className="bg-[#111111] h-[50px] md:h-[66px] w-[180px] md:w-[229px] rounded-lg text-[20px] md:text-[32px] font-medium text-white"
              />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
