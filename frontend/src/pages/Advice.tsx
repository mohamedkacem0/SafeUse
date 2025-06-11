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
 
  useEffect(() => {
    async function fetchAdvices() {
      try {
        const res = await fetch(
          'api/advices'
        );
        const data: Advice[] = await res.json();
        setAdvices(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAdvices();
  }, []);
 
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
 
  const getByStage = (stage: 'before' | 'while' | 'after') =>
    advices.filter((a) => a.stage === stage);

  return (
    <div className='bg-gray-50 min-h-screen'> 
      <div className=" top-0 z-10 h-[220px] md:h-[350px] lg:h-[450px] w-full overflow-hidden">
        <img src={Banner} alt="Advice Banner" className="w-full pt-[70px] md:pt-0" />
      </div>
 
      <div className='sticky top-[70px] z-30 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200'>
        <div className="container mx-auto flex overflow-x-auto md:overflow-visible justify-start md:justify-center gap-6 md:gap-12 lg:gap-20 py-3 md:py-4 px-4 md:px-0">
          {sections.map(({ id, ref: sectionRef }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={handleNavClick(sectionRef)}  
              className={`whitespace-nowrap text-base md:text-xl font-medium pb-2 transition-all duration-300 ease-in-out ${
                activeSection === id
                  ? 'text-[#44844D] border-b-2 border-[#44844D] font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
              }`}
            >
              {id === 'before-use'
                ? 'Before Use'  
                : id === 'while-using'
                ? 'While Using'
                : 'After Use'}
            </a>
          ))}
        </div>
      </div>
 
      <div className="container mx-auto px-4 pt-8 pb-16">
   
        <section
          id="before-use"
          ref={beforeRef}
          className="scroll-mt-[120px] md:scroll-mt-[140px] mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">Before Use</h2>
          <div className="w-24 h-1 bg-[#44844D] mx-auto mb-8 md:mb-12"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {getByStage('before').map((advice) => (
              <div
                key={advice.ID_Advice}
                className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-xl shadow-xl h-full flex flex-col border border-gray-200 transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl border-t-4 border-t-[#44844D]"
              >
                <Description
                  title={advice.title}
                  subtitle={advice.description}
                  link={advice.articulo || ''}
                  width="w-full"
                />
              </div>
            ))}
          </div>
        </section>
 
        <section
          id="while-using"
          ref={whileRef}
          className="scroll-mt-[120px] md:scroll-mt-[140px] mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">While Using</h2>
          <div className="w-24 h-1 bg-slate-500 mx-auto mb-8 md:mb-12"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {getByStage('while').map((advice) => (
              <div
                key={advice.ID_Advice}
                className="bg-gradient-to-br from-slate-50 to-slate-200 p-6 rounded-xl shadow-xl h-full flex flex-col border border-gray-200 transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl border-t-4 border-t-slate-400"
              >
                <Description
                  title={advice.title}
                  subtitle={advice.description}
                  link={advice.articulo || ''}
                  width="w-full"
                />
              </div>
            ))}
          </div>
        </section> 
        <section
          id="after-use"
          ref={afterRef}
          className="scroll-mt-[120px] md:scroll-mt-[140px] mb-12 md:mb-16"  
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">After Use</h2>
          <div className="w-24 h-1 bg-[#44844D] mx-auto mb-8 md:mb-12"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {getByStage('after').map((advice) => (
              <div
                key={advice.ID_Advice}
                className="bg-gradient-to-br from-white to-gray-100 p-6 rounded-xl shadow-xl h-full flex flex-col border border-gray-200 transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl border-t-4 border-t-[#44844D]"
              >
                <Description
                  title={advice.title}
                  subtitle={advice.description}
                  link={advice.articulo || ''}
                  width="w-full"
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
