import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
  const mainRef = useRef<HTMLDivElement>(null);

  // Ajusta este valor para definir el espacio superior al hacer scroll
  const SCROLL_OFFSET = 140; // en pixeles

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const resSubstances = await fetch(
          `http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/sustancias`
        );
        const substances: any[] = await resSubstances.json();
        const substance = substances.find(
          (s) => s.Nombre.toLowerCase() === slug?.toLowerCase()
        );
        if (!substance) throw new Error("Sustancia no encontrada");

        const resDetail = await fetch(
          `http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/sustancia&id=${substance.ID_Sustancia}`
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
    const container = mainRef.current;
    const section = container?.querySelector<HTMLElement>(`#${key}`);
    if (container && section) {
      const topPosition = section.offsetTop - SCROLL_OFFSET;
      container.scrollTo({
        top: topPosition >= 0 ? topPosition : 0,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error || !data) return <p>Error: {error || 'Unknown error'}</p>;

  const sections = Object.keys(FIELD_TITLES).filter(
    (key) => data[key] != null && data[key] !== ''
  );

  return (
    // contenedor principal con altura fija y overflow hidden
    <div className="max-w-6xl mx-auto mt-[70px] p-[60px] h-[calc(100vh-70px)] overflow-hidden">
      <div className="flex h-full">
        {/* Columna fija: título + menú */}
        <aside className="w-[220px] bg-white border-r border-gray-200 p-4 flex-shrink-0">
          <h1 className="text-[24px] font-bold mb-6">{data.name}</h1>
          <nav className="flex flex-col gap-3 text-[16px]">
            {sections.map((key) => (
              <a
                key={key}
                href={`#${key}`}
                onClick={(e) => handleNavClick(e, key)}
                className="hover:underline text-[#335A2C]"
              >
                {FIELD_TITLES[key]}
              </a>
            ))}
          </nav>
        </aside>

        {/* Columna scrollable: contenido principal */}
        <main
          ref={mainRef}
          className="flex-1 p-4 overflow-y-auto"
        >
          {sections.map((key) => (
            <section id={key} key={key} className="mb-8">
              <Description
                title={FIELD_TITLES[key]}
                subtitle={data[key]}
                link=""
                width="w-full"
              />
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}