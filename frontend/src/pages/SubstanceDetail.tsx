import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Description from "../components/Description";

// Mapeo de campos de la API a títulos legibles
const FIELD_TITLES: Record<string, string> = {
  descripcion: "Description",
  metodos_consumo: "Consumption Methods",
  efectos_deseados: "Desired Effects",
  composicion: "Composition",
  riesgos: "Risks",
  interaccion_otras_sustancias: "Interaction with other Substances",
  reduccion_riesgos: "Risk Reduction",
  legislacion: "Legislation",
};

export default function SubstanceDetail() {
  const { slug } = useParams();
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Offset for scrolling to sections, accounting for the sticky main navbar
  const SCROLL_OFFSET = 86; // Approx 70px navbar + 16px padding

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const resSubstances = await fetch(
          `api/sustancias`
        );
        const substances: any[] = await resSubstances.json();
        const substance = substances.find(
          (s) => s.Nombre.toLowerCase() === slug?.toLowerCase()
        );
        if (!substance) throw new Error("Sustancia no encontrada");

        const resDetail = await fetch(
          `api/sustancia&id=${substance.ID_Sustancia}`
        );
        const detail = await resDetail.json();

        setData({
          name: substance.Nombre,
          image: substance.Imagen,
          ...detail,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, key: string) => {
    e.preventDefault();
    const section = document.getElementById(key);
    if (section) {
      const topPosition = section.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
      window.scrollTo({
        top: topPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error || !data) return <p>Error: {error || 'Unknown error'}</p>;

  const sections = Object.keys(FIELD_TITLES).filter(
    (key) => data[key] != null && data[key] !== ''
  );

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    hover: {
      scale: 1.02,
      boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-[70px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Banner Section */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4">{data.name}</h1>
          {data.image && (
            <img 
              src={data.image} 
              alt={data.name} 
              className="max-w-md mx-auto rounded-lg shadow-lg object-cover max-h-[300px]"
            />
          )}
        </header>

        <div className="flex flex-col lg:flex-row lg:gap-x-12">
          {/* Sticky Navigation - Left Column */}
          <aside className="lg:w-1/4 mb-8 lg:mb-0 lg:sticky lg:top-[86px] self-start">
            <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-emerald-500">
              <h2 className="text-xl font-semibold text-gray-700 mb-5">Sections</h2>
              <nav className="flex flex-col space-y-2">
                {sections.map((key) => (
                  <a
                    key={key}
                    href={`#${key}`}
                    onClick={(e) => handleNavClick(e, key)}
                    className="px-3 py-2 rounded-md text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-150 font-medium"
                  >
                    {FIELD_TITLES[key]}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content - Right Column */}
          <motion.main 
            className="lg:w-3/4"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {sections.map((key) => (
              <motion.section 
                id={key} 
                key={key} 
                className="bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-8 scroll-mt-[86px] border-t-4 border-emerald-500"
                variants={cardVariants}
                whileHover="hover"
              >
                {/* The Description component will render title and subtitle. 
                    We might need to adjust its internal styling later if it doesn't look good in a card. */}
                <Description
                  title={FIELD_TITLES[key]} // This will be the card title
                  subtitle={data[key]}       // This will be the card content
                  link=""                    // link prop is not used, can be removed from Description component later
                  width="w-full"              // width prop might be redundant if card itself controls width
                />
              </motion.section>
            ))}
          </motion.main>
        </div>
      </div>
    </div>
  );
}