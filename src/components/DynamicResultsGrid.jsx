import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from "./ui/card";

const DynamicResultsGrid = () => {
  const [gridData, setGridData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load enhanced grid data from localStorage
  useEffect(() => {
    const loadEnhancedData = () => {
      try {
        const enhancedData = localStorage.getItem('enhanced_grid_results');
        if (enhancedData) {
          const parsedData = JSON.parse(enhancedData);
          setGridData(parsedData.grid);
          setLastUpdated(parsedData.lastUpdated);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading enhanced grid data:', error);
        setIsLoading(false);
      }
    };

    loadEnhancedData();

    // Listen for updates from Enhanced Grid
    const handleStorageUpdate = (event) => {
      if (event.key === 'enhanced_grid_results') {
        loadEnhancedData();
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    
    // Also listen for custom events from same page
    const handleCustomUpdate = () => {
      loadEnhancedData();
    };
    
    window.addEventListener('enhancedGridUpdated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('enhancedGridUpdated', handleCustomUpdate);
    };
  }, []);

  // Format strategy name for display
  const formatStrategyName = (name) => {
    if (!name) return '-';
    name = name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    name = name.replace(/_/g, ' ');
    if (name.includes('Anti ')) {
      name = name.replace('Anti ', 'Anti-');
    }
    return name.trim();
  };

  // Get strategy class for styling based on risk classification
  const getStrategyClass = (note) => {
    if (!note) return "border-gray-300 dark:border-gray-600";
    if (note === "Optimal" || note.includes("Optimal")) return "border-green-500 dark:border-green-400 ring-2 ring-green-500 dark:ring-green-400 bg-green-50 dark:bg-green-900/20";
    if (note === "Good Compromise" || note.includes("Good Compromise")) return "border-yellow-500 dark:border-yellow-400 ring-2 ring-yellow-500 dark:ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
    if (note === "Notable Risk" || note.includes("Notable Risk")) return "border-orange-500 dark:border-orange-400 ring-2 ring-orange-500 dark:ring-orange-400 bg-orange-50 dark:bg-orange-900/20";
    if (note === "Very High Risk" || note.includes("Very High Risk")) return "border-red-500 dark:border-red-400 ring-2 ring-red-500 dark:ring-red-400 bg-red-50 dark:bg-red-900/20";
    return "border-gray-300 dark:border-gray-600";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 dark:text-white">
              📊 Dynamic Strategy Results
            </h1>
            <div className="animate-pulse">
              <div className="text-lg text-gray-600 dark:text-gray-300">Loading enhanced results...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gridData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 dark:text-white">
              📊 Dynamic Strategy Results
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              No enhanced grid data available yet. Generate data from the Enhanced Grid page to view results here.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">How to Generate Data:</h3>
              <ol className="text-left text-sm text-blue-700 dark:text-blue-300 space-y-2">
                <li>1. Navigate to the Enhanced Grid page</li>
                <li>2. Configure your simulation parameters (or use defaults)</li>
                <li>3. Click "Generate Enhanced Grid" and wait for completion</li>
                <li>4. Click "Upload to Performance Grid" to publish results here</li>
                <li>5. Return to this page to view the dynamic results</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            📊 Dynamic Strategy Results
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Real-time strategy performance data generated from Enhanced Grid simulations
          </p>
          {lastUpdated && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Last Updated:</strong> {new Date(lastUpdated).toLocaleString()}
              </p>
            </div>
          )}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Data Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-blue-700 dark:text-blue-300">
              <div><strong>Source:</strong> Enhanced Grid Simulations</div>
              <div><strong>Win Rates:</strong> {gridData.win_rates?.map(wr => `${(wr * 100).toFixed(0)}%`).join(', ')}</div>
              <div><strong>Risk Ratios:</strong> {gridData.risk_ratios?.map(rr => `${rr}x`).join(', ')}</div>
              <div><strong>Dynamic Data:</strong> Generated on demand</div>
            </div>
          </div>
        </div>

        {/* Results Grid Display */}
        <Card className="p-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Dynamic Strategy Performance Results
          </h3>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <strong>Strategy Metrics:</strong> Expected Profit (Average final balance - starting capital) |
            Max Drawdown (Average of worst balance drops as %) |
            Ruin Probability (% of simulations ending at $0) |
            Calmar Ratio (Expected Profit ÷ Average Max Drawdown)
          </div>
          
          <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
              <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-r dark:border-gray-600 whitespace-nowrap">
                    WIN RATE (WR) <span className="font-normal text-gray-500 dark:text-gray-400">(↓ Rows)</span> <br/> 
                    RISK RATIO (RR) <span className="font-normal text-gray-500 dark:text-gray-400">(→ Columns)</span>
                  </th>
                  {(gridData.risk_ratios || []).map(rr => (
                    <th key={rr} className="px-2 py-3.5 text-center text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-r dark:border-gray-600">
                      {rr.toFixed(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {(gridData.win_rates || []).map(wr => (
                  <tr key={wr} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 ease-in-out">
                    <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 border-r dark:border-gray-600 bg-gray-50 dark:bg-gray-800 sticky left-0 z-5">
                      {wr.toFixed(1)}
                    </td>
                    {(gridData.risk_ratios || []).map(rr => {
                      const wrKey = wr.toFixed(1);
                      const rrKey = rr.toFixed(1);
                      const cellStrategies = gridData.grid?.[wrKey]?.[rrKey] || [];
                      
                      return (
                        <td key={`${wrKey}-${rrKey}`} className="px-1 py-1 whitespace-normal text-xs border-r dark:border-gray-600 align-top">
                          {cellStrategies.length > 0 ? (
                            <div className="space-y-1">
                              {cellStrategies.map((strategy, index) => (
                                <div key={index} className={`p-1.5 rounded border ${getStrategyClass(strategy.note)} bg-white dark:bg-gray-800 shadow-sm strategy-card`}>
                                  <strong className="block font-bold text-xs sm:text-sm mb-0.5 text-gray-900 dark:text-gray-50">
                                    {formatStrategyName(strategy.strategy_type)}
                                  </strong>
                                  <span className="block text-xxs sm:text-xs text-gray-700 dark:text-gray-300">
                                    Calmar (P/EMDD): {strategy.calmar_ratio_pemdd}
                                  </span>
                                  {strategy.max_drawdown !== undefined && (
                                    <span className="block text-xxs sm:text-xs text-gray-600 dark:text-gray-400">
                                      Drawdown: {strategy.max_drawdown.toFixed(2)}%
                                    </span>
                                  )}
                                  <span className="block text-xxs sm:text-xs text-gray-700 dark:text-gray-300">
                                    Ruin: {(strategy.probability_of_ruin * 100).toFixed(2)}%
                                  </span>
                                  <span className="block text-xxs sm:text-xs text-gray-700 dark:text-gray-300">
                                    Profit: {strategy.expected_profit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">No data</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Risk Classification Legend */}
        <Card className="p-4">
          <h4 className="font-medium text-sm mb-2">Risk Classification:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span><strong>Optimal:</strong> Ruin ≤ 1%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
              <span><strong>Good Compromise:</strong> Ruin ≤ 5%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
              <span><strong>Notable Risk:</strong> Ruin &gt; 5% but positive profit</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span><strong>Very High Risk:</strong> High ruin or negative profit</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DynamicResultsGrid;