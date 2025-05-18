import { useParams } from "react-router-dom";
import Description from "../components/Description";

const substanceData: Record<string, any> = {
  cannabis: {
    name: "Cannabis",
    image: "/img/cannabis.png",
    description:
      "Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body.",
    consumption:
      "Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body.",
    effects:
      "Testing drugs before use is essential to ensure they are safe and effective for humans. Without proper testing, a drug could cause harmful side effects or even be life-threatening. Clinical trials and laboratory studies help identify potential risks, correct dosages, and how a drug interacts with the body.",
  },
  // Puedes agregar más sustancias aquí...
};

export default function SubstanceDetail() {
  const { slug } = useParams();
  const data =
    substanceData[slug?.toLowerCase() || "cannabis"] ||
    substanceData["cannabis"];

  return (
    <div className="max-w-6xl mx-auto mt-[70px] px-4">
      <h1 className="text-[40px] font-bold mb-8">{data.name}</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-[220px] mb-6 md:mb-0">
          <nav className="flex md:flex-col gap-2 text-[18px]">
            <a
              href="#description"
              className="hover:underline text-[#335A2C]"
            >
              Description
            </a>
            <a
              href="#consumption"
              className="hover:underline text-[#335A2C]"
            >
              Consumption Methods
            </a>
            <a
              href="#effects"
              className="hover:underline text-[#335A2C]"
            >
              Desired Effects
            </a>
            <a
              href="#Composition"
              className="hover:underline text-[#335A2C]"
            >
              Composition
            </a>
            <a
              href="#Risks"
              className="hover:underline text-[#335A2C]"
            >
              Risks
            </a>
            <a
              href="#Interaction"
              className="hover:underline text-[#335A2C]"
            >
              Interaction with other Substances
            </a>
            <a
              href="#Reduction"
              className="hover:underline text-[#335A2C]"
            >
              Risk Reduction
            </a>
            <a
              href="#Legislation"
              className="hover:underline text-[#335A2C]"
            >
              Legislation
            </a>
            {/* Puedes agregar más links aquí */}
          </nav>
        </aside>
        {/* Main content */}
        <main className="flex-1 flex flex-col gap-8">
          <section id="description">
            <Description
              title="Description"
              subtitle={data.description}
              link=""
              width="w-full"
            />
          </section>
          <section id="consumption">
            <Description
              title="Consumption methods"
              subtitle={data.consumption}
              link=""
              width="w-full"
            />
          </section>
          <section id="effects">
            <Description
              title="Desired effects"
              subtitle={data.effects}
              link=""
              width="w-full"
            />
          </section>
        </main>
      </div>
    </div>
  );
}
