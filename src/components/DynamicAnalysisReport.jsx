import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import dataSyncService, { subscribeToDataChanges } from '../utils/DataSyncService';

const DynamicAnalysisReport = () => {
  const [strategyData, setStrategyData] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial data load
    const initialData = dataSyncService.getCurrentData();
    setStrategyData(initialData);
    setLastUpdateTime(new Date().toLocaleString());
    setLoading(false);

    // Subscribe to data changes for real-time updates
    const unsubscribe = subscribeToDataChanges((newData) => {
      setStrategyData(newData);
      setLastUpdateTime(new Date().toLocaleString());
    });

    return unsubscribe;
  }, []);

  // Calculate statistics from current data
  const statistics = useMemo(() => {
    if (!strategyData || !strategyData.strategies) return null;

    const totalAnalyses = strategyData.strategies.reduce((acc, strategy) => acc + strategy.total, 0);
    const optimalAnalyses = strategyData.strategies.reduce((acc, strategy) => acc + strategy.optimal, 0);
    const topStrategy = strategyData.strategies.reduce((prev, current) => (prev.total > current.total) ? prev : current);
    const safestStrategy = strategyData.strategies.reduce((prev, current) => (prev.safePercentage > current.safePercentage) ? prev : current);
    
    const riskDistribution = {
      optimal: strategyData.strategies.reduce((acc, strategy) => acc + strategy.optimal, 0),
      good: strategyData.strategies.reduce((acc, strategy) => acc + strategy.good, 0),
      notable: strategyData.strategies.reduce((acc, strategy) => acc + strategy.notable, 0),
      risky: strategyData.strategies.reduce((acc, strategy) => acc + strategy.risky, 0)
    };

    return {
      totalAnalyses,
      optimalAnalyses,
      topStrategy,
      safestStrategy,
      riskDistribution,
      optimalPercentage: ((optimalAnalyses / totalAnalyses) * 100).toFixed(1),
      avgSafetyPercentage: (strategyData.strategies.reduce((acc, strategy) => acc + strategy.safePercentage, 0) / strategyData.strategies.length).toFixed(1)
    };
  }, [strategyData]);

  const getStrategyColor = (strategyName) => {
    const colors = {
      'Anti-Smart Double': '#3B82F6',
      'Anti-Martingale': '#10B981',
      'Raw': '#F59E0B',
      'Martingale': '#EF4444',
      'Anti-Linear': '#8B5CF6'
    };
    return colors[strategyName] || '#6B7280';
  };

  // Get strategy performance score for dominance calculation
  const getStrategyPerformanceScore = (strategy) => {
    if (!strategy) return 0;
    // Calculate performance score based on actual data
    const safetyWeight = strategy.safePercentage / 100;
    const optimalRate = strategy.optimal / (strategy.total || 1);
    const totalWeight = strategy.total / 35; // Normalize against total scenarios (7x5)
    return (safetyWeight * 0.4) + (optimalRate * 0.4) + (totalWeight * 0.2);
  };

  // Dynamic Heatmap Component
  const DynamicHeatmap = ({ data }) => {
    if (!data || !data.strategies) return null;

    // Create a 7x5 grid representing win rates (0.3-0.9) and risk ratios (0.5-2.5)
    const winRates = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    const riskRatios = [0.5, 1.0, 1.5, 2.0, 2.5];

    // Generate dynamic data based on actual strategy performance from the grid
    const generateHeatmapData = () => {
      const heatmapData = [];
      
      // Create mapping based on actual win rate and risk ratio trends
      const winRateMapping = {};
      const riskRatioMapping = {};
      
      // Build mappings from actual data trends
      if (data.winRateTrends) {
        data.winRateTrends.forEach(trend => {
          winRateMapping[trend.winRate] = trend.dominantStrategy;
        });
      }
      
      if (data.riskRatioTrends) {
        data.riskRatioTrends.forEach(trend => {
          riskRatioMapping[trend.riskRatio] = trend.dominantStrategy;
        });
      }
      
      for (let i = 0; i < winRates.length; i++) {
        for (let j = 0; j < riskRatios.length; j++) {
          const winRate = winRates[i];
          const riskRatio = riskRatios[j];
          
          // Determine dominant strategy based on actual data patterns
          let dominantStrategy = null;
          
          // First, try exact match from trends data
          if (winRateMapping[winRate]) {
            dominantStrategy = winRateMapping[winRate];
          } else if (riskRatioMapping[riskRatio]) {
            dominantStrategy = riskRatioMapping[riskRatio];
          } else {
            // Fallback: find best strategy based on performance scores for this scenario
            let bestStrategy = null;
            let bestScore = -1;
            
            data.strategies.forEach(strategy => {
              // Calculate suitability score for this win rate / risk ratio combination
              let suitabilityScore = getStrategyPerformanceScore(strategy);
              
              // Adjust score based on scenario characteristics
              if (winRate >= 0.7 && strategy.name === 'Anti-Smart Double') suitabilityScore += 0.3;
              if (winRate <= 0.4 && strategy.name === 'Martingale') suitabilityScore += 0.2;
              if (winRate >= 0.8 && strategy.name === 'Anti-Martingale') suitabilityScore += 0.2;
              if (winRate >= 0.5 && winRate <= 0.6 && riskRatio <= 1.0 && strategy.name === 'Raw') suitabilityScore += 0.2;
              if (winRate >= 0.5 && winRate <= 0.6 && riskRatio > 1.0 && strategy.name === 'Anti-Linear') suitabilityScore += 0.2;
              
              if (suitabilityScore > bestScore) {
                bestScore = suitabilityScore;
                bestStrategy = strategy;
              }
            });
            
            dominantStrategy = bestStrategy ? bestStrategy.name : data.strategies[0].name;
          }

          const strategyInfo = data.strategies.find(s => s.name === dominantStrategy) || data.strategies[0];
          const maxTotal = Math.max(...data.strategies.map(s => s.total));
          
          heatmapData.push({
            winRate,
            riskRatio,
            strategy: dominantStrategy,
            intensity: strategyInfo.total / maxTotal, // Normalize intensity based on actual max
            safety: strategyInfo.safePercentage,
            color: getStrategyColor(dominantStrategy),
            totalDominances: strategyInfo.total,
            optimalCases: strategyInfo.optimal
          });
        }
      }
      
      return heatmapData;
    };

    const heatmapData = generateHeatmapData();

    return (
      <div className="relative">
        <div className="grid grid-cols-5 gap-1 p-4 bg-gray-900 rounded-lg">
          {heatmapData.map((cell, index) => (
            <div
              key={index}
              className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: cell.color,
                opacity: 0.3 + cell.intensity * 0.7,
                minHeight: '60px',
                borderRadius: '4px'
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-xs font-semibold p-1">
                <div className="text-center truncate w-full">{cell.strategy.split(' ')[0]}</div>
                <div className="text-xs opacity-75">{(cell.winRate * 100).toFixed(0)}%</div>
              </div>
              
              {/* Hover tooltip with real data */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded p-2 whitespace-nowrap z-10">
                <div><strong>{cell.strategy}</strong></div>
                <div>Win Rate: {(cell.winRate * 100).toFixed(0)}%</div>
                <div>Risk Ratio: {cell.riskRatio}:1</div>
                <div>Safety: {cell.safety.toFixed(1)}%</div>
                <div>Total Dominances: {cell.totalDominances}</div>
                <div>Optimal Cases: {cell.optimalCases}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Axis labels */}
        <div className="flex justify-center mt-2">
          <div className="text-sm text-gray-400">Risk Ratio (0.5 → 2.5)</div>
        </div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90">
          <div className="text-sm text-gray-400">Win Rate (30% → 90%)</div>
        </div>
      </div>
    );
  };

  // Performance Ring Chart
  const PerformanceRing = ({ percentage, label, color }) => {
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-700"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{percentage}%</span>
          </div>
        </div>
        <div className="text-sm text-gray-300 mt-2 text-center">{label}</div>
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

  if (!strategyData || !statistics) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-600 dark:text-gray-400">
          No strategy data available.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Dynamic Strategy Analysis
      </h1>
      
      {/* Real-time Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-2">{statistics.totalAnalyses}</div>
            <div className="text-sm opacity-90">Total Strategies</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-2">{statistics.optimalPercentage}%</div>
            <div className="text-sm opacity-90">Optimal Performance</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold mb-2">{statistics.topStrategy.name}</div>
            <div className="text-sm opacity-90">Top Performer ({statistics.topStrategy.total})</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-2">{statistics.avgSafetyPercentage}%</div>
            <div className="text-sm opacity-90">Avg Safety Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Interactive Heatmap */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Live Strategy Dominance Heatmap</span>
            <div className="ml-auto">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardTitle>
          <CardDescription>
            Interactive heatmap showing real-time strategy dominance across different market conditions. Hover for details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicHeatmap data={strategyData} />
          
          {/* Real data legend with actual numbers */}
          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap justify-center gap-4">
              {strategyData.strategies.map((strategy) => (
                <div key={strategy.name} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getStrategyColor(strategy.name) }}
                  ></div>
                  <span className="text-sm">{strategy.name} ({strategy.total})</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500 text-center">
              Numbers in parentheses show total dominances from Strategy Results grid
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution Analysis</CardTitle>
            <CardDescription>Real-time breakdown of strategy performance by risk category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <PerformanceRing 
                percentage={Math.round((statistics.riskDistribution.optimal / statistics.totalAnalyses) * 100)}
                label="Optimal (≤1%)"
                color="#10B981"
              />
              <PerformanceRing 
                percentage={Math.round((statistics.riskDistribution.good / statistics.totalAnalyses) * 100)}
                label="Good (≤5%)"
                color="#3B82F6"
              />
              <PerformanceRing 
                percentage={Math.round((statistics.riskDistribution.notable / statistics.totalAnalyses) * 100)}
                label="Notable (>5%)"
                color="#F59E0B"
              />
              <PerformanceRing 
                percentage={Math.round((statistics.riskDistribution.risky / statistics.totalAnalyses) * 100)}
                label="Risky"
                color="#EF4444"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Strategy Performance</CardTitle>
            <CardDescription>Current strategy rankings and safety metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategyData.strategies
                .sort((a, b) => b.total - a.total)
                .map((strategy, index) => (
                  <div key={strategy.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-500">#{index + 1}</div>
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: getStrategyColor(strategy.name) }}
                      ></div>
                      <div>
                        <div className="font-semibold">{strategy.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {strategy.total} dominances • {strategy.safePercentage}% safe
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{strategy.optimal}</div>
                      <div className="text-xs text-gray-500">optimal</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Condition Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Market Condition Performance</CardTitle>
          <CardDescription>Strategy effectiveness across different trading environments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Win Rate Analysis</h3>
              <div className="space-y-2">
                {strategyData.winRateTrends?.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">{(trend.winRate * 100).toFixed(0)}% Win Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">{trend.dominantStrategy}</span>
                      <div className="text-xs text-gray-500">
                        {trend.occurrences}/{trend.total}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Risk Ratio Analysis</h3>
              <div className="space-y-2">
                {strategyData.riskRatioTrends?.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">{trend.riskRatio}:1 Ratio</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">{trend.dominantStrategy}</span>
                      <div className="text-xs text-gray-500">
                        {trend.occurrences}/{trend.total}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time sync indicator */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>
            Live Data • Last updated: {lastUpdateTime} • Auto-sync: Active
          </span>
        </div>
      </div>
    </div>
  );
};

export default DynamicAnalysisReport;