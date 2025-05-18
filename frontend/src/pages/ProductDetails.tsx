import { useParams } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";
import Description from "../components/Description"; // <-- Import Description

export default function SubstanceDetail() {
  const { slug } = useParams();

  // Simulación de datos (puedes reemplazar por fetch real)
  const substance = {
    name: slug?.replace(/^\w/, c => c.toUpperCase()), // Capitaliza la primera letra
    image: "/img/test-cup.png",
    description: "Colorful, water-resistant, insulated jacket that is constructed with eco-friendly and recycled materials.",
    price: "69.99€",
    gallery: [
      "/img/test-cup.png",
      "/img/test-cup.png",
      "/img/test-cup.png",
      "/img/test-cup.png",
    ],
    additional: "Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body.",
  };

  return (
    <div className="mt-[100px] px-4 max-w-5xl mx-auto">
      <h1 className="text-[40px] font-bold mb-8">Product Details</h1>
      <div className="flex flex-col md:flex-row gap-10">
        {/* Imagen principal */}
        <div className="flex-1 flex flex-col items-center">
          <img
            src={substance.image}
            alt={substance.name}
            className="w-[350px] h-[250px] object-contain rounded-xl shadow mb-4"
          />
          {/* Galería */}
          <div className="flex gap-2 items-center">
            <button className="text-2xl px-2">{'<'}</button>
            {substance.gallery.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`gallery-${idx}`}
                className="w-[60px] h-[60px] object-contain rounded border"
              />
            ))}
            <button className="text-2xl px-2">{'>'}</button>
          </div>
        </div>
        {/* Info y compra */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-[28px] font-semibold">{substance.name} test cup</h2>
          <p className="text-gray-700">{substance.description}</p>
          <div className="text-[22px] font-bold">{substance.price}</div>
          <div className="flex items-center gap-2">
            <label htmlFor="quantity" className="font-medium">Quantity:</label>
            <input
              id="quantity"
              type="number"
              min={1}
              defaultValue={1}
              className="w-[60px] border rounded px-2 py-1"
            />
          </div>
          <div>
            <label htmlFor="coupon" className="block font-medium mb-1">Coupon Code</label>
            <input
              id="coupon"
              type="text"
              placeholder="Enter your coupon here"
              className="w-full border rounded px-2 py-1"
            />
          </div>
          <PrimaryButton text="Add to cart" className=" mt-2" />
        </div>
      </div>
      {/* Información adicional */}
      <div className="my-[100px]">
        <Description
          title="Additional information"
          subtitle={substance.additional}
          link=""
          width="w-full"
        />
      </div>
    </div>
  );
}
