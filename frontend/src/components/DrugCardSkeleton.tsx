import React from 'react';

const DrugCardSkeleton: React.FC = () => {
  return (
    <div className="w-[350px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-[12px] flex flex-col items-center p-6 gap-4 shadow-lg animate-pulse border-t-4 border-t-gray-300">
      <div className="w-[150px] h-[150px] bg-gray-300 rounded-md mb-2"></div>
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="w-[128px] h-[40px] bg-gray-300 rounded-[20px]"></div>
    </div>
  );
};

export default DrugCardSkeleton;
