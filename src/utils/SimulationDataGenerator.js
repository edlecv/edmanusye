// Optimized data generation utility for pre-computing simulation grids
class SimulationDataGenerator {
  constructor() {
    this.cache = new Map();
    this.compressionEnabled = true;
  }

  // Generate a comprehensive grid of pre-computed simulation results
  async generateOptimizedGrid(options = {}) {
    const {
      winRates = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], // Default: 7 win rates (30%, 40%, 50%, 60%, 70%, 80%, 90%)
      riskRatios = [0.5, 1.0, 1.5, 2.0, 2.5], // Default: 5 risk ratios (0.5x, 1.0x, 1.5x, 2.0x, 2.5x)
      strategies = ['raw', 'martingale', 'antiMartingale', 'linear', 'antiLinear', 'smartDouble', 'antiSmartDouble'], // Default: 7 strategies per cell
      simulationsPerCell = 5000, // Default: 5,000 simulations per strategy per cell
      rounds = 1000, // Default: 1,000 trades per simulation
      initialBalance = 1000, // Default: Starting balance $1,000
      baseBet = 10, // Default: Base bet $10
      maxBetPercent = 100, // Default: Max bet 100% of current balance
      maxBetSize = 1000, // Default: Cap at $1,000
      minBetSize = 1, // Default: Min bet $1
      stopLossPercent = 0, // Default: Disabled
      takeProfitPercent = 0, // Default: Disabled
      consecutiveLossLimit = 0, // Default: Disabled
      consecutiveWinLimit = 0, // Default: Disabled
      strategyConfig = { smartDoubleX: 1, antiSmartDoubleX: 1 },
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
        baseBet,
        maxBetPercent,
        maxBetSize,
        minBetSize,
        stopLossPercent,
        takeProfitPercent,
        consecutiveLossLimit,
        consecutiveWinLimit
      },
      data: {}
    };

    const totalCells = winRates.length * riskRatios.length * strategies.length;
    let completedCells = 0;

    for (const winRate of winRates) {
      grid.data[winRate] = {};
      
      for (const riskRatio of riskRatios) {
        grid.data[winRate][riskRatio] = {};
        
        // Randomize strategy processing order to prevent systematic alignment
        const shuffledStrategies = [...strategies].sort(() => Math.random() - 0.5);
        
        for (const strategy of shuffledStrategies) {
          try {
            // Parse X variants from strategy name
            let actualStrategyType = strategy;
            let smartDoubleX = strategyConfig.smartDoubleX;
            let antiSmartDoubleX = strategyConfig.antiSmartDoubleX;
            
            // Handle X variant strategies
            if (strategy.startsWith('smartDouble_X')) {
              const xValue = parseInt(strategy.split('_X')[1]);
              actualStrategyType = 'smartDouble';
              smartDoubleX = xValue;
            } else if (strategy.startsWith('antiSmartDouble_X')) {
              const xValue = parseInt(strategy.split('_X')[1]);
              actualStrategyType = 'antiSmartDouble';
              antiSmartDoubleX = xValue;
            }

            const config = {
              winRate,
              riskRatio,
              strategyType: actualStrategyType,
              initialBalance,
              baseBet,
              rounds,
              maxBetPercent,
              maxBetSize,
              minBetSize,
              stopLossPercent,
              takeProfitPercent,
              consecutiveLossLimit,
              consecutiveWinLimit,
              consecutiveLossesForDouble: 1, // Standard settings
              consecutiveWinsForDouble: 1,
              smartDoubleX: smartDoubleX,
              antiSmartDoubleX: antiSmartDoubleX
            };

            // Run optimized simulations with configurable batch size
            const batchSizeToUse = options.batchSize || 1000;
            const results = await this.runOptimizedBatch(config, simulationsPerCell, batchSizeToUse);
            const statistics = this.calculateComprehensiveStats(results);
            
            // Store compressed results with expected profit calculation
            const enhancedStats = {
              ...statistics,
              expectedProfit: statistics.mean - initialBalance
            };
            
            grid.data[winRate][riskRatio][strategy] = this.compressResults(enhancedStats);
            
            completedCells++;
            if (onProgress) {
              onProgress({
                completed: completedCells,
                total: totalCells,
                percentage: (completedCells / totalCells) * 100,
                currentCell: { winRate, riskRatio, strategy }
              });
            }
          } catch (strategyError) {
            console.error(`Error processing strategy ${strategy} for WR:${winRate} RR:${riskRatio}:`, strategyError);
            // Store error result instead of crashing
            grid.data[winRate][riskRatio][strategy] = {
              error: true,
              message: strategyError.message,
              mean: initialBalance,
              expectedProfit: 0,
              ruinPct: 100,
              calmarRatio: 0
            };
            
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
    }

    return grid;
  }


  // Enhanced batch simulation runner with configurable batch sizes and performance optimization
  async runOptimizedBatch(config, numSimulations, batchSize = 1000) {
    return new Promise((resolve, reject) => {
      const results = [];
      let processedCount = 0;
      
      // Use requestIdleCallback for non-blocking execution
      const runBatch = (startIndex) => {
        try {
          const endIndex = Math.min(startIndex + batchSize, numSimulations);
          
          for (let i = startIndex; i < endIndex; i++) {
            // Minimal entropy for performance - just advance random state
            if (i % 100 === 0) {
              Math.random(); // Light entropy every 100th simulation
            }
            
            const result = this.runSingleOptimizedSimulation(config);
            results.push(result);
            processedCount++;
          }
          
          // Force garbage collection hint for large batches (less frequent)
          if (processedCount % (batchSize * 10) === 0 && typeof global !== 'undefined' && global.gc) {
            global.gc();
          }
          
          if (endIndex < numSimulations) {
            // Continue with next batch with a small delay to prevent blocking
            if (typeof requestIdleCallback !== 'undefined') {
              requestIdleCallback(() => runBatch(endIndex), { timeout: 50 });
            } else {
              setTimeout(() => runBatch(endIndex), 1);
            }
          } else {
            resolve(results);
          }
        } catch (error) {
          console.error('Error in batch simulation:', error);
          reject(error);
        }
      };
      
      runBatch(0);
    });
  }

  // Highly optimized single simulation following perfected logic
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
      minBetSize = 1,
      stopLossPercent = 0,
      takeProfitPercent = 0,
      consecutiveLossLimit = 0,
      consecutiveWinLimit = 0,
      consecutiveLossesForDouble,
      consecutiveWinsForDouble,
      smartDoubleX = 1,
      antiSmartDoubleX = 1
    } = config;

    let balance = initialBalance;
    let currentBetValue = baseBet;
    let consecutiveWins = 0;
    let consecutiveLosses = 0;
    let maxDrawdown = 0;
    let peakBalance = initialBalance;
    let wins = 0;
    let totalBetAmount = 0;
    let trades = 0;

    // Calculate stop loss and take profit thresholds
    const stopLossThreshold = stopLossPercent > 0 ? initialBalance * (1 - stopLossPercent / 100) : 0;
    const takeProfitThreshold = takeProfitPercent > 0 ? initialBalance * (1 + takeProfitPercent / 100) : Infinity;

    // Generate fresh random numbers for each simulation to ensure true randomization
    for (let i = 0; i < rounds && balance > 0; i++) {
      trades = i + 1;
      
      // Check stop loss and take profit conditions
      if (stopLossPercent > 0 && balance <= stopLossThreshold) {
        break; // Stop loss triggered
      }
      if (takeProfitPercent > 0 && balance >= takeProfitThreshold) {
        break; // Take profit triggered
      }
      
      // Check consecutive loss/win limits
      if (consecutiveLossLimit > 0 && consecutiveLosses >= consecutiveLossLimit) {
        break; // Consecutive loss limit reached
      }
      if (consecutiveWinLimit > 0 && consecutiveWins >= consecutiveWinLimit) {
        break; // Consecutive win limit reached
      }
      let actualBet = currentBetValue;
      
      // Apply bet size constraints with dynamic parameters
      // Max bet: configurable % of current balance (with configurable cap), Min bet: configurable
      actualBet = Math.max(
        minBetSize, // Ensure minimum bet
        Math.min(
          currentBetValue,
          balance * (maxBetPercent / 100), // Configurable % of current balance
          maxBetSize, // Configurable cap
          balance // Can't bet more than current balance
        )
      );
      
      // If balance is less than minimum bet, stop trading (ruin)
      if (balance < minBetSize) {
        balance = 0;
        break;
      }
      
      totalBetAmount += actualBet;

      // Fast random number generation for each trade
      const randomValue = Math.random();
      const isWin = randomValue < winRate;
      
      if (isWin) {
        balance += actualBet * riskRatio;
        wins++;
        consecutiveWins++;
        consecutiveLosses = 0;
        const updateResult = this.updateBetForWin(strategyType, currentBetValue, baseBet, consecutiveWins, consecutiveWinsForDouble, smartDoubleX, antiSmartDoubleX);
        currentBetValue = updateResult.currentBetValue;
        consecutiveWins = updateResult.consecutiveWinLoss;
      } else {
        balance -= actualBet;
        consecutiveLosses++;
        consecutiveWins = 0;
        const updateResult = this.updateBetForLoss(strategyType, currentBetValue, baseBet, consecutiveLosses, consecutiveLossesForDouble, smartDoubleX, antiSmartDoubleX);
        currentBetValue = updateResult.currentBetValue;
        consecutiveLosses = updateResult.consecutiveWinLoss;
      }
      
      // Proper drawdown tracking - track maximum percentage decline from peak
      if (balance > peakBalance) {
        peakBalance = balance;
      }
      
      // Calculate current drawdown as percentage from peak
      const currentDrawdownPercent = peakBalance > 0 ? ((peakBalance - balance) / peakBalance) * 100 : 0;
      if (currentDrawdownPercent > maxDrawdown) {
        maxDrawdown = currentDrawdownPercent;
      }
    }

    return {
      finalBalance: balance,
      profitLoss: balance - initialBalance,
      roi: ((balance - initialBalance) / initialBalance) * 100,
      maxDrawdownPercent: maxDrawdown, // Already calculated as percentage
      wins,
      totalTrades: trades, // Actual number of trades completed
      actualWinRate: trades > 0 ? wins / trades : 0,
      avgBetSize: trades > 0 ? totalBetAmount / trades : 0,
      ruined: balance <= 0,
      stoppedEarly: trades < rounds, // Whether simulation ended before completing all rounds
      stopReason: trades < rounds ?
        (balance <= 0 ? 'ruin' :
         balance <= stopLossThreshold ? 'stop_loss' :
         balance >= takeProfitThreshold ? 'take_profit' :
         consecutiveLosses >= consecutiveLossLimit ? 'consecutive_loss_limit' :
         consecutiveWins >= consecutiveWinLimit ? 'consecutive_win_limit' : 'unknown') : 'completed'
    };
  }

  // Strategy-specific bet update logic following perfected logic from image
  updateBetForWin(strategyType, currentBetValue, baseBet, consecutiveWins, consecutiveWinsForDouble, smartDoubleX = 1, antiSmartDoubleX = 1) {
    let newBetValue = currentBetValue;
    let newConsecutiveWins = consecutiveWins;
    
    switch (strategyType) {
      case 'raw':
        // Raw: Always bet $10
        newBetValue = baseBet;
        newConsecutiveWins = consecutiveWins; // Keep tracking but don't use
        break;
      case 'martingale':
        // Martingale: Double bet after loss, reset to $10 after win
        newBetValue = baseBet;
        newConsecutiveWins = consecutiveWins; // Keep tracking but don't use
        break;
      case 'antiMartingale':
        // Anti-Martingale: Double bet after win until max, stay at max, reset after loss
        // During winning streaks: double bet until max, then stay at max
        // Use dynamic maxBetSize instead of hardcoded 1000
        newBetValue = currentBetValue * 2; // Double bet after win (will be capped by bet constraints in main loop)
        newConsecutiveWins = consecutiveWins;
        break;
      case 'linear':
        // Linear: Add $10 after loss, reset to $10 after win
        newBetValue = baseBet;
        newConsecutiveWins = consecutiveWins; // Keep tracking but don't use
        break;
      case 'antiLinear':
        // Anti-Linear: Add $10 after win, reset to $10 after loss
        newBetValue = currentBetValue + baseBet; // Add $10 to current bet after win
        newConsecutiveWins = consecutiveWins;
        break;
      case 'smartDouble':
        // Smart Double: Bet = $10 + (consecutive losses × $10), reset to $10 after win
        newBetValue = baseBet;
        newConsecutiveWins = consecutiveWins; // Keep tracking but don't use
        break;
      case 'antiSmartDouble':
        // Anti-Smart Double: Double bet after X consecutive wins (configurable)
        if (consecutiveWins >= antiSmartDoubleX) {
          newBetValue = currentBetValue * 2; // Double bet after X consecutive wins
        } else {
          newBetValue = currentBetValue; // Keep current bet until threshold reached
        }
        newConsecutiveWins = consecutiveWins;
        break;
    }
    return { currentBetValue: newBetValue, consecutiveWinLoss: newConsecutiveWins };
  }

  updateBetForLoss(strategyType, currentBetValue, baseBet, consecutiveLosses, consecutiveLossesForDouble, smartDoubleX = 1, antiSmartDoubleX = 1) {
    let newBetValue = currentBetValue;
    let newConsecutiveLosses = consecutiveLosses;
    
    switch (strategyType) {
      case 'raw':
        // Raw: Always bet $10
        newBetValue = baseBet;
        newConsecutiveLosses = consecutiveLosses; // Keep tracking but don't use
        break;
      case 'martingale':
        // Martingale: Double bet after loss, reset to $10 after win
        newBetValue = currentBetValue * 2; // Double the current bet after loss
        newConsecutiveLosses = consecutiveLosses;
        break;
      case 'antiMartingale':
        // Anti-Martingale: Double bet after win until max, reset to $10 after loss
        // Only resets on loss: bet size resets to base bet when a loss occurs
        newBetValue = baseBet; // Reset to $10 base bet after any loss
        newConsecutiveLosses = consecutiveLosses; // Keep tracking but don't use
        break;
      case 'linear':
        // Linear: Add $10 after loss, reset to $10 after win
        newBetValue = currentBetValue + baseBet; // Add $10 to current bet after loss
        newConsecutiveLosses = consecutiveLosses;
        break;
      case 'antiLinear':
        // Anti-Linear: Add $10 after win, reset to $10 after loss
        newBetValue = baseBet;
        newConsecutiveLosses = consecutiveLosses; // Keep tracking but don't use
        break;
      case 'smartDouble':
        // Smart Double: Double bet after X consecutive losses (configurable)
        if (consecutiveLosses >= smartDoubleX) {
          newBetValue = currentBetValue * 2; // Double bet after X consecutive losses
        } else {
          newBetValue = currentBetValue; // Keep current bet until threshold reached
        }
        newConsecutiveLosses = consecutiveLosses;
        break;
      case 'antiSmartDouble':
        // Anti-Smart Double: Bet = $10 + (consecutive wins × $10), reset to $10 after loss
        newBetValue = baseBet;
        newConsecutiveLosses = consecutiveLosses; // Keep tracking but don't use
        break;
    }
    return { currentBetValue: newBetValue, consecutiveWinLoss: newConsecutiveLosses };
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
      calmarRatio: this.calculateCalmarRatio(meanROI, meanDrawdown),
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

  // Calculate Calmar ratio with proper mathematical definition (no caps)
  calculateCalmarRatio(meanROI, meanDrawdown) {
    // Handle edge cases properly
    if (meanDrawdown === 0 || meanDrawdown < 0.01) {
      // If drawdown is zero or negligible, return infinity for positive ROI
      if (meanROI > 0) return Infinity;
      if (meanROI < 0) return -Infinity;
      return 0;
    }
    
    // Proper Calmar ratio: Annualized Return / Maximum Drawdown
    // Convert meanROI from percentage to decimal to match static grid format
    // meanROI comes in as percentage (e.g., 50.0 for 50%), convert to decimal (0.5)
    const roiDecimal = meanROI / 100;
    // meanDrawdown is already in percentage form, convert to decimal for consistency
    const drawdownDecimal = meanDrawdown / 100;
    
    const ratio = roiDecimal / drawdownDecimal;
    
    // Return the actual ratio without capping
    return ratio;
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