import React from 'react';
import { tradingStrategies, usageRecommendations } from './strategies/StrategyData';

const StrategyCard = ({ strategy }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-l-4 border-amber-500 dark:border-amber-600 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:border-l-[6px]">
      <div className="p-5">
        <div className="flex items-center mb-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm mr-3 transition-transform duration-300 hover:rotate-12">
            {strategy.id}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{strategy.title}</h3>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {strategy.tags.map((tag, index) => (
            <span 
              key={index} 
              className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 transition-all duration-200 hover:bg-blue-200 dark:hover:bg-blue-800/40"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {strategy.description}
        </p>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-md p-4 mb-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-inner">
          <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.649 3.084A1 1 0 015.163 4.4 13.95 13.95 0 004 10c0 1.993.416 3.886 1.164 5.6a1 1 0 01-1.832.8A15.95 15.95 0 012 10c0-2.274.475-4.44 1.332-6.4a1 1 0 011.317-.516zM12.96 7a3 3 0 00-2.342 1.126l-.328.41-.111-.279A2 2 0 008.323 7H8a1 1 0 000 2h.323l.532 1.33-1.035 1.295a1 1 0 01-.781.375H7a1 1 0 100 2h.039a3 3 0 002.342-1.126l.328-.41.111.279A2 2 0 0011.677 14H12a1 1 0 100-2h-.323l-.532-1.33 1.035-1.295A1 1 0 0112.961 9H13a1 1 0 100-2h-.039zm1.874-2.6a1 1 0 011.833-.8A15.95 15.95 0 0118 10c0 2.274-.475 4.44-1.332 6.4a1 1 0 11-1.832-.8A13.949 13.949 0 0016 10c0-1.993-.416-3.886-1.165-5.6z" clipRule="evenodd" />
            </svg>
            Formula
          </h4>
          <div className="font-mono text-sm text-gray-800 dark:text-gray-200">
            {strategy.formula.map((line, index) => (
              <div key={index} className="py-1 transition-all duration-200 hover:pl-2 hover:text-blue-600 dark:hover:text-blue-400">{line}</div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs italic text-amber-600 dark:text-amber-400 mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Where:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {strategy.parameters.map((param, index) => (
                <div key={index} className="flex text-xs transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded px-1 py-0.5">
                  {param.symbol && (
                    <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">
                      {param.symbol}
                    </span>
                  )}
                  {param.condition && (
                    <span className="font-semibold text-amber-600 dark:text-amber-400 mr-2">
                      {param.condition}
                    </span>
                  )}
                  <span className="text-gray-600 dark:text-gray-300">
                    {param.definition}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-md p-3 border-l-2 border-blue-500 transition-all duration-300 hover:border-l-4 hover:pl-4">
          <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Logic
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-300">{strategy.logic}</p>
        </div>
      </div>
    </div>
  );
};

const RecommendationCard = ({ recommendation }) => {
  return (
    <div className="flex items-start p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white font-bold text-xs mr-3 flex-shrink-0 transition-transform duration-300 hover:rotate-12">
        {recommendation.id}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{recommendation.title}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-300">{recommendation.description}</p>
      </div>
    </div>
  );
};

const AdminPage = () => {
  return (
    <div className="space-y-8">
      <header className="mb-8 animate-fadeIn">
        <h1 className="text-4xl font-bold text-center text-primary dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-700 dark:from-amber-400 dark:to-amber-600">
          Advanced Trading Strategies
        </h1>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Traditional sizing strategies rely on win rate and risk/reward ratio. These advanced strategies incorporate complex 
          financial metrics to provide a probabilistic edge in various market environments.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
        {tradingStrategies.map(strategy => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </div>

      <div className="mt-10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-md p-6 animate-fadeIn">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6 relative">
          <span className="relative inline-block">
            Usage Recommendations
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700"></span>
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {usageRecommendations.map(recommendation => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
