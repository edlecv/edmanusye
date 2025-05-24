// Optimized data generation utility for pre-computing simulation grids
class SimulationDataGenerator {
  constructor() {
    this.cache = new Map();
    this.compressionEnabled = true;
  }

  // Generate a comprehensive grid of pre-computed simulation results
  async generateOptimizedGrid(options = {}) {
    const {
      winRates = [0.45, 0.50, 0.55, 0.60, 0.65, 0.70],
      riskRatios = [1.0, 1.5, 2.0, 2.5, 3.0],
      strategies = ['raw', 'martingale', 'antiMartingale', 'linear', 'antiLinear', 'smartDouble', 'antiSmartDouble'],
      simulationsPerCell = 1000, // Reduced for faster generation
      rounds = 1000,
      initialBalance = 10000,
      baseBet = 100,
      onProgress = null
    } = options;

    const grid = {
      metadata: {
        generated: new Date().toISOString(),
        winRates,
        riskRatios,
        strategies,
        simulationsPerCell,
        rounds,
        initialBalance,
        baseBet
      },
      data: {}
    };

    const totalCells = winRates.length * riskRatios.length * strategies.length;
    let completedCells = 0;

    for (const winRate of winRates) {
      grid.data[winRate] = {};
      
      for (const riskRatio of riskRatios) {
        grid.data[winRate][riskRatio] = {};
        
        for (const strategy of strategies) {
          const config = {
            winRate,
            riskRatio,
            strategyType: strategy,
            initialBalance,
            baseBet,
            rounds,
            maxBetPercent: 10,
            maxBetSize: 1000,
            consecutiveLossesForDouble: 3,
            consecutiveWinsForDouble: 3
          };

          // Run optimized simulations
          const results = await this.runOptimizedBatch(config, simulationsPerCell);
          const statistics = this.calculateComprehensiveStats(results);
          
          // Store compressed results
          grid.data[winRate][riskRatio][strategy] = this.compressResults(statistics);
          
          completedCells++;
          if (onProgress) {
            onProgress({
              completed: completedCells,
              total: totalCells,
              percentage: (completedCells / totalCells) * 100,
              currentCell: { winRate, riskRatio, strategy }
            });
          }
        }
      }
    }

    return grid;
  }

