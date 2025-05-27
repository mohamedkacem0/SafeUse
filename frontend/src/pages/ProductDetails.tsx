import  { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";
import Description   from "../components/Description";

// --------- Tipos -----------------------------------------------------------
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;          // imagen principal (URL absoluta)
  gallery: string[];      // URLs absolutas de la galería
  stock: number;
}

// --------- Componente ------------------------------------------------------
export default function ProductDetailPage() {
  const { id } = useParams();               // /shop/:id
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [mainIdx, setMainIdx] = useState(0); // imagen principal activa

  // --- Fetch del producto --------------------------------------------------
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(
      `http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/producto&id=${id}`
    )
      .then(res => {
        if (!res.ok) throw new Error("Producto no encontrado");
        return res.json();
      })
      .then(data => {
        const parsed: Product = {
          id: data.ID_Producto,
          name: data.Nombre,
          description: data.Descripcion,
          price: parseFloat(data.Precio),
          image: data.Imagen_Principal,
          gallery: data.galeria ?? [],
          stock: parseInt(data.Stock, 10),
        };
        setProduct(parsed);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // --- Vista de carga / error ---------------------------------------------
  if (loading) return <p className="mt-24 text-center">Loading...</p>;
  if (error)   return <p className="mt-24 text-center text-red-600">{error}</p>;
  if (!product) return null;

  // --- Render --------------------------------------------------------------
  return (
    <div className="mt-[100px] px-4 max-w-5xl mx-auto">
      <button className="mb-6 underline" onClick={() => navigate(-1)}>
        ← Back to shop
      </button>

      {/*<h1 className="text-[32px] font-bold mb-8 text-center">{product.name}</h1>*/}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Imagen principal + galería */}
        <div className="flex-1 flex flex-col items-center">
          <img
            src={product.gallery[mainIdx] || product.image}
            alt={product.name}
            className="w-[350px] h-[250px] object-contain rounded-xl shadow mb-4"
          />

          {/* Galería */}
          {product.gallery.length > 1 && (
            <div className="flex gap-2 items-center overflow-x-auto">
              {product.gallery.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`gallery-${idx}`}
                  className={`w-[60px] h-[60px] object-contain rounded border cursor-pointer ${
                    mainIdx === idx ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setMainIdx(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info y compra */}
        <div className="flex-1 flex flex-col gap-4">
         <h2 className="text-[28px] font-semibold">{product.name}</h2>
          {/*<p className="text-gray-700">{product.description}</p>*/}
          <div className="text-[22px] font-bold">€{product.price.toFixed(2)}</div>

          <div className="flex items-center gap-2">
            <label htmlFor="quantity" className="font-medium">Quantity:</label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={product.stock}
              value={qty}
              onChange={e => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
              className="w-[80px] border rounded px-2 py-1"
            />
            <span className="text-sm text-gray-500">(Stock: {product.stock})</span>
          </div>

          <PrimaryButton
            text="Add to cart"
            className="my-2"
            onClick={() => alert(`Added ${qty} × ${product.name} to cart`)}
          />
        </div>
      </div>

      {/* Información adicional */}

      {product.description && (
        <div className="my-[100px]">
          <Description
            title="Additional information"
            subtitle={product.description}
            link=""
            width="w-full"
          />
        </div>
      )}
    </div>
  );
}
