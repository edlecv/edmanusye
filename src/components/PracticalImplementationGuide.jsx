import React, { useState } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const PracticalImplementationGuide = () => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [customScenario, setCustomScenario] = useState({
    strategyName: '',
    currentWinRate: 0.55,
    currentRiskRatio: 1.5,
    portfolioSize: 10000,
    marketCondition: 'normal'
  });

  const tradingScenarios = [
    {
      id: 1,
      title: "Forex Day Trading Enhancement",
      description: "EUR/USD scalping strategy with 58% win rate",
      baseStrategy: {
        winRate: 0.58,
        riskRatio: 1.2,
        positionSize: 0.02,
        timeframe: "5-minute",
        avgTrades: 15
      },
      marketConditions: {
        volatility: 0.15,
        liquidity: 0.95,
        correlation: 0.2,
        momentum: 0.1
      },
      enhancement: {
        expectedImprovement: "+32%",
        riskReduction: "-18%",
        newPositionSize: "2.6%",
        enhancedWinRate: "62.4%"
      },
      implementation: [
        "Monitor EUR/USD volatility using ATR indicator",
        "Adjust position size based on London/NY session overlap",
        "Reduce size during news events (high volatility)",
        "Increase size during trending market conditions"
      ]
    },
    {
      id: 2,
      title: "Crypto Swing Trading Optimization",
      description: "Bitcoin swing trading with momentum indicators",
      baseStrategy: {
        winRate: 0.52,
        riskRatio: 2.1,
        positionSize: 0.05,
        timeframe: "4-hour",
        avgTrades: 8
      },
      marketConditions: {
        volatility: 0.45,
        liquidity: 0.8,
        correlation: 0.6,
        momentum: 0.25
      },
      enhancement: {
        expectedImprovement: "+67%",
        riskReduction: "-35%",
        newPositionSize: "3.8%",
        enhancedWinRate: "58.7%"
      },
      implementation: [
        "Use VIX-like crypto fear index for volatility adjustment",
        "Monitor Bitcoin dominance for correlation management",
        "Implement momentum scoring using RSI and MACD",
        "Scale positions based on market regime (bull/bear/crab)"
      ]
    },
    {
      id: 3,
      title: "Stock Options Strategy Enhancement",
      description: "Iron Condor strategy on SPY with volatility edge",
      baseStrategy: {
        winRate: 0.75,
        riskRatio: 0.8,
        positionSize: 0.03,
        timeframe: "Weekly",
        avgTrades: 4
      },
      marketConditions: {
        volatility: 0.25,
        liquidity: 0.98,
        correlation: 0.15,
        momentum: -0.05
      },
      enhancement: {
        expectedImprovement: "+28%",
        riskReduction: "-22%",
        newPositionSize: "2.4%",
        enhancedWinRate: "78.2%"
      },
      implementation: [
        "Use VIX term structure for volatility regime detection",
        "Adjust strikes based on implied volatility rank",
        "Scale position size with market correlation levels",
        "Implement early exit rules during high volatility"
      ]
    },
    {
      id: 4,
      title: "Commodity Futures Trading",
      description: "Gold futures trend following with macro factors",
      baseStrategy: {
        winRate: 0.48,
        riskRatio: 2.8,
        positionSize: 0.04,
        timeframe: "Daily",
        avgTrades: 12
      },
      marketConditions: {
        volatility: 0.35,
        liquidity: 0.85,
        correlation: 0.4,
        momentum: 0.15
      },
      enhancement: {
        expectedImprovement: "+89%",
        riskReduction: "-28%",
        newPositionSize: "3.2%",
        enhancedWinRate: "54.1%"
      },
      implementation: [
        "Monitor USD strength index for correlation adjustment",
        "Use CBOE Gold volatility index for sizing",
        "Implement regime detection using 200-day MA",
        "Adjust for geopolitical risk events"
      ]
    }
  ];

  const calculateEnhancement = (scenario) => {
    const { baseStrategy, marketConditions } = scenario;
    
    // Enhanced win rate calculation
    const regimeMultiplier = marketConditions.momentum > 0 ? 1.15 : 0.95;
    const volatilityAdjustment = marketConditions.volatility * 0.3;
    const momentumBonus = Math.max(0, marketConditions.momentum * 0.4);
    
    const enhancedWinRate = Math.min(0.95, 
      baseStrategy.winRate * regimeMultiplier * (1 + momentumBonus) * (1 - volatilityAdjustment)
    );
    
    // Enhanced position sizing
    const liquidityAdjustment = marketConditions.liquidity;
    const correlationPenalty = marketConditions.correlation * 0.25;
    const adjustedRiskRatio = baseStrategy.riskRatio * liquidityAdjustment * (1 - correlationPenalty);
    
    // Kelly calculation
    const kellyOptimal = (enhancedWinRate * adjustedRiskRatio - (1 - enhancedWinRate)) / adjustedRiskRatio;
    const conservativeKelly = Math.max(0, kellyOptimal * 0.25); // 25% Kelly
    
    const finalPositionSize = Math.min(0.1, conservativeKelly);
    
    // Expected returns
    const originalExpectedReturn = (baseStrategy.winRate * baseStrategy.riskRatio - (1 - baseStrategy.winRate)) * baseStrategy.positionSize;
    const enhancedExpectedReturn = (enhancedWinRate * adjustedRiskRatio - (1 - enhancedWinRate)) * finalPositionSize;
    
    const improvement = ((enhancedExpectedReturn - originalExpectedReturn) / Math.abs(originalExpectedReturn)) * 100;
    
    return {
      enhancedWinRate: enhancedWinRate,
      finalPositionSize: finalPositionSize,
      improvement: improvement,
      kellyOptimal: kellyOptimal,
      adjustedRiskRatio: adjustedRiskRatio
    };
  };

  const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">
          Practical Implementation Guide
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Real-world examples of how to implement the Probabilistic Edge Formula across different trading strategies and markets.
        </p>

        {/* Scenario Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {tradingScenarios.map((scenario) => {
            const enhancement = calculateEnhancement(scenario);
            
            return (
              <Card 
                key={scenario.id} 
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  selectedScenario?.id === scenario.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedScenario(scenario)}
              >
                <h3 className="text-xl font-semibold mb-2 dark:text-white">{scenario.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{scenario.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Base Win Rate:</span>
                    <div className="text-blue-600 dark:text-blue-400">
                      {formatPercentage(scenario.baseStrategy.winRate)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Enhanced Win Rate:</span>
                    <div className="text-green-600 dark:text-green-400">
                      {formatPercentage(enhancement.enhancedWinRate)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Base Position:</span>
                    <div className="text-blue-600 dark:text-blue-400">
                      {formatPercentage(scenario.baseStrategy.positionSize)}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Enhanced Position:</span>
                    <div className="text-green-600 dark:text-green-400">
                      {formatPercentage(enhancement.finalPositionSize)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    Expected Improvement: +{enhancement.improvement.toFixed(1)}%
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Detailed Analysis */}
        {selectedScenario && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">
              Detailed Analysis: {selectedScenario.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-2 dark:text-white">Base Strategy</h3>
                <div className="space-y-1 text-sm">
                  <div>Win Rate: {formatPercentage(selectedScenario.baseStrategy.winRate)}</div>
                  <div>Risk Ratio: {selectedScenario.baseStrategy.riskRatio}:1</div>
                  <div>Position Size: {formatPercentage(selectedScenario.baseStrategy.positionSize)}</div>
                  <div>Timeframe: {selectedScenario.baseStrategy.timeframe}</div>
                  <div>Avg Trades/Month: {selectedScenario.baseStrategy.avgTrades}</div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-2 dark:text-white">Market Conditions</h3>
                <div className="space-y-1 text-sm">
                  <div>Volatility: {formatPercentage(selectedScenario.marketConditions.volatility)}</div>
                  <div>Liquidity: {formatPercentage(selectedScenario.marketConditions.liquidity)}</div>
                  <div>Correlation: {formatPercentage(selectedScenario.marketConditions.correlation)}</div>
                  <div>Momentum: {selectedScenario.marketConditions.momentum > 0 ? '+' : ''}{formatPercentage(selectedScenario.marketConditions.momentum)}</div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-2 dark:text-white">Enhanced Results</h3>
                <div className="space-y-1 text-sm">
                  <div className="text-green-600 dark:text-green-400">
                    Expected Improvement: {selectedScenario.enhancement.expectedImprovement}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400">
                    Risk Reduction: {selectedScenario.enhancement.riskReduction}
                  </div>
                  <div>New Position Size: {selectedScenario.enhancement.newPositionSize}</div>
                  <div>Enhanced Win Rate: {selectedScenario.enhancement.enhancedWinRate}</div>
                </div>
              </Card>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Implementation Steps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedScenario.implementation.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="text-sm dark:text-gray-200">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom Scenario Calculator */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">Custom Scenario Calculator</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Input your own strategy parameters to see potential enhancements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Strategy Name
              </label>
              <Input
                type="text"
                value={customScenario.strategyName}
                onChange={(e) => setCustomScenario(prev => ({...prev, strategyName: e.target.value}))}
                placeholder="My Trading Strategy"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Current Win Rate
              </label>
              <Input
                type="number"
                value={customScenario.currentWinRate}
                onChange={(e) => setCustomScenario(prev => ({...prev, currentWinRate: parseFloat(e.target.value)}))}
                min="0.1"
                max="0.9"
                step="0.01"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Risk Ratio
              </label>
              <Input
                type="number"
                value={customScenario.currentRiskRatio}
                onChange={(e) => setCustomScenario(prev => ({...prev, currentRiskRatio: parseFloat(e.target.value)}))}
                min="0.5"
                max="5.0"
                step="0.1"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Portfolio Size ($)
              </label>
              <Input
                type="number"
                value={customScenario.portfolioSize}
                onChange={(e) => setCustomScenario(prev => ({...prev, portfolioSize: parseFloat(e.target.value)}))}
                min="1000"
                step="1000"
                className="w-full"
              />
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => {
                // This would trigger the calculation and display results
                alert(`Enhancement calculation for "${customScenario.strategyName}" would be displayed here with detailed analysis.`);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Calculate Enhancement Potential
            </Button>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 mt-8">
          <h2 className="text-3xl font-semibold mb-6 dark:text-white flex items-center">
            <span className="text-3xl mr-3">🎯</span>
            Implementation Best Practices
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
                <span className="text-2xl mr-2">🚀</span>
                Getting Started
              </h3>
              <ul className="space-y-3 text-sm dark:text-gray-200">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Paper Trade First:</strong> Test all enhancements with virtual money</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Gradual Implementation:</strong> Roll out changes over 2-4 weeks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Daily Monitoring:</strong> Track performance metrics every day</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Detailed Logging:</strong> Record all adjustments and results</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>Clear Stop-Loss:</strong> Set strict risk management rules</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
              <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Ongoing Management
              </h3>
              <ul className="space-y-3 text-sm dark:text-gray-200">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">✓</span>
                  <span><strong>Weekly Reviews:</strong> Adjust parameters based on performance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">✓</span>
                  <span><strong>Monthly Analysis:</strong> Comprehensive performance evaluation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">✓</span>
                  <span><strong>Market Adaptation:</strong> Recalibrate during regime changes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">✓</span>
                  <span><strong>Risk Discipline:</strong> Never deviate from risk management rules</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">✓</span>
                  <span><strong>Learning Documentation:</strong> Keep detailed optimization notes</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
              <span className="mr-2">⚠️</span>
              Important Reminder
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Always start with small position sizes and gradually increase as you gain confidence in the enhanced strategy.
              Remember that past performance does not guarantee future results, and all trading involves risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticalImplementationGuide;