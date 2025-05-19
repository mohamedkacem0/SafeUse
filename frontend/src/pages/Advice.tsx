import React, { useRef, useEffect, useState } from 'react';
import Description from '../components/Description';
import Banner from '../assets/images/adviceBanner.png';

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
  }, []);

  const handleNavClick = (ref: React.RefObject<HTMLDivElement>) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-10 h-[500px] w-full overflow-hidden">
        <img src={Banner} alt="Advice Banner" className="w-full object-cover" />
      </div>  

      <div className='sticky top-0 z-20 bg-white'>
        <div className="flex justify-center gap-[100px] py-[20px] border-t-[1px] border-b-[1px] border-[#111111] sticky top-[70px] z-30 bg-white">
          <a
            href="#before-use"
            onClick={handleNavClick(beforeRef)}
            className={`text-[32px] font-medium ${activeSection === 'before-use' ? 'text-[#44844D] underline' : 'text-[#7A7A7A]'} hover:underline transition`}
          >
            Before use
          </a>
          <a
            href="#while-using"
            onClick={handleNavClick(whileRef)}
            className={`text-[32px] font-medium ${activeSection === 'while-using' ? 'text-[#44844D] underline' : 'text-[#7A7A7A]'} hover:underline transition`}
          >
            While using
          </a>
          <a
            href="#after-use"
            onClick={handleNavClick(afterRef)}
            className={`text-[32px] font-medium ${activeSection === 'after-use' ? 'text-[#44844D] underline' : 'text-[#7A7A7A]'} hover:underline transition`}
          >
            After use
          </a>
        </div>
        <div>
          {/* BEFORE USE */}
          <div
            id="before-use"
            ref={beforeRef}
            className="scroll-mt-[190px] transition-all duration-500"
          >
            <div className="flex flex-col gap-[70px] items-center my-[50px]">
              <Description
                title="Check Substance"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'before-use'}
              />
              <Description
                title="Sleep & Nutrition"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'before-use'}
              />
            </div>
          </div>
          
          {/* WHILE USING */}
          <div
            id="while-using"
            ref={whileRef}
            className="scroll-mt-[190px] transition-all duration-500"
          >
            <div className="flex flex-col gap-[70px] items-center my-[50px]">
              <Description
                title="Set & Setting preparation"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'while-using'}
              />
              <Description
                title="Dosage & Right  consumption form"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'while-using'}
              />
            </div>
          </div>

          {/* AFTER USE */}
          <div
            id="after-use"
            ref={afterRef}
            className="scroll-mt-[200px] transition-all duration-500"
          >
            <div className="flex flex-col gap-[70px] items-center my-[50px]">
              <Description
                title="Sleep & Nutrition"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'after-use'}
              />
              <Description
                title="Stay hydrated"
                subtitle="Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body."
                link="Artical Link"
                active={activeSection === 'after-use'}
              />
            </div>
          </div>  
        </div>
      </div>
    </div>
  );
}
