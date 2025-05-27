import  { useState, useEffect } from "react";
import { Search } from "lucide-react";
import DrugCard from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import Banner from "../assets/images/shop4K.png";
import { useNavigate } from "react-router-dom";

// ---------- Tipos ----------
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  imageSrc: string;  // URL absoluta de la imagen principal
}

const PAGE_SIZE = 4; // nº de tarjetas que se muestran cada vez

// ---------- Componente ----------
export default function ShopPage() {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [query,        setQuery]        = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const navigate = useNavigate();

  // --- Cargar productos al montar ---
  useEffect(() => {
    fetch(
      "http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/productos"
    )
      .then(res => res.json())
      .then((data: any[]) => {
        const parsed: Product[] = data.map(p => ({
          id:          p.ID_Producto,
          name:        p.Nombre,
          price:       parseFloat(p.Precio),
          stock:       parseInt(p.Stock, 10),
          description: p.Descripcion,
          imageSrc:    p.Imagen_Principal,
        }));
        setProducts(parsed);
      })
      .catch(err => console.error("Error loading products:", err));
  }, []);

  // --- Filtro por nombre ---
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  // Reiniciar visibilidad al cambiar filtro
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const canLoadMore = visibleCount < filtered.length;
  const handleLoadMore = () =>
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filtered.length));

  // ---------- Render ----------
  return (
    <div>
      {/* Banner ---------------------------------------------------------------- */}
      <div className="sticky top-0 z-10 h-[450px] w-full overflow-hidden">
        <img src={Banner} alt="Shop Banner" className="w-full object-cover" />
      </div>

      {/* Contenido ------------------------------------------------------------- */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="border-t border-b border-[#111111]">
          <p className="text-center text-[#111111] font-light text-[36px] py-[40px]">
            “Test with confidence, stay in control.”
          </p>
        </div>

        <section className="flex flex-col items-center mt-10 p-6 gap-8 max-w-5xl mx-auto">
          {/* Buscador --------------------------------------------------------- */}
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Filter by test kit name"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border border-gray-400 rounded-[8px] py-2 pl-4 pr-12 font-lato focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-700" />
          </div>

          {/* Grid de tarjetas ------------------------------------------------ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[100px]">
            {filtered.slice(0, visibleCount).map(product => (
              <DrugCard
                key={product.id}
                imageSrc={product.imageSrc}
                name={product.name}
                title=''/*{product.description}*/
                formula={`€${product.price.toFixed(2)}`}
                button="Add to cart"
                onButtonClick={() => alert(`Added ${product.name} to cart`)}
                onCardClick={() => navigate(`/shop/${product.id}`)}
              />
            ))}
          </div>

          {/* Botón Load more -------------------------------------------------- */}
          {canLoadMore ? (
            <PrimaryButton text="Load more" onClick={handleLoadMore} />
          ) : (
            filtered.length === 0 && (
              <p className="text-gray-500">No products found</p>
            )
          )}
        </section>
      </div>
    </div>
  );
}
