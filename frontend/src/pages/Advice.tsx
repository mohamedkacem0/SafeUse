import React, { useRef, useEffect, useState } from 'react';
import Description from '../components/Description';
import Banner from '../assets/images/adviceBanner4K.png';

export default function Advice() {
  const [activeSection, setActiveSection] = useState('before-use');
  const beforeRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>; 
  const whileRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const afterRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;  

  const sections = [
    { id: 'before-use', ref: beforeRef },
    { id: 'while-using', ref: whileRef },
    { id: 'after-use', ref: afterRef },
  ];

  const handleScroll = () => {
    const scrollPosition = window.scrollY + 200;
    let current = 'before-use';
    for (const section of sections) {
      if (section.ref.current) {
        const { offsetTop } = section.ref.current;
        if (scrollPosition >= offsetTop) {
          current = section.id;
        }
      }
    }
    setActiveSection(current);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line
  }, []);

  const handleNavClick = (ref: React.RefObject<HTMLDivElement>) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      {/* Banner */}
      <div className="sticky top-0 z-10 h-[220px] md:h-[350px] lg:h-[450px] w-full ">
        <img src={Banner} alt="Advice Banner" className="w-full object-cover pt-[70px] md:pt-0" />
      </div>

      <div className='sticky top-0 z-20 bg-white'>
        {/* Responsive Navigation */}
        <div className="flex overflow-x-auto md:overflow-visible justify-start md:justify-center gap-6 md:gap-[100px] py-4 md:py-[20px] border-t border-b border-[#111111] sticky top-[70px] z-30 bg-white px-2 md:px-0">
          <a
            href="#before-use"
            onClick={handleNavClick(beforeRef)}
            className={`whitespace-nowrap text-[20px] md:text-[32px] font-medium ${activeSection === 'before-use' ? 'text-[#44844D] underline' : 'text-[#7A7A7A]'} hover:underline transition`}
          >
            Before use
          </a>
          <a
            href="#while-using"
            onClick={handleNavClick(whileRef)}
            className={`whitespace-nowrap text-[20px] md:text-[32px] font-medium ${activeSection === 'while-using' ? 'text-[#44844D] underline' : 'text-[#7A7A7A]'} hover:underline transition`}
          >
            While using
          </a>
          <a
            href="#after-use"
            onClick={handleNavClick(afterRef)}
            className={`whitespace-nowrap text-[20px] md:text-[32px] font-medium ${activeSection === 'after-use' ? 'text-[#44844D] underline' : 'text-[#7A7A7A]'} hover:underline transition`}
          >
            After use
          </a>
        </div>
        <div>
          {/* BEFORE USE */}
          <div
            id="before-use"
            ref={beforeRef}
            className="scroll-mt-[120px] md:scroll-mt-[190px] transition-all duration-500"
          >
            <div className="flex flex-col gap-10 md:gap-[70px] items-center my-8 md:my-[50px] px-2 md:px-0">
              <Description
                title="Check Substance"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'before-use'}
                width="w-full md:w-[65%]"
              />
              <Description
                title="Sleep & Nutrition"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'before-use'}
                width="w-full md:w-[65%]"
              />
            </div>
          </div>

          {/* WHILE USING */}
          <div
            id="while-using"
            ref={whileRef}
            className="scroll-mt-[150px] md:scroll-mt-[190px] transition-all duration-500"
          >
            <div className="flex flex-col gap-10 md:gap-[70px] items-center my-8 md:my-[50px] px-2 md:px-0">
              <Description
                title="Set & Setting preparation"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'while-using'}
                width="w-full md:w-[65%]"
              />
              <Description
                title="Dosage & Right  consumption form"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'while-using'}
                width="w-full md:w-[65%]"
              />
            </div>
          </div>

          {/* AFTER USE */}
          <div
            id="after-use"
            ref={afterRef}
            className="scroll-mt-[120px] md:scroll-mt-[200px] transition-all duration-500"
          >
            <div className="flex flex-col gap-10 md:gap-[70px] items-center my-8 md:my-[50px] px-2 md:px-0">
              <Description
                title="Sleep & Nutrition"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'after-use'}
                width="w-full md:w-[65%]"
              />
              <Description
                title="Stay hydrated"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'after-use'}
                width="w-full md:w-[65%]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
