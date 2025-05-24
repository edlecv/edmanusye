import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import allStrategiesData from '../data/all_strategies_grid.json';
import optimalStrategiesData from '../data/optimal_strategies_grid.json';

const EnhancedStrategyCalculator = () => {
  const [config, setConfig] = useState({
    currentWinRate: 0.55,
    currentRiskRatio: 1.5,
    currentStrategy: 'raw',
    portfolioSize: 10000,
    riskTolerance: 0.05, // 5% max risk per trade
    
    // Enhancement factors
    marketVolatility: 0.2, // 20% current market volatility
    correlationFactor: 0.3, // 30% correlation with market
    momentumScore: 0.1, // 10% positive momentum
    liquidityScore: 0.9, // 90% liquidity score
    
    // Advanced parameters
    confidenceInterval: 0.85,
    adaptationRate: 0.1,
    maxDrawdownTolerance: 0.15,
    timeHorizon: 252 // trading days
  });

  const [enhancedResults, setEnhancedResults] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [optimalPath, setOptimalPath] = useState([]);

  // Enhanced Kelly Formula with Market Factors
  const calculateEnhancedKelly = (winRate, riskRatio, marketFactors) => {
    const { volatility, correlation, momentum, liquidity, confidence } = marketFactors;
    
    // Adjust win rate based on market conditions
    const volatilityAdjustment = 1 - (volatility * 0.5); // Reduce in high volatility
    const momentumBonus = 1 + (momentum * 0.3); // Increase with positive momentum
    const adjustedWinRate = Math.min(0.95, Math.max(0.05, winRate * volatilityAdjustment * momentumBonus));
    
    // Adjust risk ratio based on liquidity and correlation
    const liquidityAdjustment = liquidity;
    const correlationPenalty = 1 - (correlation * 0.2); // Reduce for high correlation
    const adjustedRiskRatio = riskRatio * liquidityAdjustment * correlationPenalty;
    
    // Enhanced Kelly calculation
    const basicKelly = (adjustedWinRate * adjustedRiskRatio - (1 - adjustedWinRate)) / adjustedRiskRatio;
    const confidenceAdjustedKelly = basicKelly * confidence;
    
    return {
      basicKelly: Math.max(0, basicKelly),
      enhancedKelly: Math.max(0, confidenceAdjustedKelly),
      adjustedWinRate,
      adjustedRiskRatio,
      expectedValue: adjustedWinRate * adjustedRiskRatio - (1 - adjustedWinRate)
    };
  };

  // Probabilistic Edge Enhancement Formula
  const calculateProbabilisticEdge = () => {
    const { 
      currentWinRate, 
      currentRiskRatio, 
      marketVolatility, 
      correlationFactor, 
      momentumScore, 
      liquidityScore,
      confidenceInterval,
      riskTolerance,
      maxDrawdownTolerance
    } = config;

    const marketFactors = {
      volatility: marketVolatility,
      correlation: correlationFactor,
      momentum: momentumScore,
      liquidity: liquidityScore,
      confidence: confidenceInterval
    };

    const kellyResults = calculateEnhancedKelly(currentWinRate, currentRiskRatio, marketFactors);
    
    // Position sizing with multiple constraints
    const kellyPositionSize = kellyResults.enhancedKelly;
    const riskBasedPositionSize = riskTolerance / (1 - currentWinRate); // Risk parity approach
    const volatilityAdjustedSize = kellyPositionSize * (1 - marketVolatility);
    
    // Final position size (most conservative)
    const finalPositionSize = Math.min(
      kellyPositionSize,
      riskBasedPositionSize,
      volatilityAdjustedSize,
      0.1 // Hard cap at 10%
    );

    // Expected returns calculation
    const expectedReturn = kellyResults.expectedValue * finalPositionSize;
    const annualizedReturn = expectedReturn * config.timeHorizon;
    
    // Risk metrics
    const maxPossibleLoss = finalPositionSize;
    const probabilityOfRuin = calculateRuinProbability(kellyResults.adjustedWinRate, kellyResults.adjustedRiskRatio, finalPositionSize);
    
    // Sharpe-like ratio
    const returnVolatilityRatio = expectedReturn / Math.max(0.01, marketVolatility);
    
    // Enhancement score (0-100)
    const enhancementScore = Math.min(100, Math.max(0, 
      (kellyResults.expectedValue * 100) + 
      (momentumScore * 20) + 
      (liquidityScore * 10) - 
      (correlationFactor * 15) - 
      (marketVolatility * 25)
    ));

    return {
      ...kellyResults,
      finalPositionSize,
      expectedReturn,
      annualizedReturn,
      maxPossibleLoss,
      probabilityOfRuin,
      returnVolatilityRatio,
      enhancementScore,
      riskAdjustedReturn: expectedReturn / Math.max(0.01, maxPossibleLoss)
    };
  };

  // Calculate probability of ruin using simplified formula
  const calculateRuinProbability = (winRate, riskRatio, positionSize) => {
    if (winRate * riskRatio <= (1 - winRate)) return 1.0; // Negative expectancy
    
    const edge = winRate * riskRatio - (1 - winRate);
    const variance = winRate * Math.pow(riskRatio, 2) + (1 - winRate) * 1;
    const ruinProbability = Math.exp(-2 * edge * (1 / positionSize) / variance);
    
    return Math.min(1.0, Math.max(0.0, ruinProbability));
  };

  // Find optimal strategy from existing data
  const findOptimalStrategy = () => {
    const winRateKey = findClosestKey(config.currentWinRate, allStrategiesData.win_rates);
    const riskRatioKey = findClosestKey(config.currentRiskRatio, allStrategiesData.risk_ratios);
    
    if (allStrategiesData.grid[winRateKey] && allStrategiesData.grid[winRateKey][riskRatioKey]) {
      const strategies = allStrategiesData.grid[winRateKey][riskRatioKey];
      
      // Sort by Calmar ratio (return/max drawdown)
      const sortedStrategies = strategies.sort((a, b) => b.calmar_ratio_pemdd - a.calmar_ratio_pemdd);
      
      return sortedStrategies.map(strategy => ({
        ...strategy,
        enhancedScore: calculateStrategyEnhancement(strategy)
      }));
    }
    
    return [];
  };

  const findClosestKey = (value, array) => {
    return array.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    ).toString();
  };

  const calculateStrategyEnhancement = (strategy) => {
    const baseScore = strategy.calmar_ratio_pemdd;
    const ruinPenalty = strategy.probability_of_ruin * 50;
    const profitBonus = Math.max(0, strategy.expected_profit / 1000);
    
    return baseScore + profitBonus - ruinPenalty;
  };

  // Generate comparison data
  const generateComparisonData = () => {
    const strategies = findOptimalStrategy();
    const enhanced = calculateProbabilisticEdge();
    
    const comparison = strategies.slice(0, 5).map(strategy => ({
      name: strategy.strategy_type,
      originalReturn: strategy.expected_profit,
      originalRisk: strategy.probability_of_ruin * 100,
      calmarRatio: strategy.calmar_ratio_pemdd,
      enhancedReturn: strategy.expected_profit * (1 + enhanced.enhancementScore / 100),
      enhancedRisk: Math.max(0.1, strategy.probability_of_ruin * (1 - enhanced.enhancementScore / 200)) * 100
    }));

    setComparisonData(comparison);
  };

  // Generate optimal path visualization
  const generateOptimalPath = () => {
    const path = [];
    const winRates = [0.45, 0.50, 0.55, 0.60, 0.65, 0.70];
    const riskRatios = [1.0, 1.5, 2.0, 2.5];
    
    winRates.forEach(wr => {
      riskRatios.forEach(rr => {
        const tempConfig = { ...config, currentWinRate: wr, currentRiskRatio: rr };
        const marketFactors = {
          volatility: config.marketVolatility,
          correlation: config.correlationFactor,
          momentum: config.momentumScore,
          liquidity: config.liquidityScore,
          confidence: config.confidenceInterval
        };
        
        const kelly = calculateEnhancedKelly(wr, rr, marketFactors);
        
        path.push({
          winRate: wr,
          riskRatio: rr,
          expectedValue: kelly.expectedValue,
          positionSize: kelly.enhancedKelly,
          score: kelly.expectedValue * kelly.enhancedKelly * 100
        });
      });
    });
    
    setOptimalPath(path);
  };

  useEffect(() => {
    const results = calculateProbabilisticEdge();
    setEnhancedResults(results);
    generateComparisonData();
    generateOptimalPath();
  }, [config]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const formatPercentage = (value) => `${(value * 100).toFixed(2)}%`;
  const formatNumber = (value, decimals = 2) => value.toFixed(decimals);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">
            🧠 Smart Strategy Calculator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Enhance your existing trading strategies with intelligent optimization
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            This calculator analyzes your current strategy and provides optimized parameters using real market data and proven mathematical models
          </p>
        </div>

        {/* Input Configuration */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 dark:text-white">📊 Your Current Strategy</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Enter your current trading strategy parameters to see how they can be enhanced
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Current Win Rate
            </label>
            <Input
              type="number"
              name="currentWinRate"
              value={config.currentWinRate}
              onChange={handleInputChange}
              min="0.1"
              max="0.9"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              💰 Risk-Reward Ratio
            </label>
            <Input
              type="number"
              name="currentRiskRatio"
              value={config.currentRiskRatio}
              onChange={handleInputChange}
              min="0.5"
              max="5.0"
              step="0.1"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              💼 Portfolio Size ($)
            </label>
            <Input
              type="number"
              name="portfolioSize"
              value={config.portfolioSize}
              onChange={handleInputChange}
              min="1000"
              step="1000"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              📊 Current Market Volatility
            </label>
            <Input
              type="number"
              name="marketVolatility"
              value={config.marketVolatility}
              onChange={handleInputChange}
              min="0.05"
              max="0.8"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              🚀 Market Momentum
            </label>
            <Input
              type="number"
              name="momentumScore"
              value={config.momentumScore}
              onChange={handleInputChange}
              min="-0.3"
              max="0.3"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              🛡️ Risk Tolerance (%)
            </label>
            <Input
              type="number"
              name="riskTolerance"
              value={config.riskTolerance}
              onChange={handleInputChange}
              min="0.01"
              max="0.2"
              step="0.01"
              className="w-full"
            />
          </div>
        </div>

        {/* Results Dashboard */}
        {enhancedResults && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-6 dark:text-white">🎯 Enhancement Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">⭐</span>
                  <h3 className="text-lg font-semibold dark:text-white">Enhancement Score</h3>
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatNumber(enhancedResults.enhancementScore, 1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Out of 100 points
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🎯</span>
                  <h3 className="text-lg font-semibold dark:text-white">Optimal Position</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPercentage(enhancedResults.finalPositionSize)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Recommended size
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-700">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">💎</span>
                  <h3 className="text-lg font-semibold dark:text-white">Expected Return</h3>
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {formatPercentage(enhancedResults.expectedReturn)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Per trade
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🛡️</span>
                  <h3 className="text-lg font-semibold dark:text-white">Risk Level</h3>
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {formatPercentage(enhancedResults.probabilityOfRuin)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Probability of ruin
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Strategy Comparison Chart */}
        {comparisonData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Strategy Enhancement Comparison</h3>
            
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="originalRisk" 
                    name="Risk %" 
                    label={{ value: 'Risk (%)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="originalReturn" 
                    name="Return" 
                    label={{ value: 'Expected Return', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatNumber(value), name]}
                    labelFormatter={(value) => `Risk: ${value}%`}
                  />
                  <Legend />
                  <Scatter 
                    dataKey="originalReturn" 
                    fill="#ef4444" 
                    name="Original Strategy"
                  />
                  <Scatter 
                    dataKey="enhancedReturn" 
                    fill="#22c55e" 
                    name="Enhanced Strategy"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Optimal Path Visualization */}
        {optimalPath.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Optimal Parameter Space</h3>
            
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={optimalPath}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="winRate" 
                    name="Win Rate" 
                    label={{ value: 'Win Rate', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    dataKey="riskRatio" 
                    name="Risk Ratio" 
                    label={{ value: 'Risk Ratio', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatNumber(value, 3), name]}
                    labelFormatter={(value) => `Win Rate: ${formatPercentage(value)}`}
                  />
                  <Scatter 
                    dataKey="score" 
                    fill="#8884d8" 
                    name="Optimization Score"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Implementation Guide */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 dark:text-white">Implementation Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 dark:text-white">Step-by-Step Enhancement:</h4>
              <ol className="space-y-1 text-sm dark:text-gray-200 list-decimal list-inside">
                <li>Input your current strategy parameters</li>
                <li>Adjust market condition factors</li>
                <li>Review the enhancement score and optimal position size</li>
                <li>Compare with existing strategy performance</li>
                <li>Implement gradually with small position sizes</li>
                <li>Monitor and adjust based on real performance</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2 dark:text-white">Key Enhancement Factors:</h4>
              <ul className="space-y-1 text-sm dark:text-gray-200">
                <li>• <strong>Market Volatility:</strong> Reduces position size in volatile markets</li>
                <li>• <strong>Momentum Score:</strong> Increases allocation with positive momentum</li>
                <li>• <strong>Correlation Factor:</strong> Reduces size for correlated positions</li>
                <li>• <strong>Liquidity Score:</strong> Adjusts for market liquidity conditions</li>
                <li>• <strong>Confidence Interval:</strong> Conservative adjustment factor</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStrategyCalculator;