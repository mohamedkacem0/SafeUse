import React, { useRef, useEffect, useState } from 'react';
import Description from '../components/Description';
import Banner from '../assets/images/adviceBanner4K.png';

interface Advice {
  ID_Advice: number;
  title: string;
  description: string;
  articulo: string | null;
  stage: 'before' | 'while' | 'after';
}

export default function Advice() {
  const [advices, setAdvices] = useState<Advice[]>([]);
  const [activeSection, setActiveSection] = useState('before-use');

  const beforeRef = useRef<HTMLDivElement | null>(null);
  const whileRef = useRef<HTMLDivElement | null>(null);
  const afterRef = useRef<HTMLDivElement | null>(null);


  const sections = [
    { id: 'before-use', ref: beforeRef, stage: 'before' as const },
    { id: 'while-using', ref: whileRef, stage: 'while' as const },
    { id: 'after-use', ref: afterRef, stage: 'after' as const },
  ];

  // Fetch advices from API
  useEffect(() => {
    async function fetchAdvices() {
      try {
        const res = await fetch(
          'http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/advices'
        );
        const data: Advice[] = await res.json();
        setAdvices(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAdvices();
  }, []);

  // Update active section on scroll
  useEffect(() => {
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const handleNavClick = (ref: React.RefObject<HTMLDivElement | null>) =>
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

  // Helper to filter advices by stage
  const getByStage = (stage: 'before' | 'while' | 'after') =>
    advices.filter((a) => a.stage === stage);

  return (
    <div className='relative'>
      {/* Banner */}
      <div className="sticky top-0 h-[220px] md:h-[350px] lg:h-[450px] w-full ">
        <img src={Banner} alt="Advice Banner" className="w-full pt-[70px] md:pt-0" />
      </div>

      <div className='sticky top-0 z-20 bg-white'>
        {/* Responsive Navigation */}
        <div className="flex overflow-x-auto md:overflow-visible justify-start md:justify-center gap-6 md:gap-[100px] py-4 md:py-[20px] border-t border-b border-[#111111] sticky top-[70px] z-30 bg-white px-2 md:px-0">
          {sections.map(({ id }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={handleNavClick(sections.find((s) => s.id === id)!.ref)}
              className={`whitespace-nowrap text-[20px] md:text-[32px] font-medium ${
                activeSection === id ? 'text-[#44844D] underline' : 'text-[#7A7A7A]'
              } hover:underline transition`}
            >
              {id === 'before-use'
                ? 'Before use'
                : id === 'while-using'
                ? 'While using'
                : 'After use'}
            </a>
          ))}
        </div>
        <div>
          {/* BEFORE USE */}
          <div
            id="before-use"
            ref={beforeRef}
            className="scroll-mt-[150px] md:scroll-mt-[190px] transition-all duration-500"
          >
            <div className="flex flex-col gap-10 md:gap-[70px] items-center my-8 md:my-[50px] px-2 md:px-0">
              {getByStage('before').map((advice) => (
                <Description
                  key={advice.ID_Advice}
                  title={advice.title}
                  subtitle={advice.description}
                  link={advice.articulo || ''}
                  active={activeSection === 'before-use'}
                  width="w-full md:w-[65%]"
                />
              ))}
            </div>
          </div>

          {/* WHILE USING */}
          <div
            id="while-using"
            ref={whileRef}
            className="scroll-mt-[150px] md:scroll-mt-[190px] transition-all duration-500"
          >
            <div className="flex flex-col gap-10 md:gap-[70px] items-center px-2 md:px-0">
              {getByStage('while').map((advice) => (
                <Description
                  key={advice.ID_Advice}
                  title={advice.title}
                  subtitle={advice.description}
                  link={advice.articulo || ''}
                  active={activeSection === 'while-using'}
                  width="w-full md:w-[65%]"
                />
              ))}
            </div>
          </div>

          {/* AFTER USE */}
          <div
            id="after-use"
            ref={afterRef}
            className="scroll-mt-[120px] md:scroll-mt-[140px] transition-all duration-500"
          >
            <div className="flex flex-col gap-10 md:gap-[70px] items-center py-8 md:py-[50px] px-2 md:px-0">
              {getByStage('after').map((advice) => (
                <Description
                  key={advice.ID_Advice}
                  title={advice.title}
                  subtitle={advice.description}
                  link={advice.articulo || ''}
                  active={activeSection === 'after-use'}
                  width="w-full md:w-[65%]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
