import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import dataSyncService, { subscribeToDataChanges, getStatisticalSummary } from '../utils/DataSyncService';

const PublicStatistics = () => {
  const [modalImage, setModalImage] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  useEffect(() => {
    // Initial data load
    const initialData = dataSyncService.getCurrentData();
    setStatsData(initialData);
    setLastUpdateTime(new Date().toLocaleString());
    setLoading(false);

    // Subscribe to data changes for real-time updates
    const unsubscribe = subscribeToDataChanges((newData) => {
      setStatsData(newData);
      setLastUpdateTime(new Date().toLocaleString());
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const openModal = (imageSrc, altText) => {
    setModalImage({ src: imageSrc, alt: altText });
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const getStrategyColor = (strategyName) => {
    const colors = {
      'Anti-Smart Double': '#3B82F6', // Blue
      'Anti-Martingale': '#10B981', // Green
      'Raw': '#F59E0B', // Amber
      'Martingale': '#EF4444', // Red
      'Anti-Linear': '#8B5CF6' // Purple
    };
    return colors[strategyName] || '#6B7280';
  };

  const StrategyHeatmap = ({ data }) => {
    if (!data) return null;

    return (
      <div className="grid grid-cols-5 gap-1 p-4">
        {data.strategies.map((strategy, index) => (
          <div
            key={strategy.name}
            className="relative group"
            style={{
              backgroundColor: getStrategyColor(strategy.name),
              opacity: 0.3 + (strategy.total / 15) * 0.7, // Opacity based on total occurrences
              minHeight: '80px',
              borderRadius: '8px'
            }}
          >
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-xs font-semibold p-2">
              <div className="text-center">{strategy.name}</div>
              <div className="text-lg font-bold">{strategy.total}</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Safe: {strategy.safePercentage}%
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PerformanceChart = ({ data, type }) => {
    if (!data) return null;

    const maxValue = Math.max(...data.map(item => item.occurrences));

    return (
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.occurrences / item.total) * 100;
          const barWidth = (item.occurrences / maxValue) * 100;
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm font-medium">
                {type === 'winRate' ? `${item.winRate * 100}%` : `${item.riskRatio}:1`}
              </div>
              <div className="flex-1 relative">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                  {item.dominantStrategy} ({item.occurrences}/{item.total})
                </div>
              </div>
              <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                {percentage.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const StatisticsCard = ({ title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      amber: 'from-amber-500 to-amber-600',
      red: 'from-red-500 to-red-600'
    };

    return (
      <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-6 text-white transform hover:scale-105 transition-transform duration-300`}>
        <div className="text-3xl font-bold mb-2">{value}</div>
        <div className="text-lg font-semibold mb-1">{title}</div>
        <div className="text-sm opacity-90">{subtitle}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-600 dark:text-gray-400">
          No statistics data available.
        </div>
      </div>
    );
  }

  const totalStrategies = statsData.strategies.reduce((acc, strategy) => acc + strategy.total, 0);
  const optimalStrategies = statsData.strategies.reduce((acc, strategy) => acc + strategy.optimal, 0);
  const topStrategy = statsData.strategies.reduce((prev, current) => (prev.total > current.total) ? prev : current);
  const safestStrategy = statsData.strategies.reduce((prev, current) => (prev.safePercentage > current.safePercentage) ? prev : current);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Strategy Performance Statistics
      </h1>
      
      {/* Key Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatisticsCard
          title="Total Analyses"
          value={totalStrategies}
          subtitle="Strategy evaluations"
          color="blue"
        />
        <StatisticsCard
          title="Optimal Results"
          value={optimalStrategies}
          subtitle="Low-risk strategies"
          color="green"
        />
        <StatisticsCard
          title="Top Performer"
          value={topStrategy.name}
          subtitle={`${topStrategy.total} dominances`}
          color="purple"
        />
        <StatisticsCard
          title="Safest Strategy"
          value={safestStrategy.name}
          subtitle={`${safestStrategy.safePercentage}% safe`}
          color="amber"
        />
      </div>

      {/* Interactive Heatmap */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Strategy Dominance Heatmap</span>
          </CardTitle>
          <CardDescription>
            Interactive visualization showing strategy performance intensity. Hover for detailed information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StrategyHeatmap data={statsData} />
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            Color intensity represents dominance frequency. Hover over each strategy for safety percentage.
          </div>
        </CardContent>
      </Card>

      {/* Original Heatmap Images */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Detailed Strategy Heatmaps</CardTitle>
          <CardDescription>
            Comprehensive heatmaps showing strategy dominance across different market conditions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <img 
                src="/images/strategy_heatmap.png" 
                alt="Dominant strategies heatmap" 
                className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                onClick={() => openModal("/images/strategy_heatmap.png", "Dominant strategies heatmap")}
              />
              <p className="mt-2 text-sm font-medium">Strategy Dominance</p>
            </div>
            <div className="text-center">
              <img 
                src="/images/strategy_dominance_frequency.png" 
                alt="Strategy dominance frequency" 
                className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                onClick={() => openModal("/images/strategy_dominance_frequency.png", "Strategy dominance frequency")}
              />
              <p className="mt-2 text-sm font-medium">Dominance Frequency</p>
            </div>
            <div className="text-center">
              <img 
                src="/images/strategy_safe_percentage.png" 
                alt="Safe dominance percentage by strategy" 
                className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                onClick={() => openModal("/images/strategy_safe_percentage.png", "Safe dominance percentage by strategy")}
              />
              <p className="mt-2 text-sm font-medium">Safety Percentage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Win Rate Performance</span>
            </CardTitle>
            <CardDescription>
              Strategy dominance across different win rate scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={statsData.winRateTrends} type="winRate" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Risk Ratio Analysis</span>
            </CardTitle>
            <CardDescription>
              Strategy performance across different risk/reward ratios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={statsData.riskRatioTrends} type="riskRatio" />
          </CardContent>
        </Card>
      </div>

      {/* Strategy Performance Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Detailed Strategy Metrics</CardTitle>
          <CardDescription>
            Comprehensive breakdown of each strategy's performance across risk categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Strategy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Optimal (≤1%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Good (≤5%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notable (&gt;5%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Risky</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Safety %</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {statsData.strategies.map((strategy, index) => (
                  <tr key={strategy.name} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: getStrategyColor(strategy.name) }}
                        ></div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{strategy.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">{strategy.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-semibold">{strategy.optimal}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">{strategy.good}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400">{strategy.notable}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">{strategy.risky}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{strategy.safePercentage}%</div>
                        <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${strategy.safePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Key Insights & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Top Performers</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm"><strong>Anti-Smart Double:</strong> Most dominant with 13 occurrences</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm"><strong>Raw Strategy:</strong> 100% safety in low-risk categories</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm"><strong>Anti-Linear:</strong> Perfect optimal performance</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Risk Analysis</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm"><strong>Martingale:</strong> High risk with 0% safety rate</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm"><strong>Anti-Martingale:</strong> 50% safety rate, moderate risk</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Three strategies achieve 100% safety rates</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-update indicator */}
      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>
            Last updated: {lastUpdateTime || 'Loading...'} | Real-time synchronization active
          </span>
        </div>
      </div>

      {/* Modal for image enlargement */}
      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img 
              src={modalImage.src} 
              alt={modalImage.alt} 
              className="max-w-full max-h-full object-contain rounded-lg" 
            />
            <button 
              className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300 transition-colors"
              onClick={closeModal}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicStatistics;