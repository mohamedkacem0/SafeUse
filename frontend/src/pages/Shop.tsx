// src/pages/ShopPage.tsx
import { useState, useEffect } from "react";
import { Search, SearchX } from "lucide-react";
import { motion } from "framer-motion";
import DrugCard from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import Banner from "../assets/images/shop4K.png";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import CatchyQuoteSection from "../components/CatchyQuoteSection";
import DrugCardSkeleton from "../components/DrugCardSkeleton";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
  imageSrc: string;
}

const PAGE_SIZE = 4;

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const navigate = useNavigate();
  const [buttonStatus, setButtonStatus] = useState<Record<number, 'idle' | 'adding' | 'added'>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load products
  useEffect(() => {
    fetch("http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/productos", { credentials: "include" })
      .then(res => res.json())
      .then((data: any[]) => {
        const parsed: Product[] = data.map(p => ({
          id: p.ID_Producto,
          name: p.Nombre,
          price: parseFloat(p.Precio),
          stock: parseInt(p.Stock, 10),
          description: p.Descripcion,
          imageSrc: p.Imagen_Principal,
        }));
        setProducts(parsed);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error loading products:", err);
        setIsLoading(false);
      });
  }, []);

  // Listen for stock adjustments from other components (e.g., Cart.tsx)
  useEffect(() => {
    const handleStockAdjusted = (event: Event) => {
      const customEvent = event as CustomEvent<{ productId: number; quantityChange: number }>;
      const { productId, quantityChange } = customEvent.detail;
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, stock: Math.max(0, p.stock + quantityChange) } : p // Ensure stock doesn't go below 0
        )
      );
    };

    window.addEventListener('productStockAdjusted', handleStockAdjusted);
    return () => {
      window.removeEventListener('productStockAdjusted', handleStockAdjusted);
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  // Filter logic
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);
  const canLoadMore = visibleCount < filtered.length;
  const handleLoadMore = () =>
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filtered.length));

  // Add to cart
  const handleAddToCart = async (productId: number, productName: string, quantity: number = 1) => {
    setButtonStatus(prev => ({ ...prev, [productId]: 'adding' }));

    try {
      const response = await fetch(
        'http://localhost/tfg/SafeUse/backend/api/public/index.php?route=api/cart/add',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ productId, quantity }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          toast(
            (t) => (
              <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-start text-sm">
                <p className="text-gray-800 mb-3">
                  You need to be logged in to add items to your cart.
                </p>
                <div className="flex w-full space-x-2">
                  <button
                    onClick={() => {
                      navigate('/login');
                      toast.dismiss(t.id);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-150"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors duration-150"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ),
            {
              duration: 6000,
              id: 'login-required-toast',
            }
          );
        } else {
          toast.error(data.message || 'Failed to add product. Please try again.');
        }
        setButtonStatus(prev => ({ ...prev, [productId]: 'idle' }));
        return;
      }

      toast.success(data.message || `${productName} added to cart!`);
      setButtonStatus(prev => ({ ...prev, [productId]: 'added' }));

      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, stock: p.stock - quantity } : p
        )
      );

      window.dispatchEvent(new CustomEvent('cartUpdated'));

      setTimeout(() => {
        setButtonStatus(prev => ({ ...prev, [productId]: 'idle' }));
      }, 2000);

    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setButtonStatus(prev => ({ ...prev, [productId]: 'idle' }));
    }
  };

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      {/* Banner */}
      <div className="sticky top-0 z-10 h-[450px] w-full overflow-hidden">
        <img src={Banner} alt="Shop Banner" className="w-full object-cover" loading="lazy" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white">
        {/* Slogan Section */}
        <CatchyQuoteSection quote="Test with confidence, stay in control." ariaLabel="Shop page slogan" />

        <section className="flex flex-col items-center mt-10 p-6 gap-8 max-w-5xl mx-auto bg-gray-50 rounded-lg shadow-md">
          {/* Search */}
          <div className="relative w-full max-w-md mb-8">
            <input
              type="text"
              placeholder="Filter by product"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border border-gray-400 rounded-[8px] py-2 pl-4 pr-12 font-lato focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-700" />
          </div>

          {/* Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {isLoading
            ? Array.from({ length: PAGE_SIZE }).map((_, index) => <DrugCardSkeleton key={index} />)
            : filtered.slice(0, visibleCount).map(product => {
              const currentStatus = buttonStatus[product.id] || 'idle';
              let buttonText = "Add to cart";
              let isDisabled = false;

              if (product.stock === 0) {
                buttonText = "Out of stock";
                isDisabled = true;
              } else if (currentStatus === 'adding') {
                buttonText = "Adding...";
                isDisabled = true;
              } else if (currentStatus === 'added') {
                buttonText = "Added!";
                isDisabled = true;
              }

              return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                key={`motion-${product.id}`}
              >
                <DrugCard
                key={product.id}
                imageSrc={product.imageSrc}
                name={product.name}
                title={product.description}
                formula={`€${product.price.toFixed(2)}`}
                button={buttonText}
                onButtonClick={() => handleAddToCart(product.id, product.name)}
                buttonDisabled={isDisabled} // New prop
                onCardClick={() => navigate(`/shop/${product.id}`)} // Corrected navigation
                hideTitle={true}
                />
              </motion.div>
            );})}
          </div>

          {/* Load more / no results */}
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
                <p className="text-xl">No products found</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
}
