import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import SimulationDataGenerator from '../utils/SimulationDataGenerator';

const PerformanceGridOptimized = () => {
  const [gridData, setGridData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState('meanROI');
  const [filterConfig, setFilterConfig] = useState({
    minWinRate: 0.45,
    maxWinRate: 0.70,
    minRiskRatio: 1.0,
    maxRiskRatio: 3.0,
    strategies: ['raw', 'martingale', 'antiMartingale']
  });
  const [quickLookup, setQuickLookup] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);

  // Available metrics for visualization
  const metrics = {
    meanROI: { name: 'Mean ROI (%)', format: (v) => `${v.toFixed(2)}%`, color: 'blue' },
    sharpeRatio: { name: 'Sharpe Ratio', format: (v) => v.toFixed(3), color: 'green' },
    calmarRatio: { name: 'Calmar Ratio', format: (v) => v.toFixed(3), color: 'purple' },
    profitablePct: { name: 'Profitable %', format: (v) => `${v.toFixed(1)}%`, color: 'emerald' },
    ruinPct: { name: 'Ruin %', format: (v) => `${v.toFixed(1)}%`, color: 'red' },
    maxDrawdownMean: { name: 'Avg Max Drawdown %', format: (v) => `${v.toFixed(2)}%`, color: 'orange' },
    volatility: { name: 'Volatility', format: (v) => v.toFixed(3), color: 'yellow' }
  };

  // Load cached data on component mount
  useEffect(() => {
    const cached = SimulationDataGenerator.loadGridFromCache('performance_grid');
    if (cached) {
      setGridData(cached);
    }
    
    const lookup = SimulationDataGenerator.generateQuickLookupTable();
    setQuickLookup(lookup);
    
    const stats = SimulationDataGenerator.getCacheStats();
    setCacheStats(stats);
  }, []);

  // Generate optimized grid
  const generateGrid = useCallback(async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const grid = await SimulationDataGenerator.generateOptimizedGrid({
        winRates: [0.45, 0.50, 0.55, 0.60, 0.65, 0.70],
        riskRatios: [1.0, 1.5, 2.0, 2.5, 3.0],
        strategies: ['raw', 'martingale', 'antiMartingale', 'linear', 'antiLinear', 'smartDouble', 'antiSmartDouble'],
        simulationsPerCell: 2000, // Reduced for faster generation
        onProgress: (progressData) => {
          setProgress(progressData.percentage);
        }
      });

      setGridData(grid);
      SimulationDataGenerator.saveGridToCache('performance_grid', grid);
      
      const stats = SimulationDataGenerator.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Grid generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Filter grid data based on current filters
  const filteredGridData = useMemo(() => {
    if (!gridData) return null;

    const filtered = {
      ...gridData,
      data: {}
    };

    Object.entries(gridData.data).forEach(([winRate, riskRatioData]) => {
      const wr = parseFloat(winRate);
      if (wr >= filterConfig.minWinRate && wr <= filterConfig.maxWinRate) {
        filtered.data[winRate] = {};
        
        Object.entries(riskRatioData).forEach(([riskRatio, strategyData]) => {
          const rr = parseFloat(riskRatio);
          if (rr >= filterConfig.minRiskRatio && rr <= filterConfig.maxRiskRatio) {
            filtered.data[winRate][riskRatio] = {};
            
            Object.entries(strategyData).forEach(([strategy, stats]) => {
              if (filterConfig.strategies.includes(strategy)) {
                filtered.data[winRate][riskRatio][strategy] = stats;
              }
            });
          }
        });
      }
    });

    return filtered;
  }, [gridData, filterConfig]);

  // Get color intensity for heatmap
  const getColorIntensity = useCallback((value, min, max) => {
    if (max === min) return 0.5;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }, []);

  // Calculate min/max values for selected metric
  const metricRange = useMemo(() => {
    if (!filteredGridData) return { min: 0, max: 1 };

    let min = Infinity;
    let max = -Infinity;

    Object.values(filteredGridData.data).forEach(riskRatioData => {
      Object.values(riskRatioData).forEach(strategyData => {
        Object.values(strategyData).forEach(stats => {
          const value = stats[selectedMetric];
          if (typeof value === 'number' && !isNaN(value)) {
            min = Math.min(min, value);
            max = Math.max(max, value);
          }
        });
      });
    });

    return { min: min === Infinity ? 0 : min, max: max === -Infinity ? 1 : max };
  }, [filteredGridData, selectedMetric]);

  // Find best performing cell
  const bestPerformer = useMemo(() => {
    if (!filteredGridData) return null;

    let best = null;
    let bestValue = -Infinity;

    Object.entries(filteredGridData.data).forEach(([winRate, riskRatioData]) => {
      Object.entries(riskRatioData).forEach(([riskRatio, strategyData]) => {
        Object.entries(strategyData).forEach(([strategy, stats]) => {
          const value = stats[selectedMetric];
          if (typeof value === 'number' && !isNaN(value) && value > bestValue) {
            bestValue = value;
            best = { winRate: parseFloat(winRate), riskRatio: parseFloat(riskRatio), strategy, stats };
          }
        });
      });
    });

    return best;
  }, [filteredGridData, selectedMetric]);

  const handleFilterChange = useCallback((field, value) => {
    setFilterConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const toggleStrategy = useCallback((strategy) => {
    setFilterConfig(prev => ({
      ...prev,
      strategies: prev.strategies.includes(strategy)
        ? prev.strategies.filter(s => s !== strategy)
        : [...prev.strategies, strategy]
    }));
  }, []);

  const exportGrid = useCallback(() => {
    if (!gridData) return;

    const exportData = {
      ...gridData,
      exportedAt: new Date().toISOString(),
      filters: filterConfig,
      selectedMetric
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_grid_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [gridData, filterConfig, selectedMetric]);

  const clearCache = useCallback(() => {
    SimulationDataGenerator.clearCache();
    setGridData(null);
    setCacheStats(SimulationDataGenerator.getCacheStats());
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            📊 Optimized Performance Grid
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Pre-computed simulation results for efficient strategy analysis
          </p>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Generation Controls */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Grid Generation</h3>
            <div className="space-y-4">
              <Button
                onClick={generateGrid}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? `Generating... ${progress.toFixed(1)}%` : 'Generate New Grid'}
              </Button>
              
              {isGenerating && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={exportGrid} disabled={!gridData} variant="outline" className="flex-1">
                  Export Grid
                </Button>
                <Button onClick={clearCache} variant="outline" className="flex-1">
                  Clear Cache
                </Button>
              </div>
            </div>
          </Card>

          {/* Filters */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Win Rate</label>
                  <Input
                    type="number"
                    value={filterConfig.minWinRate}
                    onChange={(e) => handleFilterChange('minWinRate', parseFloat(e.target.value))}
                    min="0.3"
                    max="0.9"
                    step="0.05"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Win Rate</label>
                  <Input
                    type="number"
                    value={filterConfig.maxWinRate}
                    onChange={(e) => handleFilterChange('maxWinRate', parseFloat(e.target.value))}
                    min="0.3"
                    max="0.9"
                    step="0.05"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Risk Ratio</label>
                  <Input
                    type="number"
                    value={filterConfig.minRiskRatio}
                    onChange={(e) => handleFilterChange('minRiskRatio', parseFloat(e.target.value))}
                    min="0.5"
                    max="5"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Risk Ratio</label>
                  <Input
                    type="number"
                    value={filterConfig.maxRiskRatio}
                    onChange={(e) => handleFilterChange('maxRiskRatio', parseFloat(e.target.value))}
                    min="0.5"
                    max="5"
                    step="0.5"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Strategies</label>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {['raw', 'martingale', 'antiMartingale', 'linear', 'antiLinear', 'smartDouble', 'antiSmartDouble'].map(strategy => (
                    <label key={strategy} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filterConfig.strategies.includes(strategy)}
                        onChange={() => toggleStrategy(strategy)}
                        className="mr-1"
                      />
                      {strategy}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Metric Selection */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Visualization</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Metric</label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  {Object.entries(metrics).map(([key, metric]) => (
                    <option key={key} value={key}>{metric.name}</option>
                  ))}
                </select>
              </div>
              
              {bestPerformer && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200">Best Performer</div>
                  <div className="text-xs text-green-600 dark:text-green-300">
                    WR: {(bestPerformer.winRate * 100).toFixed(0)}%, RR: {bestPerformer.riskRatio}, {bestPerformer.strategy}
                  </div>
                  <div className="text-sm font-bold text-green-800 dark:text-green-200">
                    {metrics[selectedMetric].format(bestPerformer.stats[selectedMetric])}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Lookup Table */}
        {quickLookup && (
          <Card className="p-4 mb-8">
            <h3 className="text-lg font-semibold mb-4">Quick Scenario Lookup</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(quickLookup).map(([name, data]) => (
                <div key={name} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <div className="font-medium text-sm">{name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    WR: {(data.config.winRate * 100).toFixed(0)}%, RR: {data.config.riskRatio}
                  </div>
                  <div className="text-xs">
                    EV: {data.expectedValue.toFixed(3)}
                  </div>
                  <div className="text-xs">
                    Kelly: {(data.kellyFraction * 100).toFixed(1)}%
                  </div>
                  <div className={`text-xs font-medium ${
                    data.riskLevel.includes('Low') ? 'text-green-600' : 
                    data.riskLevel.includes('Medium') ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {data.riskLevel}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Performance Grid Heatmap */}
        {filteredGridData && (
          <Card className="p-4 mb-8">
            <h3 className="text-lg font-semibold mb-4">
              Performance Heatmap - {metrics[selectedMetric].name}
            </h3>
            
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Headers */}
                <div className="grid grid-cols-[100px_repeat(auto-fit,minmax(120px,1fr))] gap-1 mb-2">
                  <div className="font-medium text-sm p-2">Win Rate / Risk Ratio</div>
                  {Object.keys(filteredGridData.data[Object.keys(filteredGridData.data)[0]] || {}).map(riskRatio => (
                    <div key={riskRatio} className="font-medium text-sm p-2 text-center">
                      {riskRatio}
                    </div>
                  ))}
                </div>
                
                {/* Grid Rows */}
                {Object.entries(filteredGridData.data).map(([winRate, riskRatioData]) => (
                  <div key={winRate} className="grid grid-cols-[100px_repeat(auto-fit,minmax(120px,1fr))] gap-1 mb-1">
                    <div className="font-medium text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded">
                      {(parseFloat(winRate) * 100).toFixed(0)}%
                    </div>
                    
                    {Object.entries(riskRatioData).map(([riskRatio, strategyData]) => {
                      const bestStrategy = Object.entries(strategyData).reduce((best, [strategy, stats]) => {
                        const value = stats[selectedMetric];
                        return (!best || value > best.value) ? { strategy, value, stats } : best;
                      }, null);
                      
                      if (!bestStrategy) {
                        return <div key={riskRatio} className="p-2 bg-gray-200 dark:bg-gray-600 rounded text-center text-xs">No Data</div>;
                      }
                      
                      const intensity = getColorIntensity(bestStrategy.value, metricRange.min, metricRange.max);
                      const bgColor = selectedMetric === 'ruinPct' || selectedMetric === 'maxDrawdownMean'
                        ? `rgba(239, 68, 68, ${intensity})` // Red for bad metrics
                        : `rgba(34, 197, 94, ${intensity})`; // Green for good metrics
                      
                      return (
                        <div
                          key={riskRatio}
                          className="p-2 rounded text-center text-xs border"
                          style={{ backgroundColor: bgColor }}
                        >
                          <div className="font-medium">{bestStrategy.strategy}</div>
                          <div className="font-bold">
                            {metrics[selectedMetric].format(bestStrategy.value)}
                          </div>
                          <div className="text-xs opacity-75">
                            P: {bestStrategy.stats.profitablePct.toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Cache Statistics */}
        {cacheStats && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Cache Statistics</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Cache Size</div>
                <div className="font-medium">{cacheStats.cacheSize} grids</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Memory Usage</div>
                <div className="font-medium">{(cacheStats.memoryUsage / 1024).toFixed(1)} KB</div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Storage Keys</div>
                <div className="font-medium">{cacheStats.localStorageKeys}</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PerformanceGridOptimized;