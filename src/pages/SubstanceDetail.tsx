import { useParams } from "react-router-dom";

export default function SubstanceDetail() {
  const { slug } = useParams();

  return (
    <div className="mt-[70px]">
      <h1>Detalle de la sustancia: {slug}</h1>
      
    </div>
  );
}
