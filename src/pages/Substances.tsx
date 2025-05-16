import React, { useState } from "react";
import { Search } from "lucide-react"; // ícono de búsqueda
import DrugCard from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import Banner from '../assets/images/substanceBanner.png';

// Datos de ejemplo — podrías traerlos de una API
const DRUGS = [
  {
    imageSrc: "/img/lsd.png",
    name: "LSD",
    title: "Type: Psychedelic",
    subtitle: "C₂₀H₂₅N₃O",
  },
  {
    imageSrc: "/img/cannabis.png",
    name: "Cannabis",
    title: "Psychoactive depressant",
    subtitle: "C₂₁H₃₀O₂",
  },
  {
    imageSrc: "/img/cocaine.png",
    name: "Cocaine",
    title: "Psychoactive depressant",
    subtitle: "C₁₇H₂₁NO₄",
  },
  {
    imageSrc: "/img/mushrooms.png",
    name: "Mushrooms",
    title: "Psychoactive depressant",
    subtitle: "C₁₂H₁₇N₂O₄P",
  },
];

export default function SubstancesPage() {
  const [query, setQuery] = useState("");

  // Filtra drogas por nombre
  const filtered = DRUGS.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  
  return (
    <div>
      <div className="sticky top-0 z-10 h-[400px] w-full overflow-hidden">
        <img src={Banner} alt="Advice Banner" className="w-full object-cover" />
      </div>
      
      <div className="sticky top-0 z-10 bg-white">
      <div className="border-t-[1px] border-b-[1px] border-black">
        <p className="text-center text-black font-light text-[36px] py-[40px]">
          "Get informed, stay safe."
        </p>
      </div>
      <section className="flex flex-col items-center mt-10 p-6 gap-8 max-w-5xl mx-auto">

        {/* Buscador */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Filter by substance name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-400 rounded-[8px] py-2 pl-4 pr-12 font-lato focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-700" />
        </div>

        {/* Grid de tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 ">
          {filtered.slice(0, 4).map((drug) => (
            <DrugCard key={drug.name} {...drug} />
          ))}
        </div>

        {/* Botón cargar más */}
        <PrimaryButton text="Load more" />
      </section>
    </div>
    </div>
  );
}
