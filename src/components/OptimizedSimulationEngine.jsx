import React, { useState, useCallback, useMemo } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

// Web Worker for running simulations in background
const createSimulationWorker = () => {
  const workerCode = `
    // Optimized simulation functions for Web Worker
    const runOptimizedSimulation = (config) => {
      const {
        winRate,
        riskRatio,
        initialBalance,
        baseBet,
        rounds,
        strategyType,
        maxBetPercent,
        maxBetSize,
        consecutiveLossesForDouble,
        consecutiveWinsForDouble
      } = config;

      let balance = initialBalance;
      let currentBetValue = baseBet;
      let consecutiveWinLoss = 0;
      let maxDrawdown = 0;
      let peakBalance = initialBalance;
      let wins = 0;
      let losses = 0;
      
      // Pre-generate random numbers for better performance
      const randomNumbers = new Float32Array(rounds);
      for (let i = 0; i < rounds; i++) {
        randomNumbers[i] = Math.random();
      }

      for (let i = 0; i < rounds; i++) {
        if (balance <= 0) break;
        
        let actualBet = currentBetValue;
        if (strategyType !== 'raw') {
          actualBet = Math.min(
            currentBetValue, 
            balance * (maxBetPercent / 100), 
            maxBetSize
          );
          if (balance < actualBet) actualBet = balance;
        }
        if (actualBet <= 0) actualBet = 1;

        const isWin = randomNumbers[i] < winRate;
        
        if (isWin) {
          balance += actualBet * riskRatio;
          wins++;
          
          // Strategy logic for wins
          switch (strategyType) {
            case 'martingale':
            case 'linear':
            case 'smartDouble':
              consecutiveWinLoss = 0;
              currentBetValue = baseBet;
              break;
            case 'antiMartingale':
              currentBetValue *= 2;
              break;
            case 'antiLinear':
              currentBetValue += baseBet;
              break;
            case 'antiSmartDouble':
              consecutiveWinLoss++;
              currentBetValue = consecutiveWinLoss >= consecutiveWinsForDouble ? baseBet * 2 : baseBet;
              break;
          }
        } else {
          balance -= actualBet;
          losses++;
          
          // Strategy logic for losses
          switch (strategyType) {
            case 'antiMartingale':
            case 'antiLinear':
            case 'antiSmartDouble':
              consecutiveWinLoss = 0;
              currentBetValue = baseBet;
              break;
            case 'martingale':
              currentBetValue *= 2;
              break;
            case 'linear':
              currentBetValue += baseBet;
              break;
            case 'smartDouble':
              consecutiveWinLoss++;
              currentBetValue = consecutiveWinLoss >= consecutiveLossesForDouble ? baseBet * 2 : baseBet;
              break;
          }
        }
        
        // Track drawdown efficiently
        if (balance > peakBalance) {
          peakBalance = balance;
        } else {
          const drawdown = peakBalance - balance;
          if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
          }
        }
      }
      
      return {
        finalBalance: balance,
        maxDrawdown,
        wins,
        losses,
        profitLoss: balance - initialBalance,
        roi: ((balance - initialBalance) / initialBalance) * 100,
        winRate: wins / (wins + losses),
        maxDrawdownPercent: (maxDrawdown / peakBalance) * 100
      };
    };

    const runMonteCarloSimulations = (config, numSimulations) => {
      const results = [];
      const startTime = performance.now();
      
      for (let i = 0; i < numSimulations; i++) {
        const result = runOptimizedSimulation(config);
        results.push(result);
        
        // Send progress updates every 500 simulations
        if (i % 500 === 0) {
          self.postMessage({
            type: 'progress',
            completed: i,
            total: numSimulations,
            elapsed: performance.now() - startTime
          });
        }
      }
      
      return results;
    };

    const calculateStatistics = (results) => {
      const finalBalances = results.map(r => r.finalBalance);
      const profitLosses = results.map(r => r.profitLoss);
      const rois = results.map(r => r.roi);
      const maxDrawdowns = results.map(r => r.maxDrawdownPercent);
      
      const sortedBalances = [...finalBalances].sort((a, b) => a - b);
      const sortedROIs = [...rois].sort((a, b) => a - b);
      
      const profitable = results.filter(r => r.profitLoss > 0).length;
      const ruined = results.filter(r => r.finalBalance <= 0).length;
      
      return {
        mean: finalBalances.reduce((a, b) => a + b, 0) / finalBalances.length,
        median: sortedBalances[Math.floor(sortedBalances.length / 2)],
        percentile5: sortedBalances[Math.floor(sortedBalances.length * 0.05)],
        percentile95: sortedBalances[Math.floor(sortedBalances.length * 0.95)],
        meanROI: rois.reduce((a, b) => a + b, 0) / rois.length,
        medianROI: sortedROIs[Math.floor(sortedROIs.length / 2)],
        profitablePct: (profitable / results.length) * 100,
        ruinPct: (ruined / results.length) * 100,
        maxDrawdownMean: maxDrawdowns.reduce((a, b) => a + b, 0) / maxDrawdowns.length,
        sharpeRatio: calculateSharpeRatio(rois),
        calmarRatio: calculateCalmarRatio(rois, maxDrawdowns)
      };
    };

    const calculateSharpeRatio = (returns) => {
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      return stdDev === 0 ? 0 : mean / stdDev;
    };

    const calculateCalmarRatio = (returns, drawdowns) => {
      const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const maxDrawdown = Math.max(...drawdowns);
      return maxDrawdown === 0 ? 0 : meanReturn / maxDrawdown;
    };

    self.onmessage = function(e) {
      const { config, numSimulations, batchId } = e.data;
      
      try {
        const results = runMonteCarloSimulations(config, numSimulations);
        const statistics = calculateStatistics(results);
        
        self.postMessage({
          type: 'complete',
          batchId,
          results,
          statistics,
          config
        });
      } catch (error) {
        self.postMessage({
          type: 'error',
          batchId,
          error: error.message
        });
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

const OptimizedSimulationEngine = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [batchConfigs, setBatchConfigs] = useState([
    {
      id: 1,
      name: "Conservative Strategy",
      winRate: 0.55,
      riskRatio: 1.5,
      initialBalance: 10000,
      baseBet: 100,
      rounds: 1000,
      strategyType: 'raw',
      maxBetPercent: 5,
      maxBetSize: 500,
      consecutiveLossesForDouble: 3,
      consecutiveWinsForDouble: 3,
      numSimulations: 5000
    },
    {
      id: 2,
      name: "Aggressive Strategy",
      winRate: 0.60,
      riskRatio: 2.0,
      initialBalance: 10000,
      baseBet: 200,
      rounds: 1000,
      strategyType: 'martingale',
      maxBetPercent: 10,
      maxBetSize: 1000,
      consecutiveLossesForDouble: 2,
      consecutiveWinsForDouble: 2,
      numSimulations: 5000
    }
  ]);

  // Memoized worker creation to prevent recreation on re-renders
  const worker = useMemo(() => createSimulationWorker(), []);

  const addBatchConfig = useCallback(() => {
    const newConfig = {
      id: Date.now(),
      name: `Strategy ${batchConfigs.length + 1}`,
      winRate: 0.55,
      riskRatio: 1.5,
      initialBalance: 10000,
      baseBet: 100,
      rounds: 1000,
      strategyType: 'raw',
      maxBetPercent: 5,
      maxBetSize: 500,
      consecutiveLossesForDouble: 3,
      consecutiveWinsForDouble: 3,
      numSimulations: 5000
    };
    setBatchConfigs(prev => [...prev, newConfig]);
  }, [batchConfigs.length]);

  const updateBatchConfig = useCallback((id, field, value) => {
    setBatchConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ));
  }, []);

  const removeBatchConfig = useCallback((id) => {
    setBatchConfigs(prev => prev.filter(config => config.id !== id));
  }, []);

  const runBatchSimulations = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    
    const totalBatches = batchConfigs.length;
    let completedBatches = 0;
    const batchResults = [];

    // Set up worker message handler
    worker.onmessage = (e) => {
      const { type, batchId, results: simResults, statistics, config, completed, total, error } = e.data;
      
      if (type === 'progress') {
        const batchProgress = (completed / total) * 100;
        const overallProgress = ((completedBatches / totalBatches) * 100) + (batchProgress / totalBatches);
        setProgress(overallProgress);
      } else if (type === 'complete') {
        completedBatches++;
        batchResults.push({
          config,
          statistics,
          rawResults: simResults.slice(0, 100) // Store only first 100 for memory efficiency
        });
        
        setProgress((completedBatches / totalBatches) * 100);
        
        if (completedBatches === totalBatches) {
          setResults(batchResults);
          setIsRunning(false);
        } else {
          // Start next batch
          const nextConfig = batchConfigs[completedBatches];
          worker.postMessage({
            config: nextConfig,
            numSimulations: nextConfig.numSimulations,
            batchId: nextConfig.id
          });
        }
      } else if (type === 'error') {
        console.error('Simulation error:', error);
        setIsRunning(false);
      }
    };

    // Start first batch
    if (batchConfigs.length > 0) {
      worker.postMessage({
        config: batchConfigs[0],
        numSimulations: batchConfigs[0].numSimulations,
        batchId: batchConfigs[0].id
      });
    }
  }, [isRunning, batchConfigs, worker]);

  const exportResults = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      results: results.map(r => ({
        config: r.config,
        statistics: r.statistics
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation_results_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  const formatNumber = (num, decimals = 2) => {
    return num?.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }) || '0';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            🚀 Optimized Monte Carlo Simulation Engine
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Run multiple batches of 5000+ simulations efficiently with minimal resource usage
          </p>
        </div>

        {/* Batch Configuration */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold dark:text-white">Batch Configurations</h3>
            <Button onClick={addBatchConfig} className="bg-green-600 hover:bg-green-700">
              Add Configuration
            </Button>
          </div>

          <div className="space-y-4">
            {batchConfigs.map((config) => (
              <Card key={config.id} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Input
                    value={config.name}
                    onChange={(e) => updateBatchConfig(config.id, 'name', e.target.value)}
                    className="font-semibold text-lg max-w-xs"
                  />
                  <Button
                    onClick={() => removeBatchConfig(config.id)}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Win Rate</label>
                    <Input
                      type="number"
                      value={config.winRate}
                      onChange={(e) => updateBatchConfig(config.id, 'winRate', parseFloat(e.target.value))}
                      min="0.1"
                      max="0.9"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Risk Ratio</label>
                    <Input
                      type="number"
                      value={config.riskRatio}
                      onChange={(e) => updateBatchConfig(config.id, 'riskRatio', parseFloat(e.target.value))}
                      min="0.5"
                      max="5"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Initial Balance</label>
                    <Input
                      type="number"
                      value={config.initialBalance}
                      onChange={(e) => updateBatchConfig(config.id, 'initialBalance', parseInt(e.target.value))}
                      min="1000"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Bet</label>
                    <Input
                      type="number"
                      value={config.baseBet}
                      onChange={(e) => updateBatchConfig(config.id, 'baseBet', parseInt(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rounds</label>
                    <Input
                      type="number"
                      value={config.rounds}
                      onChange={(e) => updateBatchConfig(config.id, 'rounds', parseInt(e.target.value))}
                      min="100"
                      max="10000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Simulations</label>
                    <Input
                      type="number"
                      value={config.numSimulations}
                      onChange={(e) => updateBatchConfig(config.id, 'numSimulations', parseInt(e.target.value))}
                      min="1000"
                      max="50000"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Strategy</label>
                    <select
                      value={config.strategyType}
                      onChange={(e) => updateBatchConfig(config.id, 'strategyType', e.target.value)}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="raw">Raw</option>
                      <option value="martingale">Martingale</option>
                      <option value="antiMartingale">Anti-Martingale</option>
                      <option value="linear">Linear</option>
                      <option value="antiLinear">Anti-Linear</option>
                      <option value="smartDouble">Smart Double</option>
                      <option value="antiSmartDouble">Anti-Smart Double</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Bet %</label>
                    <Input
                      type="number"
                      value={config.maxBetPercent}
                      onChange={(e) => updateBatchConfig(config.id, 'maxBetPercent', parseInt(e.target.value))}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Control Panel */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Button
              onClick={runBatchSimulations}
              disabled={isRunning || batchConfigs.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunning ? 'Running...' : 'Run All Simulations'}
            </Button>
            {results.length > 0 && (
              <Button onClick={exportResults} variant="outline">
                Export Results
              </Button>
            )}
          </div>
          
          {isRunning && (
            <div className="flex items-center gap-4">
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium">{formatNumber(progress, 1)}%</span>
            </div>
          )}
        </div>

        {/* Results Display */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold dark:text-white">Simulation Results</h3>
            
            <div className="grid gap-6">
              {results.map((result, index) => (
                <Card key={index} className="p-6">
                  <h4 className="text-xl font-semibold mb-4">{result.config.name}</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Mean Final Balance</div>
                      <div className="text-lg font-bold text-green-600">${formatNumber(result.statistics.mean)}</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Mean ROI</div>
                      <div className="text-lg font-bold text-blue-600">{formatNumber(result.statistics.meanROI)}%</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Profitable %</div>
                      <div className="text-lg font-bold text-purple-600">{formatNumber(result.statistics.profitablePct)}%</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Ruin %</div>
                      <div className="text-lg font-bold text-red-600">{formatNumber(result.statistics.ruinPct)}%</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</div>
                      <div className="text-lg font-bold text-yellow-600">{formatNumber(result.statistics.sharpeRatio, 3)}</div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Calmar Ratio</div>
                      <div className="text-lg font-bold text-indigo-600">{formatNumber(result.statistics.calmarRatio, 3)}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">5th Percentile: </span>
                      <span className="font-medium">${formatNumber(result.statistics.percentile5)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Median: </span>
                      <span className="font-medium">${formatNumber(result.statistics.median)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">95th Percentile: </span>
                      <span className="font-medium">${formatNumber(result.statistics.percentile95)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Avg Max Drawdown: </span>
                      <span className="font-medium">{formatNumber(result.statistics.maxDrawdownMean)}%</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedSimulationEngine;