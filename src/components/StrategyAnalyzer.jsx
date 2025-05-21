import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import StrategyWrapper from "./StrategyWrapper";
import "../components/animations.css";

const StrategyAnalyzer = () => {
  const initialConfig = {
    initialBalance: 1000,
    winRate: 0.55,
    riskRatio: 1,
    rounds: 1000,
    baseBet: 10,
    rawBaseBet: 10,
    maxBetPercent: 100,
    maxBetSize: 1000,
    consecutiveLossesForDouble: 3,
    consecutiveWinsForDouble: 3,
  };

  const [config, setConfig] = useState(initialConfig);
  const [simulationResults, setSimulationResults] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [expectancy, setExpectancy] = useState(0);

  const chartRef = useRef(null);

  // Strategy descriptions for display under each strategy name
  const strategyDescriptions = {
    'raw': 'Uses constant base bet size',
    'martingale': 'Doubles bet after losses, resets after wins',
    'antiMartingale': 'Doubles bet after wins, resets after losses',
    'linear': 'Increases bet by base amount after losses, resets after wins',
    'antiLinear': 'Increases bet by base amount after wins, resets after losses',
    'smartDouble': 'Doubles bet after X consecutive losses',
    'antiSmartDouble': 'Doubles bet after X consecutive wins'
  };

  useEffect(() => {
    const winRate = parseFloat(config.winRate);
    const riskRatio = parseFloat(config.riskRatio);
    const calculatedExpectancy = (winRate * riskRatio) - (1 - winRate);
    setExpectancy(calculatedExpectancy);
  }, [config.winRate, config.riskRatio]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const runSingleStrategy = (currentConfig, strategyType) => {
    let balance = currentConfig.initialBalance;
    let currentBetValue = currentConfig.baseBet;
    if (strategyType === 'raw') {
        currentBetValue = currentConfig.rawBaseBet;
    }
    let consecutiveWinLoss = 0;
    const history = [];
    let maxDrawdown = 0;
    let peakBalance = currentConfig.initialBalance;
    let wins = 0;
    let losses = 0;
    let maxBetUsed = 0;

    for (let i = 0; i < currentConfig.rounds; i++) {
      if (balance <= 0) break;
      let actualBet = currentBetValue;
      if (strategyType !== 'raw') {
        actualBet = Math.min(
            currentBetValue, 
            balance * (currentConfig.maxBetPercent / 100), 
            currentConfig.maxBetSize
        );
        if (balance < actualBet) actualBet = balance;
      }
      if (actualBet <=0) actualBet = 1;
      maxBetUsed = Math.max(maxBetUsed, actualBet);
      const isWin = Math.random() < currentConfig.winRate;
      if (isWin) {
        balance += actualBet * currentConfig.riskRatio;
        wins++;
        if (strategyType === 'martingale' || strategyType === 'linear' || strategyType === 'smartDouble') {
          consecutiveWinLoss = 0;
          currentBetValue = currentConfig.baseBet;
        }
        if (strategyType === 'antiMartingale') currentBetValue *= 2;
        if (strategyType === 'antiLinear') currentBetValue += currentConfig.baseBet;
        if (strategyType === 'antiSmartDouble') {
          consecutiveWinLoss++;
          if (consecutiveWinLoss >= currentConfig.consecutiveWinsForDouble) {
            currentBetValue = currentConfig.baseBet * 2;
          } else {
            currentBetValue = currentConfig.baseBet;
          }
        }
      } else {
        balance -= actualBet;
        losses++;
        if (strategyType === 'antiMartingale' || strategyType === 'antiLinear' || strategyType === 'antiSmartDouble') {
          consecutiveWinLoss = 0;
          currentBetValue = currentConfig.baseBet;
        }
        if (strategyType === 'martingale') currentBetValue *= 2;
        if (strategyType === 'linear') currentBetValue += currentConfig.baseBet;
        if (strategyType === 'smartDouble') {
          consecutiveWinLoss++;
          if (consecutiveWinLoss >= currentConfig.consecutiveLossesForDouble) {
            currentBetValue = currentConfig.baseBet * 2;
          } else {
            currentBetValue = currentConfig.baseBet;
          }
        }
      }
      
      if (balance > peakBalance) {
        peakBalance = balance;
      } else {
        const drawdown = peakBalance - balance;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
      
      // Record history point for every round to ensure continuous lines
      history.push({
        round: i,
        [strategyType]: balance
      });
    }
    
    return {
      type: strategyType,
      finalBalance: balance,
      maxDrawdown,
      history,
      wins,
      losses,
      tradesCount: wins + losses,
      maxBetUsed
    };
  };

  const runSimulation = () => {
    const strategies = {
      raw: {
        type: 'raw',
        name: 'Raw Strategy',
        color: '#4ade80'
      },
      martingale: {
        type: 'martingale',
        name: 'Martingale',
        color: '#8b5cf6'
      },
      antiMartingale: {
        type: 'antiMartingale',
        name: 'Anti-Martingale',
        color: '#3b82f6'
      },
      linear: {
        type: 'linear',
        name: 'Linear',
        color: '#f59e0b'
      },
      antiLinear: {
        type: 'antiLinear',
        name: 'Anti-Linear',
        color: '#ef4444'
      },
      smartDouble: {
        type: 'smartDouble',
        name: 'Smart Double',
        color: '#10b981'
      },
      antiSmartDouble: {
        type: 'antiSmartDouble',
        name: 'Anti-Smart Double',
        color: '#ec4899'
      }
    };
    
    const results = {};
    let allChartData = [];
    
    // First, run all strategies and collect results
    for (const [key, strategy] of Object.entries(strategies)) {
      const result = runSingleStrategy(config, strategy.type);
      results[key] = {
        ...strategy,
        ...result
      };
    }
    
    // Create a complete array of rounds from 0 to max rounds
    const maxRounds = config.rounds;
    for (let i = 0; i < maxRounds; i++) {
      const dataPoint = { round: i };
      
      // For each strategy, add its balance at this round
      for (const [key, result] of Object.entries(results)) {
        // Find the history point for this round
        const historyPoint = result.history.find(p => p.round === i);
        
        // If found, use that value; otherwise use the last known value or 0
        if (historyPoint) {
          dataPoint[result.type] = historyPoint[result.type];
        } else {
          // Find the last known value before this round
          const lastKnownPoint = result.history
            .filter(p => p.round < i)
            .sort((a, b) => b.round - a.round)[0];
          
          dataPoint[result.type] = lastKnownPoint ? lastKnownPoint[result.type] : 0;
        }
      }
      
      allChartData.push(dataPoint);
    }
    
    // Apply sampling for performance if needed
    if (allChartData.length > 500) {
      const sampleRate = Math.max(1, Math.floor(allChartData.length / 500));
      allChartData = allChartData.filter((_, i) => i % sampleRate === 0 || i === allChartData.length - 1);
    }
    
    setChartData(allChartData);
    setSimulationResults(results);
  };

  const resetSimulation = () => {
    setConfig(initialConfig);
    setSimulationResults(null);
    setChartData([]);
  };

  const formatNumber = (num, decimals = 2) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Custom tooltip component to ensure consistent order and colors
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Sort payload by value in descending order to match the example image
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
      
      return (
        <div className="custom-tooltip bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md">
          <p className="font-medium text-gray-700 dark:text-gray-200 mb-2">Round {label}</p>
          {sortedPayload.map((entry, index) => {
            // Find the strategy info to get the proper color
            const strategyKey = entry.dataKey;
            const strategy = simulationResults[strategyKey];
            
            return (
              <p key={`item-${index}`} style={{ color: strategy.color }} className="text-sm">
                {strategy.name}: ${formatNumber(entry.value)}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const yAxisTickFormatter = (value) => {
    if (value >= 1000) {
      return '$' + (value / 1000) + 'k';
    }
    return '$' + value;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Strategy Simulator Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Initial Balance</label>
            <Input
              type="number"
              name="initialBalance"
              value={config.initialBalance}
              onChange={handleInputChange}
              min="100"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Win Rate (0-1)</label>
            <Input
              type="number"
              name="winRate"
              value={config.winRate}
              onChange={handleInputChange}
              min="0"
              max="1"
              step="0.01"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Risk Ratio (Reward:Risk)</label>
            <Input
              type="number"
              name="riskRatio"
              value={config.riskRatio}
              onChange={handleInputChange}
              min="0.1"
              step="0.1"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Simulation Rounds</label>
            <Input
              type="number"
              name="rounds"
              value={config.rounds}
              onChange={handleInputChange}
              min="100"
              max="10000"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Base Bet Size</label>
            <Input
              type="number"
              name="baseBet"
              value={config.baseBet}
              onChange={handleInputChange}
              min="1"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Raw Strategy Bet Size</label>
            <Input
              type="number"
              name="rawBaseBet"
              value={config.rawBaseBet}
              onChange={handleInputChange}
              min="1"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Max Bet (% of Balance)</label>
            <Input
              type="number"
              name="maxBetPercent"
              value={config.maxBetPercent}
              onChange={handleInputChange}
              min="1"
              max="100"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Max Bet Size</label>
            <Input
              type="number"
              name="maxBetSize"
              value={config.maxBetSize}
              onChange={handleInputChange}
              min="1"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Consecutive Losses for Smart Double</label>
            <Input
              type="number"
              name="consecutiveLossesForDouble"
              value={config.consecutiveLossesForDouble}
              onChange={handleInputChange}
              min="1"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Consecutive Wins for Anti-Smart Double</label>
            <Input
              type="number"
              name="consecutiveWinsForDouble"
              value={config.consecutiveWinsForDouble}
              onChange={handleInputChange}
              min="1"
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="text-sm dark:text-gray-200">
            <span className="font-medium">Expected Value per Bet: </span>
            <span className={expectancy > 0 ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'}>
              {expectancy > 0 ? '+' : ''}{expectancy.toFixed(4)}
            </span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">
              ({expectancy > 0 ? 'Positive EV' : 'Negative EV'})
            </span>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={runSimulation} className="bg-blue-600 hover:bg-blue-700">
              Run Simulation
            </Button>
            <Button onClick={resetSimulation} variant="outline" className="border-gray-300 dark:border-gray-600 dark:text-gray-200">
              Reset
            </Button>
          </div>
        </div>
      </div>
      
      {simulationResults && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Simulation Results</h2>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.values(simulationResults).map(res => (
              <div key={res.name} className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: `${res.color}20`, color: res.color }}>
                <span>{res.name}</span>
              </div>
            ))}
          </div>
          
          <div className="h-[400px] mb-8 bg-white dark:bg-gray-800 p-4 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} ref={chartRef}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e0e0e0" 
                  className="dark:opacity-30" // Atténuer la grille en mode sombre
                />
                <XAxis 
                  dataKey="round" 
                  stroke="#666" 
                  className="dark:text-gray-400"
                  label={{ value: 'Round', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis 
                  tickFormatter={yAxisTickFormatter} 
                  stroke="#666"
                  className="dark:text-gray-400"
                  label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '0.5rem', borderColor: '#ccc', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                {Object.values(simulationResults).map(res => (
                  <Line 
                    key={res.name} 
                    type="monotone" 
                    dataKey={res.type} 
                    name={res.name} 
                    stroke={res.color} 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.values(simulationResults)
              .sort((a, b) => {
                // Sort by Return/Drawdown ratio (Calmar ratio) in descending order
                const aRatio = a.finalBalance / (a.maxDrawdown || 1);
                const bRatio = b.finalBalance / (b.maxDrawdown || 1);
                return bRatio - aRatio;
              })
              .map(res => (
                <StrategyWrapper 
                  key={res.name} 
                  strategyColor={res.color} 
                  strategyType={res.type}
                  description={strategyDescriptions[res.type]}
                >
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Final Balance:</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">{'$' + formatNumber(res.finalBalance)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Total Return:</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">{formatNumber((res.finalBalance / initialConfig.initialBalance) * 100, 2) + '%'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Max Drawdown:</p>
                        <p className="font-semibold text-red-500 dark:text-red-400">{'$' + formatNumber(res.maxDrawdown)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Return/Drawdown:</p>
                        <p className="font-semibold dark:text-white">{formatNumber(res.finalBalance / (res.maxDrawdown || 1))}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Trades:</p>
                        <p className="font-semibold dark:text-white">{res.tradesCount} (W: {res.wins}, L: {res.losses})</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Win Rate (Actual):</p>
                        <p className="font-semibold dark:text-white">{res.tradesCount > 0 ? formatNumber((res.wins / res.tradesCount) * 100, 1) + '%' : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Largest Bet:</p>
                        <p className="font-semibold dark:text-white">{'$' + formatNumber(res.maxBetUsed)}</p>
                      </div>
                    </div>
                  </div>
                </StrategyWrapper>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyAnalyzer;
