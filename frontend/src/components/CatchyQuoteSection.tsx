// src/components/CatchyQuoteSection.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface CatchyQuoteSectionProps {
  quote: string;
  ariaLabel?: string; // For accessibility
}

const CatchyQuoteSection: React.FC<CatchyQuoteSectionProps> = ({ quote, ariaLabel }) => {
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2, // Small delay before animation starts
      },
    },
  };

  return (
    <div
      className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 py-12 md:py-16 shadow-sm overflow-hidden" // overflow-hidden helps contain animations
      aria-label={ariaLabel || "Inspirational quote section"}
    >
      <motion.p
        key={quote} // Ensures re-animation if the quote changes
        className="text-center text-emerald-800 font-light text-3xl md:text-4xl px-6 leading-relaxed"
        variants={textVariants}
        initial="hidden"
        animate="visible" // Animate directly on mount/update
      >
        {quote}
      </motion.p>
    </div>
  );
};

export default CatchyQuoteSection;
