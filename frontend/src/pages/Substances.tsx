import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SearchX } from "lucide-react";
import { motion } from "framer-motion";
import CatchyQuoteSection from "../components/CatchyQuoteSection";
import DrugCard from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import DrugCardSkeleton from "../components/DrugCardSkeleton";
import Banner from "../assets/images/substanceBanner4K.png";

interface ApiSubstance {
  ID_Sustancia: number;
  Nombre: string;
  Imagen: string;
  Titulo: string;
  Formula: string;
}

interface Drug {
  name: string;
  imageSrc: string;
  title: string;
  formula: string;
}

const PAGE_SIZE = 4; 

export default function SubstancesPage() {
  const [query, setQuery] = useState("");
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [modalDrug, setModalDrug] = useState<Drug | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      "https://safeuse.onrender.com/sustancias"
    )
      .then<ApiSubstance[]>(res => res.json())
      .then(apiData => {
        const parsed: Drug[] = apiData.map(s => ({
          name: s.Nombre,
          imageSrc: s.Imagen,
          title: s.Titulo,
          formula: s.Formula,
        }));
        setDrugs(parsed);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error loading drugs:", err);
        setIsLoading(false);
      });
  }, []);

  const filtered = drugs.filter(d =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const canLoadMore = visibleCount < filtered.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filtered.length));
  };

  const handleOpenModal = (drug: Drug) => setModalDrug(drug);
  const handleCloseModal = () => setModalDrug(null);

  function formatFormula(formula: string) {
    // Reemplaza cada número por <sub>número</sub>
    return formula.replace(/([A-Za-z])(\d+)/g, (_, letter, num) => {
      return `${letter}<sub>${num}</sub>`;
    });
  }

  return (
    <div>
      <div className="sticky top-0 z-10 h-[450px] w-full overflow-hidden">
        <img src={Banner} alt="Substances Banner" className="w-full object-cover" loading="lazy" />
      </div>

      <div className="sticky top-0 z-10 bg-white">
        <CatchyQuoteSection quote="Take care of your mind and body." ariaLabel="Quote about self-care" />
        <section className="flex flex-col items-center mt-10 p-6 gap-8 max-w-5xl mx-auto bg-gray-50 rounded-lg shadow-md">
          <div className="relative w-full max-w-md mb-8">
            <input
              type="text"
              placeholder="Filter by substance name"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border border-gray-400 rounded-[8px] py-2 pl-4 pr-12 font-lato focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-700" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 ">
            {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, index) => <DrugCardSkeleton key={`skeleton-${index}`} />)
            : filtered.slice(0, visibleCount).map(drug => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                key={`motion-${drug.name}`}>
                <DrugCard
                  key={drug.name}
                  {...drug}
                hideTitle={true}
                onButtonClick={() =>
                  navigate(`/sustancia/${encodeURIComponent(drug.name.toLowerCase().replace(/\s+/g, '-'))}`)
                }
                onCardClick={() => handleOpenModal(drug)}
                />
              </motion.div>
            ))}
          </div>
          {/* Modal */}
          {modalDrug && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              onClick={handleCloseModal}
            >
              <div
                className="bg-white rounded-lg p-8 max-w-md w-full relative flex flex-col items-center"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="absolute top-2 right-4 text-2xl font-bold text-gray-500 hover:text-black"
                  onClick={handleCloseModal}
                >
                  ×
                </button>
                <h2 className="text-2xl font-bold mb-2">{modalDrug.name}</h2>
                <p className="text-lg text-gray-700">{modalDrug.title}</p>
                <img
                  src={modalDrug.imageSrc}
                  alt={modalDrug.name}
                  className="w-[300px] h-[300px] object-contain m-4"
                />
                <p
                  className="text-xl font-bold text-center mb-4"
                  dangerouslySetInnerHTML={{ __html: formatFormula(modalDrug.formula) }}
                />
                <PrimaryButton
                  className="!bg-[#44844D] hover:scale-105 transition-all duration-300"
                  text="See more"
                  onClick={() => {
                    handleCloseModal();
                    navigate(`/sustancia/${encodeURIComponent(modalDrug.name.toLowerCase().replace(/\s+/g, '-'))}`);
                  }}
                />
              </div>
            </div>
          )}
          {canLoadMore ? (
            <div className="col-span-full flex justify-center mt-8">
              <PrimaryButton
                text="Load More"
                onClick={handleLoadMore}
                className="bg-emerald-600 hover:bg-emerald-700 !text-white font-bold py-2 px-4 !rounded-[20px] w-auto h-auto !text-[16px]"
              />
            </div>
          ) : (
            filtered.length === 0 && !isLoading && (
              <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-12">
                <SearchX size={48} className="mb-4" />
                <p className="text-xl">No substances found</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
}
