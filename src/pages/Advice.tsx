import Description from '../components/Description';
import { NavLink, Link } from 'react-router-dom';
import PrimaryButton from '../components/PrimaryButton'; 
import Banner from '../assets/images/adviceBanner.png';

export default function Advice() {
  return (
    <div>
      <div className="sticky top-0 z-10 h-[400px] w-full overflow-hidden">
        <img src={Banner} alt="Advice Banner" className="w-full object-cover" />
      </div>  

      <div className='sticky top-0 z-20 bg-white'>
      <div className="border-t-[1px] border-b-[1px] border-black">
        <p className="text-center text-black font-light text-[36px] py-[40px]">
          "Take care of your mind and body."
        </p>
      </div>
      <div>
        <div className="pt-[70px] pl-[188px]">
          <h1 className="text-[48px] font-medium">Before use</h1>
        </div>

        <div className="flex flex-col gap-[70px] items-center mt-[50px]">
          <Description
            title="Check Substance"
            subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body. "
            link="Artical Link"
          />
          <Description
            title="Sleep & Nutrition"
            subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body. "
            link="Artical Link"
          />
        </div>

        <div className="pt-[70px] pl-[188px]">
          <h1 className="text-[48px] font-medium">While using</h1>
        </div>

        <div className="flex flex-col gap-[70px] items-center mt-[50px]">
          <Description
            title="Set & Setting preparation"
            subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body. "
            link="Artical Link"
          />
          <Description
            title="Dosage & Right  consumption form"
            subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body. "
            link="Artical Link"
          />
        </div>

        <div className="pt-[70px] pl-[188px]">
          <h1 className="text-[48px] font-medium">After use</h1>
        </div>

        <div className="flex flex-col gap-[70px] items-center mt-[50px]">
          <Description
            title="Sleep & Nutrition"
            subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body. "
            link="Artical Link"
          />
          <Description
            title="Stay hydrated"
            subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body. "
            link="Artical Link"
          />
        </div>

        <div className="flex flex-row items-center gap-[12px] mr-[65px] justify-center p-[50px] ">
          <PrimaryButton text="Load more" />
        </div>
      </div>
    </div>
    </div>
  );
}
