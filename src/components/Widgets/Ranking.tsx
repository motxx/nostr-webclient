import React from 'react';

const Ranking: React.FC = () => {
  const rankings = [
    { id: 1, title: 'Beautiful Landscape', count: 5000 },
    { id: 2, title: 'Abstract Art', count: 4500 },
    { id: 3, title: 'Modern Sculpture', count: 4000 },
  ];

  return (
    <div className="hidden md:block w-2/5 lg:w-1/4 space-y-6">
      <div className="bg-white dark:bg-black p-6 rounded-lg transition hover:shadow-lg">
        <div className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-300"></div>
        {rankings.map((ranking) => (
          <div key={ranking.id} className="flex justify-between py-2 border-b dark:border-gray-600 space-x-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">{ranking.title}</span>
            <span className="text-gray-500 dark:text-gray-400">{ranking.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Ranking;
