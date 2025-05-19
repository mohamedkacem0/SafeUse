import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/PrimaryButton";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-[56px] font-bold mb-8">Success.</h1>
      <div className="mb-10">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="100" r="70" stroke="#43B94A" strokeWidth="10" fill="none" />
          <polyline
            points="60,100 85,125 125,75"
            fill="none"
            stroke="#43B94A"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <PrimaryButton text="Home" onClick={() => navigate("/")} className="w-[100px]" />
    </div>
  );
}