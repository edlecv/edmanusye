import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

const ProbabilisticEdgeFormula = () => {
  const [config, setConfig] = useState({
    baseWinRate: 0.55,
    baseRiskRatio: 1.5,
    basePositionSize: 0.02, // 2% of capital
    capital: 10000,
    
    // Enhanced probabilistic factors
    marketRegimeMultiplier: 1.0,
    volatilityAdjustment: 0.0,
    correlationPenalty: 0.0,
    momentumBonus: 0.0,
    liquidityScore: 1.0,
    
    // Risk management parameters
    maxPositionSize: 0.10, // 10% max
    drawdownThreshold: 0.15, // 15% max drawdown
    consecutiveLossLimit: 5,
    
    // Advanced parameters
    kellyFraction: 0.25, // Conservative Kelly
    confidenceLevel: 0.85,
    timeDecayFactor: 0.95,
    adaptationSpeed: 0.1
  });

  const [results, setResults] = useState(null);
  const [simulationData, setSimulationData] = useState([]);

  // Core Probabilistic Edge Formula
  const calculateProbabilisticEdge = () => {
    const { 
      baseWinRate, 
      baseRiskRatio, 
      basePositionSize,
      marketRegimeMultiplier,
      volatilityAdjustment,
      correlationPenalty,
      momentumBonus,
      liquidityScore,
      kellyFraction,
      confidenceLevel,
      maxPositionSize,
      drawdownThreshold
    } = config;

    // 1. Enhanced Win Rate Calculation
    const marketAdjustedWinRate = Math.min(0.95, Math.max(0.05, 
      baseWinRate * marketRegimeMultiplier * (1 + momentumBonus) * (1 - volatilityAdjustment)
    ));

    // 2. Dynamic Risk Ratio with Correlation Adjustment
    const adjustedRiskRatio = baseRiskRatio * liquidityScore * (1 - correlationPenalty);

    // 3. Kelly Criterion with Enhancements
    const kellyOptimal = ((marketAdjustedWinRate * adjustedRiskRatio) - (1 - marketAdjustedWinRate)) / adjustedRiskRatio;
    const conservativeKelly = Math.max(0, kellyOptimal * kellyFraction);

    // 4. Probabilistic Edge Score
    const rawEdge = (marketAdjustedWinRate * adjustedRiskRatio) - (1 - marketAdjustedWinRate);
    const confidenceAdjustedEdge = rawEdge * confidenceLevel;

    // 5. Dynamic Position Sizing Formula
    const baseSize = Math.min(basePositionSize, conservativeKelly);
    
    // Market regime adjustment
    const regimeAdjustedSize = baseSize * marketRegimeMultiplier;
    
    // Volatility scaling (reduce size in high volatility)
    const volatilityScaledSize = regimeAdjustedSize * (1 - volatilityAdjustment);
    
    // Momentum enhancement
    const momentumEnhancedSize = volatilityScaledSize * (1 + momentumBonus);
    
    // Correlation penalty (reduce size for correlated positions)
    const correlationAdjustedSize = momentumEnhancedSize * (1 - correlationPenalty);
    
    // Final position size with hard limits
    const finalPositionSize = Math.min(maxPositionSize, Math.max(0.001, correlationAdjustedSize));

    // 6. Risk-Adjusted Expected Return
    const expectedReturn = confidenceAdjustedEdge * finalPositionSize;
    
    // 7. Sharpe-like Ratio Enhancement
    const volatilityPenalty = Math.max(0.1, 1 - volatilityAdjustment);
    const riskAdjustedReturn = expectedReturn / volatilityPenalty;

    // 8. Drawdown Protection Factor
    const drawdownProtection = Math.max(0.1, 1 - (drawdownThreshold * 2));
    const protectedReturn = riskAdjustedReturn * drawdownProtection;

    return {
      marketAdjustedWinRate,
      adjustedRiskRatio,
      kellyOptimal,
      conservativeKelly,
      rawEdge,
      confidenceAdjustedEdge,
      finalPositionSize,
      expectedReturn,
      riskAdjustedReturn,
      protectedReturn,
      edgeScore: confidenceAdjustedEdge * 100,
      riskScore: (1 - finalPositionSize / maxPositionSize) * 100
    };
  };

  // Advanced simulation with multiple scenarios
  const runAdvancedSimulation = () => {
    const scenarios = [
      { name: 'Bull Market', regimeMultiplier: 1.3, volatility: -0.1, momentum: 0.2 },
      { name: 'Bear Market', regimeMultiplier: 0.7, volatility: 0.3, momentum: -0.1 },
      { name: 'Sideways Market', regimeMultiplier: 1.0, volatility: 0.1, momentum: 0.0 },
      { name: 'High Volatility', regimeMultiplier: 0.8, volatility: 0.4, momentum: 0.1 },
      { name: 'Low Volatility', regimeMultiplier: 1.2, volatility: -0.2, momentum: 0.1 }
    ];

    const simulationResults = scenarios.map(scenario => {
      const tempConfig = {
        ...config,
        marketRegimeMultiplier: scenario.regimeMultiplier,
        volatilityAdjustment: Math.max(0, scenario.volatility),
        momentumBonus: Math.max(0, scenario.momentum)
      };

      const originalConfig = config;
      setConfig(tempConfig);
      const result = calculateProbabilisticEdge();
      setConfig(originalConfig);

      return {
        scenario: scenario.name,
        ...result,
        annualizedReturn: result.protectedReturn * 252, // Trading days
        maxRisk: result.finalPositionSize * 100
      };
    });

    setSimulationData(simulationResults);
    return simulationResults;
  };

  useEffect(() => {
    const result = calculateProbabilisticEdge();
    setResults(result);
  }, [config]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const formatPercentage = (value) => `${(value * 100).toFixed(2)}%`;
  const formatNumber = (value, decimals = 4) => value.toFixed(decimals);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">
          Advanced Probabilistic Edge Formula (APEF)
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          A comprehensive formula that enhances trading profits through probabilistic edge calculation, 
          dynamic position sizing, and multi-factor risk adjustment while preserving capital.
        </p>

        {/* Formula Display */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3 dark:text-white">Core Formula Components:</h3>
          <div className="space-y-2 text-sm font-mono dark:text-gray-200">
            <div>1. Enhanced Win Rate = Base_WR × Regime_Mult × (1 + Momentum) × (1 - Volatility)</div>
            <div>2. Adjusted Risk Ratio = Base_RR × Liquidity × (1 - Correlation_Penalty)</div>
            <div>3. Kelly Optimal = (Enhanced_WR × Adj_RR - (1 - Enhanced_WR)) / Adj_RR</div>
            <div>4. Probabilistic Edge = (Enhanced_WR × Adj_RR) - (1 - Enhanced_WR)</div>
            <div>5. Final Position Size = min(Max_Size, Kelly × Confidence × Market_Factors)</div>
            <div>6. Expected Return = Probabilistic_Edge × Position_Size × Confidence</div>
          </div>
        </div>

        {/* Configuration Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Base Win Rate
            </label>
            <Input
              type="number"
              name="baseWinRate"
              value={config.baseWinRate}
              onChange={handleInputChange}
              min="0.1"
              max="0.9"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Base Risk Ratio
            </label>
            <Input
              type="number"
              name="baseRiskRatio"
              value={config.baseRiskRatio}
              onChange={handleInputChange}
              min="0.5"
              max="5.0"
              step="0.1"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Base Position Size (%)
            </label>
            <Input
              type="number"
              name="basePositionSize"
              value={config.basePositionSize}
              onChange={handleInputChange}
              min="0.001"
              max="0.2"
              step="0.001"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Market Regime Multiplier
            </label>
            <Input
              type="number"
              name="marketRegimeMultiplier"
              value={config.marketRegimeMultiplier}
              onChange={handleInputChange}
              min="0.5"
              max="2.0"
              step="0.1"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Volatility Adjustment
            </label>
            <Input
              type="number"
              name="volatilityAdjustment"
              value={config.volatilityAdjustment}
              onChange={handleInputChange}
              min="0"
              max="0.5"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Momentum Bonus
            </label>
            <Input
              type="number"
              name="momentumBonus"
              value={config.momentumBonus}
              onChange={handleInputChange}
              min="0"
              max="0.3"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Correlation Penalty
            </label>
            <Input
              type="number"
              name="correlationPenalty"
              value={config.correlationPenalty}
              onChange={handleInputChange}
              min="0"
              max="0.5"
              step="0.01"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Kelly Fraction (Conservative)
            </label>
            <Input
              type="number"
              name="kellyFraction"
              value={config.kellyFraction}
              onChange={handleInputChange}
              min="0.1"
              max="1.0"
              step="0.05"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Confidence Level
            </label>
            <Input
              type="number"
              name="confidenceLevel"
              value={config.confidenceLevel}
              onChange={handleInputChange}
              min="0.5"
              max="0.99"
              step="0.01"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Button 
            onClick={runAdvancedSimulation}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Run Multi-Scenario Analysis
          </Button>
        </div>

        {/* Results Display */}
        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Probabilistic Edge</h3>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatNumber(results.edgeScore, 2)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Confidence: {formatPercentage(results.confidenceAdjustedEdge)}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Optimal Position Size</h3>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatPercentage(results.finalPositionSize)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Kelly Optimal: {formatPercentage(results.kellyOptimal)}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Enhanced Win Rate</h3>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatPercentage(results.marketAdjustedWinRate)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Base: {formatPercentage(config.baseWinRate)}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Risk Score</h3>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatNumber(results.riskScore, 1)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Lower is safer
              </div>
            </Card>
          </div>
        )}

        {/* Scenario Analysis Chart */}
        {simulationData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">Multi-Scenario Analysis</h3>
            
            <div className="h-[400px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scenario" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      typeof value === 'number' ? formatNumber(value, 3) : value,
                      name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="edgeScore" fill="#3b82f6" name="Edge Score %" />
                  <Bar dataKey="maxRisk" fill="#ef4444" name="Max Risk %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {simulationData.map((scenario, index) => (
                <Card key={index} className="p-4">
                  <h4 className="font-semibold mb-2 dark:text-white">{scenario.scenario}</h4>
                  <div className="space-y-1 text-sm">
                    <div>Edge: <span className="font-medium text-green-600">{formatNumber(scenario.edgeScore, 2)}%</span></div>
                    <div>Position: <span className="font-medium text-blue-600">{formatPercentage(scenario.finalPositionSize)}</span></div>
                    <div>Win Rate: <span className="font-medium text-purple-600">{formatPercentage(scenario.marketAdjustedWinRate)}</span></div>
                    <div>Risk: <span className="font-medium text-orange-600">{formatNumber(scenario.maxRisk, 1)}%</span></div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Strategy Explanation */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 p-6 rounded-lg mt-8">
          <h3 className="text-2xl font-semibold mb-6 dark:text-white">🎓 Why This Works & How to Use It</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-3 dark:text-white flex items-center">
                <span className="text-2xl mr-2">✨</span>
                Key Benefits
              </h4>
              <ul className="space-y-2 text-sm dark:text-gray-200">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Smart Position Sizing:</strong> Automatically calculates optimal trade sizes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Market Adaptation:</strong> Adjusts to changing market conditions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Risk Protection:</strong> Built-in safeguards prevent over-leveraging</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Profit Enhancement:</strong> Maximizes returns while controlling risk</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Mathematical Foundation:</strong> Based on proven Kelly criterion</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3 dark:text-white flex items-center">
                <span className="text-2xl mr-2">🚀</span>
                Getting Started
              </h4>
              <ul className="space-y-2 text-sm dark:text-gray-200">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">1.</span>
                  <span><strong>Input Your Strategy:</strong> Enter your current win rate and risk ratio</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">2.</span>
                  <span><strong>Set Market Conditions:</strong> Adjust volatility and momentum settings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">3.</span>
                  <span><strong>Review Results:</strong> Check the optimized position size and edge score</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">4.</span>
                  <span><strong>Start Small:</strong> Test with reduced position sizes initially</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">5.</span>
                  <span><strong>Monitor & Adjust:</strong> Fine-tune parameters based on performance</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
            <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Important Note</h5>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This tool provides mathematical optimization based on your inputs. Always start with small position sizes and
              thoroughly test any strategy before committing significant capital. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProbabilisticEdgeFormula;