import  { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";
import Description   from "../components/Description";
import toast, { Toaster } from 'react-hot-toast';

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
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(true);
  const [addToCartStatus, setAddToCartStatus] = useState<'idle' | 'adding' | 'added'>('idle');

  // --- Fetch del producto --------------------------------------------------
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(
      `/api/producto&id=${id}`
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

  // Listen for stock adjustments from other components (e.g., Cart.tsx)
  useEffect(() => {
    const handleStockAdjusted = (event: Event) => {
      const customEvent = event as CustomEvent<{ productId: number; quantityChange: number }>;
      const { productId: adjustedProductId, quantityChange } = customEvent.detail;

      // Only update if the adjusted product is the one currently being viewed
      if (product && product.id === adjustedProductId) {
        setProduct(prevProduct =>
          prevProduct ? { ...prevProduct, stock: Math.max(0, prevProduct.stock + quantityChange) } : null
        );
      }
    };

    window.addEventListener('productStockAdjusted', handleStockAdjusted);
    return () => {
      window.removeEventListener('productStockAdjusted', handleStockAdjusted);
    };
  }, [product]); // Dependency on 'product' to ensure 'product.id' is current in the closure

  // --- Auto-cycle gallery images -------------------------------------------
  useEffect(() => {
    if (!product || !product.gallery || product.gallery.length <= 1 || !isAutoPlayActive) {
      return; // Don't start interval if no gallery, only one image, or autoplay is paused
    }

    const intervalId = setInterval(() => {
      setMainIdx(prevIdx => (prevIdx + 1) % product.gallery.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount or when dependencies change
  }, [product, product?.gallery, isAutoPlayActive]);

  // --- Vista de carga / error ---------------------------------------------
  if (loading) return <p className="mt-24 text-center">Loading...</p>;
  if (error)   return <p className="mt-24 text-center text-red-600">{error}</p>;
  if (!product) return null;

  const handleAddToCart = async () => {
    if (!product) return;

    setAddToCartStatus('adding');
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: qty }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) { // Specific check for unauthorized
            toast.error('Please log in to add items to your cart.');
            navigate("/login"); // Optionally navigate to login
        } else {
            toast.error(data.message || 'Failed to add product. Please try again.');
        }
        setAddToCartStatus('idle');
        return;
      }

      toast.success(data.message || `${qty} × ${product.name} added to cart!`);
      setProduct(prevProduct => 
        prevProduct ? { ...prevProduct, stock: prevProduct.stock - qty } : null
      );
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      setAddToCartStatus('added');
      
      setTimeout(() => {
        setAddToCartStatus('idle');
      }, 2000);

    } catch (err: any) {
      console.error("Error adding to cart:", err);
      toast.error(err.message || "Could not add product to cart.");
      setAddToCartStatus('idle');
    }
  };

  // --- Render --------------------------------------------------------------
  let buttonText = "Add to cart";
  if (addToCartStatus === 'adding') buttonText = "Adding...";
  if (addToCartStatus === 'added') buttonText = "Added!";

  return (
    <div className="min-h-screen bg-slate-50 pt-[70px]">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <button 
          className="mb-6 text-emerald-600 hover:text-emerald-800 font-medium inline-flex items-center group transition-colors duration-150"
          onClick={() => navigate(-1)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-150">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to shop
        </button>

        {/* Main Product Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl border-t-4 border-emerald-500 flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Image Gallery - Left Side */}
          <div className="md:w-1/2 flex flex-col items-center">
            <div className="w-full max-w-md h-auto aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden shadow-inner mb-4 flex items-center justify-center">
              <img
                src={product.gallery[mainIdx] || product.image}
                alt={product.name}
                className="max-w-full max-h-full object-contain p-2"
              />
            </div>
            {product.gallery.length > 1 && (
              <div className="flex flex-wrap justify-center gap-3">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMainIdx(idx);
                      setIsAutoPlayActive(false); // Pause autoplay on manual click
                    }}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all duration-150 hover:opacity-80 focus:outline-none ${
                      mainIdx === idx ? "border-emerald-500 ring-2 ring-emerald-500/50" : "border-gray-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Product gallery thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Actions - Right Side */}
          <div className="md:w-1/2 flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-3">{product.name}</h1>
            <div className="text-3xl font-bold text-emerald-600 mb-6">€{product.price.toFixed(2)}</div>
            
            <div className="mb-6">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity:</label>
              <div className="flex items-center">
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={product.stock}
                  value={qty}
                  onChange={e => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                  className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm p-2 text-center"
                />
                {product.stock > 0 ? (
                  <span className="ml-3 text-sm text-gray-500">({product.stock} in stock)</span>
                ) : (
                  <span className="ml-3 text-sm text-red-500">(Out of stock)</span>
                )}
              </div>
            </div>

            <PrimaryButton
              text={buttonText}
              className="w-full !bg-emerald-600 hover:!bg-emerald-700 text-white font-semibold py-3 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out active:scale-[0.98] disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addToCartStatus === 'adding' || addToCartStatus === 'added'}
            />
            {/* Placeholder for other actions like 'Add to wishlist' if needed */}
          </div>
        </div>

        {/* Additional Information Card */}
        {product.description && (
          <div className="mt-12 bg-white p-6 sm:p-8 rounded-xl shadow-xl border-t-4 border-emerald-500">
            {/* Assuming Description component handles its own title styling well. 
                If not, we might need to add a <h2 className="text-2xl font-bold mb-4">Additional Information</h2> here 
                and pass only the content to Description's subtitle. */}
            <Description
              title="Additional Information" // This could be a prop or part of Description's internal logic
              subtitle={product.description}
              link="" // Prop can be removed from Description if not used
              width="w-full" // Prop might be redundant if card controls width
            />
          </div>
        )}
      </div>
    </div>
  );
}