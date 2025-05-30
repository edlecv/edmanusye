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
  const [quickLookup, setQuickLookup] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  
  // Unified configuration state
  const [config, setConfig] = useState({
    // Generation settings
    simulationsPerCell: 5000,
    batchSize: 1000,
    enableMegaBatch: false,
    megaBatchSize: 50000,
    
    // Simulation parameters
    initialBalance: 1000,
    baseBet: 10,
    rounds: 1000,
    maxBetPercent: 100,
    maxBetSize: 1000,
    minBetSize: 1,
    
    // Advanced risk management
    enableAdvancedRisk: false,
    stopLossPercent: 0,
    takeProfitPercent: 0,
    consecutiveLossLimit: 0,
    consecutiveWinLimit: 0,
    
    // Strategy configuration
    smartDoubleX: 1,
    antiSmartDoubleX: 1,
    enableAllXVariants: false, // New feature to generate all X variants
    
    // Grid configuration
    useCustomGrid: false,
    customWinRates: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    customRiskRatios: [0.5, 1.0, 1.5, 2.0, 2.5],
    
    // Filters
    minWinRate: 0.3,
    maxWinRate: 0.9,
    minRiskRatio: 0.5,
    maxRiskRatio: 2.5,
    selectedStrategies: ['raw', 'martingale', 'antiMartingale', 'linear', 'antiLinear', 'smartDouble', 'antiSmartDouble']
  });

  // Track current configuration hash to detect changes
  const [lastGeneratedHash, setLastGeneratedHash] = useState(null);
  
  // Calculate configuration hash for change detection
  const configHash = useMemo(() => {
    const relevantConfig = {
      simulationsPerCell: config.enableMegaBatch ? config.megaBatchSize : config.simulationsPerCell,
      batchSize: config.batchSize,
      initialBalance: config.initialBalance,
      baseBet: config.baseBet,
      rounds: config.rounds,
      maxBetPercent: config.maxBetPercent,
      maxBetSize: config.maxBetSize,
      minBetSize: config.minBetSize,
      stopLossPercent: config.enableAdvancedRisk ? config.stopLossPercent : 0,
      takeProfitPercent: config.enableAdvancedRisk ? config.takeProfitPercent : 0,
      consecutiveLossLimit: config.enableAdvancedRisk ? config.consecutiveLossLimit : 0,
      consecutiveWinLimit: config.enableAdvancedRisk ? config.consecutiveWinLimit : 0,
      smartDoubleX: config.smartDoubleX,
      antiSmartDoubleX: config.antiSmartDoubleX,
      enableAllXVariants: config.enableAllXVariants,
      winRates: config.useCustomGrid ? config.customWinRates : [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      riskRatios: config.useCustomGrid ? config.customRiskRatios : [0.5, 1.0, 1.5, 2.0, 2.5],
      strategies: config.selectedStrategies
    };
    return JSON.stringify(relevantConfig);
  }, [config]);

  // Check if parameters have changed since last generation
  const hasParametersChanged = useMemo(() => {
    return lastGeneratedHash !== null && lastGeneratedHash !== configHash;
  }, [lastGeneratedHash, configHash]);

  // Current win rates and risk ratios
  const currentWinRates = config.useCustomGrid ? config.customWinRates : [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const currentRiskRatios = config.useCustomGrid ? config.customRiskRatios : [0.5, 1.0, 1.5, 2.0, 2.5];

  // Strategy name conversion functions
  const convertStrategyNameToStatic = (strategy) => {
    // Handle X variants
    if (strategy.startsWith('smartDouble_X')) {
      const xValue = strategy.split('_X')[1];
      return `smart_double_X${xValue}`;
    }
    if (strategy.startsWith('antiSmartDouble_X')) {
      const xValue = strategy.split('_X')[1];
      return `anti_smart_double_X${xValue}`;
    }
    
    const conversionMap = {
      'antiMartingale': 'anti_martingale',
      'antiLinear': 'anti_linear',
      'smartDouble': 'smart_double',
      'antiSmartDouble': 'anti_smart_double'
    };
    return conversionMap[strategy] || strategy;
  };

  const convertStrategyNameFromStatic = (strategy) => {
    // Handle X variants
    if (strategy.startsWith('smart_double_X')) {
      const xValue = strategy.split('_X')[1];
      return `smartDouble_X${xValue}`;
    }
    if (strategy.startsWith('anti_smart_double_X')) {
      const xValue = strategy.split('_X')[1];
      return `antiSmartDouble_X${xValue}`;
    }
    
    const conversionMap = {
      'anti_martingale': 'antiMartingale',
      'anti_linear': 'antiLinear',
      'smart_double': 'smartDouble',
      'anti_smart_double': 'antiSmartDouble'
    };
    return conversionMap[strategy] || strategy;
  };

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

  // Update configuration
  const updateConfig = useCallback((updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Generate enhanced grid
  const generateEnhancedGrid = useCallback(async () => {
    if (config.selectedStrategies.length === 0 && !config.enableAllXVariants) {
      alert('Please select at least one strategy to generate the grid.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const simulationsPerCell = config.enableMegaBatch ? config.megaBatchSize : config.simulationsPerCell;

      // Determine strategies to generate
      let strategiesToGenerate = [...config.selectedStrategies];
      
      if (config.enableAllXVariants) {
        // Remove existing smart double strategies if present
        strategiesToGenerate = strategiesToGenerate.filter(s => s !== 'smartDouble' && s !== 'antiSmartDouble');
        
        // Add all X variants for Smart Double and Anti-Smart Double
        const xValues = [1, 2, 3, 4];
        for (const x of xValues) {
          strategiesToGenerate.push(`smartDouble_X${x}`);
          strategiesToGenerate.push(`antiSmartDouble_X${x}`);
        }
        
        // Also include base strategies if not already present
        const baseStrategies = ['raw', 'martingale', 'antiMartingale', 'linear', 'antiLinear'];
        baseStrategies.forEach(strategy => {
          if (!strategiesToGenerate.includes(strategy)) {
            strategiesToGenerate.push(strategy);
          }
        });
      }

      console.log('Starting grid generation with strategies:', strategiesToGenerate);

      const grid = await SimulationDataGenerator.generateOptimizedGrid({
        winRates: currentWinRates,
        riskRatios: currentRiskRatios,
        strategies: strategiesToGenerate,
        simulationsPerCell,
        batchSize: config.batchSize,
        rounds: config.rounds,
        initialBalance: config.initialBalance,
        baseBet: config.baseBet,
        maxBetPercent: config.maxBetPercent,
        maxBetSize: config.maxBetSize,
        minBetSize: config.minBetSize,
        stopLossPercent: config.enableAdvancedRisk ? config.stopLossPercent : 0,
        takeProfitPercent: config.enableAdvancedRisk ? config.takeProfitPercent : 0,
        consecutiveLossLimit: config.enableAdvancedRisk ? config.consecutiveLossLimit : 0,
        consecutiveWinLimit: config.enableAdvancedRisk ? config.consecutiveWinLimit : 0,
        strategyConfig: {
          smartDoubleX: config.smartDoubleX,
          antiSmartDoubleX: config.antiSmartDoubleX,
          enableAllXVariants: config.enableAllXVariants
        },
        onProgress: (progressData) => {
          setProgress(progressData.percentage);
          console.log(`Progress: ${progressData.percentage.toFixed(1)}% - ${progressData.currentCell.strategy}`);
        }
      });

      console.log('Grid generation completed, converting to static format...');

      const convertedGrid = convertToStaticFormat(grid);
      setGridData(convertedGrid);
      setLastGeneratedHash(configHash);
      SimulationDataGenerator.saveGridToCache('performance_grid_enhanced', convertedGrid);
      
      const stats = SimulationDataGenerator.getCacheStats();
      setCacheStats(stats);
      
      console.log('Grid conversion and caching completed successfully');
    } catch (error) {
      console.error('Enhanced grid generation failed:', error);
      alert(`Grid generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [config, currentWinRates, currentRiskRatios, configHash]);

  // Convert optimized grid format to static grid format
  const convertToStaticFormat = useCallback((optimizedGrid) => {
    const staticFormat = {
      win_rates: currentWinRates,
      risk_ratios: currentRiskRatios,
      grid: {}
    };

    currentWinRates.forEach(wr => {
      const wrKey = wr.toFixed(1);
      staticFormat.grid[wrKey] = {};
      
      currentRiskRatios.forEach(rr => {
        const rrKey = rr.toFixed(1);
        staticFormat.grid[wrKey][rrKey] = [];
        
        if (optimizedGrid.data[wr] && optimizedGrid.data[wr][rr]) {
          Object.entries(optimizedGrid.data[wr][rr]).forEach(([strategy, stats]) => {
            const strategyName = convertStrategyNameToStatic(strategy);
            const ruinProb = stats.ruinPct / 100;
            const profit = stats.expectedProfit || stats.meanROI;
            let note = '';
            
            if (ruinProb <= 0.01) {
              note = 'Optimal';
            } else if (ruinProb <= 0.05) {
              note = 'Good Compromise';
            } else if (ruinProb > 0.05 && profit > 0) {
              note = 'Notable Risk';
            } else {
              note = 'Very High Risk';
            }

            // Extract X value for X variant strategies
            let xValue = null;
            if (strategy.startsWith('smartDouble_X')) {
              xValue = parseInt(strategy.split('_X')[1]);
            } else if (strategy.startsWith('antiSmartDouble_X')) {
              xValue = parseInt(strategy.split('_X')[1]);
            } else if (strategy === 'smartDouble') {
              xValue = config.smartDoubleX;
            } else if (strategy === 'antiSmartDouble') {
              xValue = config.antiSmartDoubleX;
            }

            staticFormat.grid[wrKey][rrKey].push({
              strategy_type: strategyName,
              calmar_ratio_pemdd: stats.calmarRatio === Infinity ? '∞' :
                                 stats.calmarRatio === -Infinity ? '-∞' :
                                 isNaN(stats.calmarRatio) ? '0' :
                                 stats.calmarRatio.toFixed(3),
              probability_of_ruin: ruinProb,
              expected_profit: profit,
              max_drawdown: stats.maxDrawdownMean || 0,
              note: note,
              // Add X values for smart double strategies
              x_value: xValue
            });
          });

          staticFormat.grid[wrKey][rrKey].sort((a, b) => {
            const ruinDiff = a.probability_of_ruin - b.probability_of_ruin;
            if (Math.abs(ruinDiff) > 0.001) {
              return ruinDiff;
            }
            
            const calmarA = a.calmar_ratio_pemdd === '∞' ? Infinity :
                           a.calmar_ratio_pemdd === '-∞' ? -Infinity :
                           parseFloat(a.calmar_ratio_pemdd) || 0;
            const calmarB = b.calmar_ratio_pemdd === '∞' ? Infinity :
                           b.calmar_ratio_pemdd === '-∞' ? -Infinity :
                           parseFloat(b.calmar_ratio_pemdd) || 0;
            
            return calmarB - calmarA;
          });
        }
      });
    });

    return staticFormat;
  }, [currentWinRates, currentRiskRatios, config.smartDoubleX, config.antiSmartDoubleX]);

  // Filter grid data
  const filteredGridData = useMemo(() => {
    if (!gridData) return null;

    const filtered = {
      win_rates: gridData.win_rates.filter(wr => wr >= config.minWinRate && wr <= config.maxWinRate),
      risk_ratios: gridData.risk_ratios.filter(rr => rr >= config.minRiskRatio && rr <= config.maxRiskRatio),
      grid: {}
    };

    filtered.win_rates.forEach(wr => {
      const wrKey = wr.toFixed(1);
      if (gridData.grid[wrKey]) {
        filtered.grid[wrKey] = {};
        filtered.risk_ratios.forEach(rr => {
          const rrKey = rr.toFixed(1);
          if (gridData.grid[wrKey][rrKey]) {
            filtered.grid[wrKey][rrKey] = gridData.grid[wrKey][rrKey].filter(strategy => {
              const normalizedStrategyType = convertStrategyNameFromStatic(strategy.strategy_type);
              
              // If All X Variants mode is enabled, show all strategies
              if (config.enableAllXVariants) {
                return true;
              }
              
              // Otherwise, filter based on selected strategies
              return config.selectedStrategies.includes(normalizedStrategyType);
            });
          }
        });
      }
    });

    return filtered;
  }, [gridData, config.minWinRate, config.maxWinRate, config.minRiskRatio, config.maxRiskRatio, config.selectedStrategies, config.enableAllXVariants]);

  // Format strategy name for display
  const formatStrategyName = (name) => {
    if (!name) return '-';
    
    // Handle X variants
    if (name.includes('_X') || name.includes('X')) {
      if (name.startsWith('smartDouble_X') || name.startsWith('smart_double_X')) {
        const xValue = name.match(/X(\d+)/)?.[1] || name.split('_X')[1] || name.split('X')[1];
        return `Smart Double (X=${xValue})`;
      }
      if (name.startsWith('antiSmartDouble_X') || name.startsWith('anti_smart_double_X')) {
        const xValue = name.match(/X(\d+)/)?.[1] || name.split('_X')[1] || name.split('X')[1];
        return `Anti-Smart Double (X=${xValue})`;
      }
    }
    
    // Standard formatting
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
    if (note === "Optimal" || note.includes("Optimal")) return "border-green-500 dark:border-green-400 ring-2 ring-green-500 dark:ring-green-400 bg-green-50 dark:bg-green-900/20";
    if (note === "Good Compromise" || note.includes("Good Compromise")) return "border-yellow-500 dark:border-yellow-400 ring-2 ring-yellow-500 dark:ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
    if (note === "Notable Risk" || note.includes("Notable Risk")) return "border-orange-500 dark:border-orange-400 ring-2 ring-orange-500 dark:ring-orange-400 bg-orange-50 dark:bg-orange-900/20";
    if (note === "Very High Risk" || note.includes("Very High Risk")) return "border-red-500 dark:border-red-400 ring-2 ring-red-500 dark:ring-red-400 bg-red-50 dark:bg-red-900/20";
    return "border-gray-300 dark:border-gray-600";
  };

  // Toggle strategy selection
  const toggleStrategy = useCallback((strategy) => {
    const selectedStrategies = config.selectedStrategies.includes(strategy)
      ? config.selectedStrategies.filter(s => s !== strategy)
      : [...config.selectedStrategies, strategy];
    updateConfig({ selectedStrategies });
  }, [config.selectedStrategies, updateConfig]);

  // Export grid
  const exportGrid = useCallback(() => {
    if (!gridData) return;

    const exportData = {
      ...gridData,
      exportedAt: new Date().toISOString(),
      configuration: config,
      selectedMetric
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced_performance_grid_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [gridData, config, selectedMetric]);

  // Upload to Dynamic Results Grid
  const uploadToStaticGrid = useCallback(async () => {
    if (!gridData) return;

    try {
      const enhancedResults = {
        grid: gridData,
        lastUpdated: new Date().toISOString(),
        source: 'Enhanced Grid',
        timestamp: Date.now(),
        configuration: config
      };
      
      localStorage.setItem('enhanced_grid_results', JSON.stringify(enhancedResults));
      window.dispatchEvent(new CustomEvent('enhancedGridUpdated', { detail: enhancedResults }));
      
      const blob = new Blob([JSON.stringify(gridData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enhanced_grid_backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert('Enhanced Grid data successfully uploaded to Dynamic Results page!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  }, [gridData, config]);

  // Clear cache
  const clearCache = useCallback(() => {
    SimulationDataGenerator.clearCache();
    setGridData(null);
    setLastGeneratedHash(null);
    setCacheStats(SimulationDataGenerator.getCacheStats());
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            🚀 Enhanced Performance Grid
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Robust simulation data with dynamic parameter detection
          </p>
          
          {/* Parameter Change Alert */}
          {hasParametersChanged && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-yellow-800 dark:text-yellow-200 font-semibold">⚠️ Parameters Changed</span>
                <span className="text-yellow-700 dark:text-yellow-300">Data needs regeneration to reflect new settings</span>
                <Button 
                  onClick={generateEnhancedGrid}
                  disabled={isGenerating}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1 text-sm"
                >
                  Regenerate Now
                </Button>
              </div>
            </div>
          )}

          {/* Current Configuration Display */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Current Configuration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-700 dark:text-blue-300">
              <div><strong>Starting Balance:</strong> ${config.initialBalance.toLocaleString()}</div>
              <div><strong>Base Bet:</strong> ${config.baseBet}</div>
              <div><strong>Trades per Simulation:</strong> {config.rounds.toLocaleString()}</div>
              <div><strong>Max Bet:</strong> {config.maxBetPercent}% (cap ${config.maxBetSize.toLocaleString()})</div>
              <div><strong>Smart Double X:</strong> {config.smartDoubleX}</div>
              <div><strong>Anti-Smart Double X:</strong> {config.antiSmartDoubleX}</div>
              <div><strong>Win Rates:</strong> {currentWinRates.map(wr => `${(wr * 100).toFixed(0)}%`).join(', ')}</div>
              <div><strong>Total Simulations:</strong> {(config.enableMegaBatch ? config.megaBatchSize : config.simulationsPerCell) * currentWinRates.length * currentRiskRatios.length * config.selectedStrategies.length}</div>
            </div>
          </div>
        </div>

        {/* Unified Parameter Panel */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold mb-6 dark:text-white">⚙️ Configuration Panel</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generation Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-300">Generation Settings</h4>
              
              <div>
                <label className="block text-sm font-medium mb-1">Simulations per Cell</label>
                <Input
                  type="number"
                  value={config.simulationsPerCell}
                  onChange={(e) => updateConfig({ simulationsPerCell: parseInt(e.target.value) })}
                  min="1000"
                  max="100000"
                  step="1000"
                  disabled={config.enableMegaBatch}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="megaBatch"
                  checked={config.enableMegaBatch}
                  onChange={(e) => updateConfig({ enableMegaBatch: e.target.checked })}
                />
                <label htmlFor="megaBatch" className="text-sm font-medium">Enable Mega Batch ({config.megaBatchSize.toLocaleString()} simulations)</label>
              </div>

              {config.enableMegaBatch && (
                <div>
                  <label className="block text-sm font-medium mb-1">Mega Batch Size</label>
                  <Input
                    type="number"
                    value={config.megaBatchSize}
                    onChange={(e) => updateConfig({ megaBatchSize: parseInt(e.target.value) })}
                    min="10000"
                    max="1000000"
                    step="10000"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allXVariants"
                  checked={config.enableAllXVariants}
                  onChange={(e) => updateConfig({ enableAllXVariants: e.target.checked })}
                />
                <label htmlFor="allXVariants" className="text-sm font-medium">Generate All X Variants (X=1,2,3,4)</label>
              </div>

              {config.enableAllXVariants && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200 mb-1">
                    <strong>📊 All X Variants Mode:</strong>
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Will generate Smart Double and Anti-Smart Double strategies with X values: 1, 2, 3, and 4 consecutive wins/losses.
                    This creates 8 additional strategy variants plus all base strategies for comprehensive comparison.
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    <strong>Total strategies:</strong> Raw, Martingale, Anti-Martingale, Linear, Anti-Linear, Smart Double (X1-4), Anti-Smart Double (X1-4)
                  </p>
                </div>
              )}

              <Button
                onClick={generateEnhancedGrid}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? `Generating... ${progress.toFixed(1)}%` :
                 config.enableAllXVariants ? 'Generate Complete X Variants Grid' : 'Generate Enhanced Grid'}
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

            {/* Simulation Parameters */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-300">Simulation Parameters</h4>
              
              <div>
                <label className="block text-sm font-medium mb-1">Initial Balance ($)</label>
                <Input
                  type="number"
                  value={config.initialBalance}
                  onChange={(e) => updateConfig({ initialBalance: parseInt(e.target.value) })}
                  min="100"
                  max="100000"
                  step="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Base Bet Size ($)</label>
                <Input
                  type="number"
                  value={config.baseBet}
                  onChange={(e) => updateConfig({ baseBet: parseInt(e.target.value) })}
                  min="1"
                  max="1000"
                  step="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Trades per Simulation</label>
                <Input
                  type="number"
                  value={config.rounds}
                  onChange={(e) => updateConfig({ rounds: parseInt(e.target.value) })}
                  min="100"
                  max="10000"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Smart Double X Value</label>
                <Input
                  type="number"
                  value={config.smartDoubleX}
                  onChange={(e) => updateConfig({ smartDoubleX: parseInt(e.target.value) })}
                  min="1"
                  max="10"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">X consecutive losses to trigger doubling</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Anti-Smart Double X Value</label>
                <Input
                  type="number"
                  value={config.antiSmartDoubleX}
                  onChange={(e) => updateConfig({ antiSmartDoubleX: parseInt(e.target.value) })}
                  min="1"
                  max="10"
                  step="1"
                />
                <p className="text-xs text-gray-500 mt-1">X consecutive wins to trigger doubling</p>
              </div>
            </div>

            {/* Filters & Advanced */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-300">Filters & Advanced</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Win Rate</label>
                  <Input
                    type="number"
                    value={config.minWinRate}
                    onChange={(e) => updateConfig({ minWinRate: parseFloat(e.target.value) })}
                    min="0.3"
                    max="0.9"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Win Rate</label>
                  <Input
                    type="number"
                    value={config.maxWinRate}
                    onChange={(e) => updateConfig({ maxWinRate: parseFloat(e.target.value) })}
                    min="0.3"
                    max="0.9"
                    step="0.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Strategies</label>
                <div className="flex gap-2 mb-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateConfig({ selectedStrategies: ['raw', 'martingale', 'antiMartingale', 'linear', 'antiLinear', 'smartDouble', 'antiSmartDouble'] })}
                    className="text-xs px-2 py-1"
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateConfig({ selectedStrategies: [] })}
                    className="text-xs px-2 py-1"
                  >
                    None
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {['raw', 'martingale', 'antiMartingale', 'linear', 'antiLinear', 'smartDouble', 'antiSmartDouble'].map(strategy => (
                    <label key={strategy} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.selectedStrategies.includes(strategy)}
                        onChange={() => toggleStrategy(strategy)}
                        className="mr-1"
                      />
                      {formatStrategyName(strategy)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="advancedRisk"
                  checked={config.enableAdvancedRisk}
                  onChange={(e) => updateConfig({ enableAdvancedRisk: e.target.checked })}
                />
                <label htmlFor="advancedRisk" className="text-sm font-medium">Advanced Risk Management</label>
              </div>

              {config.enableAdvancedRisk && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Stop Loss %</label>
                    <Input
                      type="number"
                      value={config.stopLossPercent}
                      onChange={(e) => updateConfig({ stopLossPercent: parseFloat(e.target.value) })}
                      min="0"
                      max="90"
                      step="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Take Profit %</label>
                    <Input
                      type="number"
                      value={config.takeProfitPercent}
                      onChange={(e) => updateConfig({ takeProfitPercent: parseFloat(e.target.value) })}
                      min="0"
                      max="1000"
                      step="50"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={uploadToStaticGrid}
              disabled={!gridData}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              Upload to Dynamic Results
            </Button>
            <Button onClick={exportGrid} disabled={!gridData} variant="outline">
              Export Grid
            </Button>
            <Button onClick={clearCache} variant="outline">
              Clear Cache
            </Button>
            {cacheStats && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 ml-auto">
                Cache: {cacheStats.cacheSize} grids, {(cacheStats.memoryUsage / 1024).toFixed(1)} KB
              </div>
            )}
          </div>
        </Card>

        {/* Strategy Rules */}
        <Card className="p-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">📋 Strategy Rules with X Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-sm mb-2 text-blue-800 dark:text-blue-200">Raw</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">Always bet base amount</p>
            </div>
            <div className="border rounded-lg p-3 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <h4 className="font-medium text-sm mb-2 text-red-800 dark:text-red-200">Martingale</h4>
              <p className="text-xs text-red-700 dark:text-red-300">Double after every loss</p>
            </div>
            <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <h4 className="font-medium text-sm mb-2 text-green-800 dark:text-green-200">Anti-Martingale</h4>
              <p className="text-xs text-green-700 dark:text-green-300">Double after every win</p>
            </div>
            <div className="border rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-sm mb-2 text-purple-800 dark:text-purple-200">Linear</h4>
              <p className="text-xs text-purple-700 dark:text-purple-300">Add base amount after loss</p>
            </div>
            <div className="border rounded-lg p-3 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
              <h4 className="font-medium text-sm mb-2 text-indigo-800 dark:text-indigo-200">Anti-Linear</h4>
              <p className="text-xs text-indigo-700 dark:text-indigo-300">Add base amount after win</p>
            </div>
            <div className="border rounded-lg p-3 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-sm mb-2 text-orange-800 dark:text-orange-200">Smart Double (X={config.smartDoubleX})</h4>
              <p className="text-xs text-orange-700 dark:text-orange-300">Double after {config.smartDoubleX} consecutive loss{config.smartDoubleX > 1 ? 'es' : ''}</p>
            </div>
            <div className="border rounded-lg p-3 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
              <h4 className="font-medium text-sm mb-2 text-teal-800 dark:text-teal-200">Anti-Smart Double (X={config.antiSmartDoubleX})</h4>
              <p className="text-xs text-teal-700 dark:text-teal-300">Double after {config.antiSmartDoubleX} consecutive win{config.antiSmartDoubleX > 1 ? 's' : ''}</p>
            </div>
          </div>
        </Card>

        {/* Performance Grid Display */}
        {filteredGridData && (
          <Card className="p-4 mb-8">
            <h3 className="text-lg font-semibold mb-4">
              Enhanced Performance Grid Results
            </h3>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              <strong>Metrics:</strong> Expected Profit (Final balance - Initial) | 
              Max Drawdown (Worst balance drop %) | 
              Ruin Probability (% ending at $0) | 
              Calmar Ratio (Profit ÷ Drawdown) |
              <strong> X Values displayed for Smart Double strategies</strong>
            </div>
            
            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-r dark:border-gray-600 whitespace-nowrap">
                      WIN RATE (↓) <br/> RISK RATIO (→)
                    </th>
                    {(filteredGridData.risk_ratios || currentRiskRatios).map(rr => (
                      <th key={rr} className="px-2 py-3.5 text-center text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 border-r dark:border-gray-600">
                        {rr.toFixed(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {(filteredGridData.win_rates || currentWinRates).map(wr => (
                    <tr key={wr} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 ease-in-out">
                      <td className="px-2 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100 border-r dark:border-gray-600 bg-gray-50 dark:bg-gray-800 sticky left-0 z-5">
                        {wr.toFixed(1)}
                      </td>
                      {(filteredGridData.risk_ratios || currentRiskRatios).map(rr => {
                        const wrKey = wr.toFixed(1);
                        const rrKey = rr.toFixed(1);
                        const cellStrategies = filteredGridData.grid?.[wrKey]?.[rrKey] || [];
                        
                        return (
                          <td key={`${wrKey}-${rrKey}`} className="px-1 py-1 whitespace-normal text-xs border-r dark:border-gray-600 align-top">
                            {cellStrategies.length > 0 ? (
                              <div className="space-y-1">
                                {cellStrategies.map((strategy, index) => (
                                  <div key={index} className={`p-1.5 rounded border ${getStrategyClass(strategy.note)} bg-white dark:bg-gray-800 shadow-sm strategy-card h-24 w-full flex flex-col justify-between`}>
                                    <div className="flex-shrink-0">
                                      <strong className="block font-bold text-xs leading-tight mb-0.5 text-gray-900 dark:text-gray-50 truncate">
                                        {formatStrategyName(strategy.strategy_type)}
                                        {strategy.x_value && (
                                          <span className="ml-1 px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xxs font-bold">
                                            X={strategy.x_value}
                                          </span>
                                        )}
                                      </strong>
                                    </div>
                                    <div className="flex-1 text-xxs space-y-0.5">
                                      <span className="block text-gray-700 dark:text-gray-300">
                                        Calmar: {strategy.calmar_ratio_pemdd}
                                      </span>
                                      <span className="block text-gray-600 dark:text-gray-400">
                                        Drawdown: {strategy.max_drawdown ? `${strategy.max_drawdown.toFixed(2)}%` : 'N/A'}
                                      </span>
                                      <span className="block text-gray-700 dark:text-gray-300">
                                        Ruin: {(strategy.probability_of_ruin * 100).toFixed(2)}%
                                      </span>
                                      <span className="block text-gray-700 dark:text-gray-300">
                                        Profit: {strategy.expected_profit}
                                      </span>
                                    </div>
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
