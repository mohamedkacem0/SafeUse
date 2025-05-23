import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import DrugCard from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
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

  useEffect(() => {
    fetch(
      "http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/sustancias"
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
      })
      .catch(err => console.error("Error loading drugs:", err));
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

  return (
    <div>
      <div className="sticky top-0 z-10 h-[450px] w-full overflow-hidden">
        <img src={Banner} alt="Advice Banner" className="w-full object-cover" />
      </div>

      <div className="sticky top-0 z-10 bg-white">
        <div className="border-t-[1px] border-b-[1px] border-black">
          <p className="text-center text-black font-light text-[36px] py-[40px]">
            "Take care of your mind and body."
          </p>
        </div>
        <section className="flex flex-col items-center mt-10 p-6 gap-8 max-w-5xl mx-auto">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Filter by substance name"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border border-gray-400 rounded-[8px] py-2 pl-4 pr-12 font-lato focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-700" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[100px] ">
            {filtered.slice(0, visibleCount).map(drug => (
              <DrugCard key={drug.name} {...drug} />
            ))}
          </div>

          {canLoadMore ? (
            <PrimaryButton text="Load more" onClick={handleLoadMore} />
          ) : (
            filtered.length > 0 && (
              <p className="text-gray-500">No more substances to show.</p>
            )
          )}
        </section>
      </div>
    </div>
  );
}