  // Optimized batch simulation runner
  async runOptimizedBatch(config, numSimulations) {
    return new Promise((resolve) => {
      const results = [];
      
      // Use requestIdleCallback for non-blocking execution
      const runBatch = (startIndex, batchSize = 100) => {
        const endIndex = Math.min(startIndex + batchSize, numSimulations);
        
        for (let i = startIndex; i < endIndex; i++) {
          const result = this.runSingleOptimizedSimulation(config);
          results.push(result);
        }
        
        if (endIndex < numSimulations) {
          // Continue with next batch
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => runBatch(endIndex, batchSize));
          } else {
            setTimeout(() => runBatch(endIndex, batchSize), 0);
          }
        } else {
          resolve(results);
        }
      };
      
      runBatch(0);
    });
  }

  // Highly optimized single simulation
  runSingleOptimizedSimulation(config) {
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
    let totalBetAmount = 0;

    // Pre-generate random numbers for better performance
    const randomNumbers = new Float32Array(rounds);
    for (let i = 0; i < rounds; i++) {
      randomNumbers[i] = Math.random();
    }

    for (let i = 0; i < rounds && balance > 0; i++) {
      let actualBet = currentBetValue;
      
      if (strategyType !== 'raw') {
        actualBet = Math.min(
          currentBetValue,
          balance * (maxBetPercent / 100),
          maxBetSize,
          balance
        );
      }
      
      if (actualBet <= 0) actualBet = 1;
      totalBetAmount += actualBet;

      const isWin = randomNumbers[i] < winRate;
      
      if (isWin) {
        balance += actualBet * riskRatio;
        wins++;
        this.updateBetForWin(strategyType, currentBetValue, baseBet, consecutiveWinLoss, consecutiveWinsForDouble);
      } else {
        balance -= actualBet;
        this.updateBetForLoss(strategyType, currentBetValue, baseBet, consecutiveWinLoss, consecutiveLossesForDouble);
      }
      
      // Efficient drawdown tracking
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
      profitLoss: balance - initialBalance,
      roi: ((balance - initialBalance) / initialBalance) * 100,
      maxDrawdown,
      maxDrawdownPercent: peakBalance > 0 ? (maxDrawdown / peakBalance) * 100 : 0,
      wins,
      totalTrades: wins + (rounds - wins),
      actualWinRate: wins / rounds,
      avgBetSize: totalBetAmount / rounds,
      ruined: balance <= 0
    };
  }

  // Strategy-specific bet update logic (optimized)
  updateBetForWin(strategyType, currentBetValue, baseBet, consecutiveWinLoss, consecutiveWinsForDouble) {
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
    return { currentBetValue, consecutiveWinLoss };
  }

  updateBetForLoss(strategyType, currentBetValue, baseBet, consecutiveWinLoss, consecutiveLossesForDouble) {
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
    return { currentBetValue, consecutiveWinLoss };
  }

  // Calculate comprehensive statistics
  calculateComprehensiveStats(results) {
    const finalBalances = results.map(r => r.finalBalance);
    const rois = results.map(r => r.roi);
    const maxDrawdowns = results.map(r => r.maxDrawdownPercent);
    const profitLosses = results.map(r => r.profitLoss);
    
    const sortedBalances = [...finalBalances].sort((a, b) => a - b);
    const sortedROIs = [...rois].sort((a, b) => a - b);
    const sortedDrawdowns = [...maxDrawdowns].sort((a, b) => a - b);
    
    const profitable = results.filter(r => r.profitLoss > 0).length;
    const ruined = results.filter(r => r.ruined).length;
    
    const mean = this.calculateMean(finalBalances);
    const meanROI = this.calculateMean(rois);
    const stdDev = this.calculateStdDev(rois, meanROI);
    const meanDrawdown = this.calculateMean(maxDrawdowns);
    
    return {
      // Core metrics
      mean,
      median: this.getPercentile(sortedBalances, 50),
      meanROI,
      medianROI: this.getPercentile(sortedROIs, 50),
      
      // Risk metrics
      maxDrawdownMean: meanDrawdown,
      maxDrawdownMedian: this.getPercentile(sortedDrawdowns, 50),
      volatility: stdDev,
      
      // Percentiles
      percentile5: this.getPercentile(sortedBalances, 5),
      percentile25: this.getPercentile(sortedBalances, 25),
      percentile75: this.getPercentile(sortedBalances, 75),
      percentile95: this.getPercentile(sortedBalances, 95),
      
      // Performance ratios
      sharpeRatio: stdDev === 0 ? 0 : meanROI / stdDev,
      calmarRatio: meanDrawdown === 0 ? 0 : meanROI / meanDrawdown,
      sortinoRatio: this.calculateSortinoRatio(rois),
      
      // Probability metrics
      profitablePct: (profitable / results.length) * 100,
      ruinPct: (ruined / results.length) * 100,
      
      // Additional metrics
      maxProfit: Math.max(...profitLosses),
      maxLoss: Math.min(...profitLosses),
      winRate: this.calculateMean(results.map(r => r.actualWinRate)),
      avgBetSize: this.calculateMean(results.map(r => r.avgBetSize))
    };
  }

  // Utility functions
  calculateMean(array) {
    return array.reduce((sum, val) => sum + val, 0) / array.length;
  }

  calculateStdDev(array, mean) {
    const variance = array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length;
    return Math.sqrt(variance);
  }

  getPercentile(sortedArray, percentile) {
    const index = Math.floor((percentile / 100) * sortedArray.length);
    return sortedArray[Math.min(index, sortedArray.length - 1)];
  }

  calculateSortinoRatio(returns) {
    const mean = this.calculateMean(returns);
    const negativeReturns = returns.filter(r => r < 0);
    if (negativeReturns.length === 0) return mean > 0 ? Infinity : 0;
    
    const downwardDeviation = Math.sqrt(
      negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length
    );
    
    return downwardDeviation === 0 ? 0 : mean / downwardDeviation;
  }

  // Compress results for storage efficiency
  compressResults(stats) {
    if (!this.compressionEnabled) return stats;
    
    // Round numbers to reduce precision and save space
    const compressed = {};
    for (const [key, value] of Object.entries(stats)) {
      if (typeof value === 'number') {
        compressed[key] = Math.round(value * 1000) / 1000; // 3 decimal places
      } else {
        compressed[key] = value;
      }
    }
    
    return compressed;
  }

  // Save grid to localStorage with compression
  saveGridToCache(gridName, grid) {
    try {
      const compressed = JSON.stringify(grid);
      localStorage.setItem(`simulation_grid_${gridName}`, compressed);
      this.cache.set(gridName, grid);
      return true;
    } catch (error) {
      console.error('Failed to save grid to cache:', error);
      return false;
    }
  }

  // Load grid from localStorage
  loadGridFromCache(gridName) {
    try {
      if (this.cache.has(gridName)) {
        return this.cache.get(gridName);
      }
      
      const cached = localStorage.getItem(`simulation_grid_${gridName}`);
      if (cached) {
        const grid = JSON.parse(cached);
        this.cache.set(gridName, grid);
        return grid;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load grid from cache:', error);
      return null;
    }
  }

  // Generate quick lookup table for common scenarios
  generateQuickLookupTable() {
    const commonScenarios = [
      { winRate: 0.55, riskRatio: 1.5, name: 'Conservative' },
      { winRate: 0.60, riskRatio: 2.0, name: 'Balanced' },
      { winRate: 0.65, riskRatio: 2.5, name: 'Aggressive' },
      { winRate: 0.50, riskRatio: 1.0, name: 'Breakeven' },
      { winRate: 0.70, riskRatio: 3.0, name: 'High Risk' }
    ];

    const lookupTable = {};
    
    for (const scenario of commonScenarios) {
      lookupTable[scenario.name] = {
        config: scenario,
        expectedValue: scenario.winRate * scenario.riskRatio - (1 - scenario.winRate),
        kellyFraction: (scenario.winRate * scenario.riskRatio - (1 - scenario.winRate)) / scenario.riskRatio,
        riskLevel: this.assessRiskLevel(scenario.winRate, scenario.riskRatio)
      };
    }
    
    return lookupTable;
  }

  assessRiskLevel(winRate, riskRatio) {
    const expectedValue = winRate * riskRatio - (1 - winRate);
    const kelly = expectedValue / riskRatio;
    
    if (expectedValue <= 0) return 'Very High Risk';
    if (kelly < 0.05) return 'High Risk';
    if (kelly < 0.15) return 'Medium Risk';
    if (kelly < 0.25) return 'Low Risk';
    return 'Very Low Risk';
  }

  // Clear cache to free memory
  clearCache() {
    this.cache.clear();
    // Clear localStorage simulation grids
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('simulation_grid_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      memoryUsage: JSON.stringify([...this.cache.values()]).length,
      localStorageKeys: Object.keys(localStorage).filter(key => key.startsWith('simulation_grid_')).length
    };
  }
}

// Export singleton instance
export default new SimulationDataGenerator();