// src/pages/ShopPage.tsx
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import DrugCard from "../components/Card";
import PrimaryButton from "../components/PrimaryButton";
import Banner from "../assets/images/shop4K.png";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';

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

  // Load products
  useEffect(() => {
    fetch("/api?route=api/productos", { credentials: "include" })
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
      })
      .catch(err => console.error("Error loading products:", err));
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
      const response = await fetch(`/api?route=api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) { // Specific check for unauthorized
          toast.error('Please log in to add items to your cart.');
        } else {
          toast.error(data.message || 'Failed to add product. Please try again.');
        }
        setButtonStatus(prev => ({ ...prev, [productId]: 'idle' }));
        return;
      }

      toast.success(data.message || `${productName} added to cart!`);
      setButtonStatus(prev => ({ ...prev, [productId]: 'added' }));

      // Locally update product stock
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, stock: p.stock - quantity } : p
        )
      );

      // Dispatch event to update cart icon
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
        <img src={Banner} alt="Shop Banner" className="w-full object-cover" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="border-t border-b border-[#111111]">
          <p className="text-center text-[#111111] font-light text-[36px] py-[40px]">
            “Test with confidence, stay in control.”
          </p>
        </div>

        <section className="flex flex-col items-center mt-10 p-6 gap-8 max-w-5xl mx-auto">
          {/* Search */}
          <div className="relative w-full max-w-md mb-8">
            <input
              type="text"
              placeholder="Filter by product"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border border-gray-400 rounded-[8px] py-2 pl-4 pr-12 font-lato focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-700" />
          </div>

          {/* Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[100px]">
            {filtered.slice(0, visibleCount).map(product => {
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
            );})}
          </div>

          {/* Load more / no results */}
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
