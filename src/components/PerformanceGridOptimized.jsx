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
    minWinRate: 0.3,
    maxWinRate: 0.9,
    minRiskRatio: 0.5,
    maxRiskRatio: 2.5,
    strategies: ['raw', 'martingale', 'antiMartingale', 'linear', 'antiLinear', 'smartDouble', 'antiSmartDouble']
  });
  const [quickLookup, setQuickLookup] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [batchConfig, setBatchConfig] = useState({
    simulationsPerCell: 5000,
    batchSize: 1000,
    enableMegaBatch: false,
    megaBatchSize: 50000
  });
// Enhanced simulation parameters for comprehensive backtesting
  const [simulationParams, setSimulationParams] = useState({
    initialBalance: 1000,
    baseBet: 10,
    rounds: 1000,
    maxBetPercent: 100, // Max bet as percentage of current balance
    maxBetSize: 1000, // Absolute max bet size cap
    minBetSize: 1, // Minimum bet size
    stopLossPercent: 0, // Stop loss as percentage of initial balance (0 = disabled)
    takeProfitPercent: 0, // Take profit as percentage of initial balance (0 = disabled)
    consecutiveLossLimit: 0, // Max consecutive losses before reset (0 = disabled)
    consecutiveWinLimit: 3, // Max consecutive wins for anti-strategies
    enableDynamicSizing: false, // Enable Kelly-based dynamic sizing
    kellyFraction: 0.25, // Fraction of Kelly to use for dynamic sizing
    riskManagementMode: 'standard' // 'standard', 'conservative', 'aggressive'
  });

  // Custom parameter sets for different testing scenarios
  const [parameterSets] = useState([
    {
      name: 'Conservative Risk Management',
      description: 'Low risk with strict bet size limits and stop losses',
      params: {
        maxBetPercent: 5,
        maxBetSize: 50,
        stopLossPercent: 20,
        takeProfitPercent: 50,
        riskManagementMode: 'conservative'
      }
    },
    {
      name: 'Aggressive Growth',
      description: 'Higher risk with dynamic sizing based on Kelly criterion',
      params: {
        maxBetPercent: 25,
        maxBetSize: 500,
        enableDynamicSizing: true,
        kellyFraction: 0.5,
        riskManagementMode: 'aggressive'
      }
    },
    {
      name: 'Capped Sizing Test',
      description: 'Test the effect of bet size caps on strategy performance',
      params: {
        maxBetPercent: 10,
        maxBetSize: 100,
        consecutiveLossLimit: 5,
        riskManagementMode: 'standard'
      }
    }
  ]);
  const [uploadedData, setUploadedData] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Available metrics for visualization (matching static grid format)
  const metrics = {
    meanROI: { name: 'Mean ROI (%)', format: (v) => `${v.toFixed(2)}%`, color: 'blue' },
    sharpeRatio: { name: 'Sharpe Ratio', format: (v) => v.toFixed(3), color: 'green' },
    calmarRatio: { name: 'Calmar Ratio (P/EMDD)', format: (v) => v === Infinity ? '∞' : v.toFixed(3), color: 'purple' },
    profitablePct: { name: 'Profitable %', format: (v) => `${v.toFixed(1)}%`, color: 'emerald' },
    ruinPct: { name: 'Ruin %', format: (v) => `${v.toFixed(2)}%`, color: 'red' },
    maxDrawdownMean: { name: 'Avg Max Drawdown %', format: (v) => `${v.toFixed(2)}%`, color: 'orange' },
    volatility: { name: 'Volatility', format: (v) => v.toFixed(3), color: 'yellow' },
    expectedProfit: { name: 'Expected Profit', format: (v) => v.toFixed(0), color: 'cyan' }
  };

  // Win rates and risk ratios matching the static grid
  const staticWinRates = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const staticRiskRatios = [0.5, 1.0, 1.5, 2.0, 2.5];

  // Load cached data on component mount
  useEffect(() => {
    const cached = SimulationDataGenerator.loadGridFromCache('performance_grid_enhanced');
    if (cached) {
      setGridData(cached);
    }
    
    const lookup = SimulationDataGenerator.generateQuickLookupTable();
    setQuickLookup(lookup);
    
    const stats = SimulationDataGenerator.getCacheStats();
    setCacheStats(stats);
  }, []);

  // Generate enhanced grid with thousands of simulations
  const generateEnhancedGrid = useCallback(async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const simulationsPerCell = batchConfig.enableMegaBatch ? 
        batchConfig.megaBatchSize : batchConfig.simulationsPerCell;

      const grid = await SimulationDataGenerator.generateOptimizedGrid({
        winRates: staticWinRates,
        riskRatios: staticRiskRatios,
        strategies: ['raw', 'martingale', 'antiMartingale', 'linear', 'antiLinear', 'smartDouble', 'antiSmartDouble'],
        simulationsPerCell,
        batchSize: batchConfig.batchSize,
        rounds: 1000,
        initialBalance: 1000,
        baseBet: 10,
        onProgress: (progressData) => {
          setProgress(progressData.percentage);
        }
      });

      // Convert to static grid format for compatibility
      const convertedGrid = convertToStaticFormat(grid);
      setGridData(convertedGrid);
      SimulationDataGenerator.saveGridToCache('performance_grid_enhanced', convertedGrid);
      
      const stats = SimulationDataGenerator.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Enhanced grid generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [batchConfig]);

  // Convert optimized grid format to static grid format
  const convertToStaticFormat = useCallback((optimizedGrid) => {
    const staticFormat = {
      win_rates: staticWinRates,
      risk_ratios: staticRiskRatios,
      grid: {}
    };

    staticWinRates.forEach(wr => {
      const wrKey = wr.toFixed(1);
      staticFormat.grid[wrKey] = {};
      
      staticRiskRatios.forEach(rr => {
        const rrKey = rr.toFixed(1);
        staticFormat.grid[wrKey][rrKey] = [];
        
        if (optimizedGrid.data[wr] && optimizedGrid.data[wr][rr]) {
          Object.entries(optimizedGrid.data[wr][rr]).forEach(([strategy, stats]) => {
            // Convert strategy names to match static format
            const strategyName = strategy === 'antiMartingale' ? 'anti_martingale' :
                               strategy === 'antiLinear' ? 'anti_linear' :
                               strategy === 'smartDouble' ? 'smart_double' :
                               strategy === 'antiSmartDouble' ? 'anti_smart_double' :
                               strategy;

            // Calculate risk classification
            const ruinProb = stats.ruinPct / 100;
            const profit = stats.expectedProfit || stats.meanROI;
            let note = '';
            
            if (ruinProb <= 0.01) {
              note = 'Optimal (Ruin ≤ 1%)';
            } else if (ruinProb <= 0.05) {
              note = 'Good Compromise (Ruin ≤ 5%)';
            } else if (ruinProb > 0.05 && profit > 0) {
              note = 'Notable Risk';
            } else {
              note = 'Very High Risk (High Ruin or Negative Profit)';
            }

            staticFormat.grid[wrKey][rrKey].push({
              strategy_type: strategyName,
              calmar_ratio_pemdd: stats.calmarRatio === Infinity ? '∞' : stats.calmarRatio.toFixed(3),
              probability_of_ruin: ruinProb,
              expected_profit: profit,
              note: note
            });
          });

          // Sort strategies by performance (ruin probability first, then calmar ratio)
          staticFormat.grid[wrKey][rrKey].sort((a, b) => {
            if (a.probability_of_ruin !== b.probability_of_ruin) {
              return a.probability_of_ruin - b.probability_of_ruin;
            }
            const aCalmar = a.calmar_ratio_pemdd === '∞' ? Infinity : parseFloat(a.calmar_ratio_pemdd);
            const bCalmar = b.calmar_ratio_pemdd === '∞' ? Infinity : parseFloat(b.calmar_ratio_pemdd);
            return bCalmar - aCalmar;
          });
        }
      });
    });

    return staticFormat;
  }, []);

  // Upload data to static grid
  const uploadToStaticGrid = useCallback(async () => {
    if (!gridData) return;

    try {
      // Create downloadable file for manual upload to public/data/
      const blob = new Blob([JSON.stringify(gridData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_strategies_grid_updated.json';
      a.click();
      URL.revokeObjectURL(url);

      // Also save to local storage for immediate use
      localStorage.setItem('uploaded_static_grid', JSON.stringify(gridData));
      setUploadedData(gridData);
      
      alert('Grid data exported! Please manually replace the file in public/data/all_strategies_grid.json with the downloaded file, then refresh the Performance Grid page.');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  }, [gridData]);

  // Filter grid data based on current filters
  const filteredGridData = useMemo(() => {
    if (!gridData) return null;

    if (gridData.win_rates) {
      // Static format
      const filtered = {
        win_rates: gridData.win_rates.filter(wr => wr >= filterConfig.minWinRate && wr <= filterConfig.maxWinRate),
        risk_ratios: gridData.risk_ratios.filter(rr => rr >= filterConfig.minRiskRatio && rr <= filterConfig.maxRiskRatio),
        grid: {}
      };

      filtered.win_rates.forEach(wr => {
        const wrKey = wr.toFixed(1);
        if (gridData.grid[wrKey]) {
          filtered.grid[wrKey] = {};
          filtered.risk_ratios.forEach(rr => {
            const rrKey = rr.toFixed(1);
            if (gridData.grid[wrKey][rrKey]) {
              filtered.grid[wrKey][rrKey] = gridData.grid[wrKey][rrKey].filter(strategy => 
                filterConfig.strategies.includes(strategy.strategy_type) ||
                filterConfig.strategies.includes(strategy.strategy_type.replace('_', ''))
              );
            }
          });
        }
      });

      return filtered;
    } else {
      // Optimized format
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
    }
  }, [gridData, filterConfig]);

  // Get color intensity for heatmap
  const getColorIntensity = useCallback((value, min, max) => {
    if (max === min) return 0.5;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
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

  // Get strategy class for styling
  const getStrategyClass = (note) => {
    if (!note) return "border-gray-300 dark:border-gray-600";
    if (note.includes("Optimal (Ruin") || note.includes("Optimal (Ruin ≤ 1%)")) return "border-green-500 dark:border-green-400 ring-2 ring-green-500 dark:ring-green-400";
    if (note.includes("Good Compromise") || note.includes("Good Compromise (Ruin ≤ 5%)")) return "border-yellow-500 dark:border-yellow-400";
    if (note.includes("Notable Risk")) return "border-orange-500 dark:border-orange-400";
    if (note.includes("Very High Risk")) return "border-red-500 dark:border-red-400";
    return "border-gray-300 dark:border-gray-600";
  };

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
const handleParamChange = useCallback((field, value) => {
    setSimulationParams(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const applyParameterSet = useCallback((paramSet) => {
    setSimulationParams(prev => ({
      ...prev,
      ...paramSet.params
    }));
  }, []);
  }, []);

  const exportGrid = useCallback(() => {
    if (!gridData) return;

    const exportData = {
      ...gridData,
      exportedAt: new Date().toISOString(),
      filters: filterConfig,
      selectedMetric,
      batchConfig
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced_performance_grid_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [gridData, filterConfig, selectedMetric, batchConfig]);

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
            🚀 Enhanced Performance Grid
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Generate robust batches of thousands of simulations for comprehensive strategy analysis
          </p>
        </div>

        {/* Enhanced Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Generation Controls */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Enhanced Generation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Simulations per Cell</label>
                <Input
                  type="number"
                  value={batchConfig.simulationsPerCell}
                  onChange={(e) => setBatchConfig(prev => ({...prev, simulationsPerCell: parseInt(e.target.value)}))}
                  min="1000"
                  max="100000"
                  step="1000"
                  disabled={batchConfig.enableMegaBatch}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Batch Size</label>
                <Input
                  type="number"
                  value={batchConfig.batchSize}
                  onChange={(e) => setBatchConfig(prev => ({...prev, batchSize: parseInt(e.target.value)}))}
                  min="100"
                  max="5000"
                  step="100"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="megaBatch"
                  checked={batchConfig.enableMegaBatch}
                  onChange={(e) => setBatchConfig(prev => ({...prev, enableMegaBatch: e.target.checked}))}
                />
                <label htmlFor="megaBatch" className="text-sm font-medium">Enable Mega Batch</label>
              </div>

              {batchConfig.enableMegaBatch && (
                <div>
                  <label className="block text-sm font-medium mb-1">Mega Batch Size</label>
                  <Input
                    type="number"
                    value={batchConfig.megaBatchSize}
                    onChange={(e) => setBatchConfig(prev => ({...prev, megaBatchSize: parseInt(e.target.value)}))}
                    min="10000"
                    max="1000000"
                    step="10000"
                  />
                </div>
              )}
              
              <Button
                onClick={generateEnhancedGrid}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? `Generating... ${progress.toFixed(1)}%` : 'Generate Enhanced Grid'}
              </Button>
              
              {isGenerating && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Data Management */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="space-y-4">
              <Button 
                onClick={uploadToStaticGrid} 
                disabled={!gridData} 
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                Upload to Performance Grid
              </Button>
              
              <Button onClick={exportGrid} disabled={!gridData} variant="outline" className="w-full">
                Export Enhanced Grid
              </Button>
              
              <Button onClick={clearCache} variant="outline" className="w-full">
                Clear Cache
              </Button>

              {uploadedData && (
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300">
                  ✓ Data ready for upload to Performance Grid
                </div>
              )}
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
                    step="0.1"
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
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Risk Ratio</label>
                  <Input
                    type="number"
                    value={filterConfig.minRiskRatio}
                    onChange={(e) => handleFilterChange('minRiskRatio', parseFloat(e.target.value))}
                    min="0.5"
                    max="2.5"
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
                    max="2.5"
                    step="0.5"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Strategies</label>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {['raw', 'martingale', 'antiMartingale', 'linear', 'antiLinear', 'smartDouble', 'antiSmartDouble'].map(strategy => (
                    <label key={strategy} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filterConfig.strategies.includes(strategy)}
                        onChange={() => toggleStrategy(strategy)}
                        className="mr-1"
                      />
                      {formatStrategyName(strategy)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Batch Statistics */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Batch Statistics</h3>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Total Simulations</div>
                <div className="font-medium">
                  {(batchConfig.enableMegaBatch ? batchConfig.megaBatchSize : batchConfig.simulationsPerCell) * 
                   staticWinRates.length * staticRiskRatios.length * 7}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Estimated Time</div>
                <div className="font-medium">
                  {batchConfig.enableMegaBatch ? '10-30 min' : '2-5 min'}
                </div>
              </div>
              {cacheStats && (
                <>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Cache Size</div>
                    <div className="font-medium">{cacheStats.cacheSize} grids</div>
                  </div>
                  <div>
                    <div className="text-gray-600 dark:text-gray-400">Memory Usage</div>
                    <div className="font-medium">{(cacheStats.memoryUsage / 1024).toFixed(1)} KB</div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
{/* Advanced Simulation Parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Basic Parameters */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">⚙️ Basic Parameters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Initial Balance</label>
                <Input
                  type="number"
                  value={simulationParams.initialBalance}
                  onChange={(e) => handleParamChange('initialBalance', parseInt(e.target.value))}
                  min="100"
                  max="100000"
                  step="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Bet Size</label>
                <Input
                  type="number"
                  value={simulationParams.baseBet}
                  onChange={(e) => handleParamChange('baseBet', parseInt(e.target.value))}
                  min="1"
                  max="1000"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Number of Rounds</label>
                <Input
                  type="number"
                  value={simulationParams.rounds}
                  onChange={(e) => handleParamChange('rounds', parseInt(e.target.value))}
                  min="100"
                  max="10000"
                  step="100"
                />
              </div>
            </div>
          </Card>

          {/* Risk Management */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">🛡️ Risk Management</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Max Bet % of Balance</label>
                <Input
                  type="number"
                  value={simulationParams.maxBetPercent}
                  onChange={(e) => handleParamChange('maxBetPercent', parseFloat(e.target.value))}
                  min="1"
                  max="100"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">Caps bet size as % of current balance</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Absolute Max Bet Size</label>
                <Input
                  type="number"
                  value={simulationParams.maxBetSize}
                  onChange={(e) => handleParamChange('maxBetSize', parseInt(e.target.value))}
                  min="1"
                  max="10000"
                  step="10"
                />
                <p className="text-xs text-gray-500 mt-1">Hard cap on bet size regardless of balance</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stop Loss % of Initial</label>
                <Input
                  type="number"
                  value={simulationParams.stopLossPercent}
                  onChange={(e) => handleParamChange('stopLossPercent', parseFloat(e.target.value))}
                  min="0"
                  max="90"
                  step="5"
                />
                <p className="text-xs text-gray-500 mt-1">Stop trading when balance drops below this % (0 = disabled)</p>
              </div>
            </div>
          </Card>

          {/* Advanced Settings */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">🔬 Advanced Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Consecutive Loss Limit</label>
                <Input
                  type="number"
                  value={simulationParams.consecutiveLossLimit}
                  onChange={(e) => handleParamChange('consecutiveLossLimit', parseInt(e.target.value))}
                  min="0"
                  max="20"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">Reset strategy after X consecutive losses (0 = disabled)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Take Profit % of Initial</label>
                <Input
                  type="number"
                  value={simulationParams.takeProfitPercent}
                  onChange={(e) => handleParamChange('takeProfitPercent', parseFloat(e.target.value))}
                  min="0"
                  max="1000"
                  step="10"
                />
                <p className="text-xs text-gray-500 mt-1">Stop trading when balance reaches this % (0 = disabled)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Risk Management Mode</label>
                <select
                  value={simulationParams.riskManagementMode}
                  onChange={(e) => handleParamChange('riskManagementMode', e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="standard">Standard</option>
                  <option value="conservative">Conservative</option>
                  <option value="aggressive">Aggressive</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Overall risk management approach</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Parameter Presets */}
        <div className="mb-8">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">🎯 Parameter Presets</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Quick-apply different parameter sets to test various scenarios like bet size caps, risk management modes, and more.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {parameterSets.map((preset, index) => (
                <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <h4 className="font-medium text-sm mb-2">{preset.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{preset.description}</p>
                  <div className="text-xs space-y-1 mb-3">
                    {Object.entries(preset.params).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-500">{key}:</span>
                        <span className="font-medium">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => applyParameterSet(preset)}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    Apply Preset
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Grid Display */}
        {filteredGridData && (
          <Card className="p-4 mb-8">
            <h3 className="text-lg font-semibold mb-4">
              Enhanced Performance Grid - Compatible with Static Format
            </h3>
            
            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-r dark:border-gray-600 whitespace-nowrap">
                      WIN RATE (WR) <span className="font-normal text-gray-500 dark:text-gray-400">(↓ Rows)</span> <br/> 
                      RISK RATIO (RR) <span className="font-normal text-gray-500 dark:text-gray-400">(→ Columns)</span>
                    </th>
                    {(filteredGridData.risk_ratios || staticRiskRatios).map(rr => (
                      <th key={rr} className="px-2 py-3.5 text-center text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-r dark:border-gray-600">
                        {rr.toFixed(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {(filteredGridData.win_rates || staticWinRates).map(wr => (
                    <tr key={wr} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 ease-in-out">
                      <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 border-r dark:border-gray-600 bg-gray-50 dark:bg-gray-800 sticky left-0 z-5">
                        {wr.toFixed(1)}
                      </td>
                      {(filteredGridData.risk_ratios || staticRiskRatios).map(rr => {
                        const wrKey = wr.toFixed(1);
                        const rrKey = rr.toFixed(1);
                        const cellStrategies = filteredGridData.grid?.[wrKey]?.[rrKey] || [];
                        
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
        )}

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
      </div>
    </div>
  );
};

export default PerformanceGridOptimized;
