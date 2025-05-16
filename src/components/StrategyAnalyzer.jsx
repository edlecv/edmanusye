import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
      if (strategyType !== 'raw') {
         currentBetValue = Math.max(1, currentBetValue);
      }
      peakBalance = Math.max(peakBalance, balance);
      const drawdown = peakBalance - balance;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
      history.push({ round: i + 1, balance });
    }
    return { history, finalBalance: balance, maxDrawdown, wins, losses, tradesCount: wins + losses, maxBetUsed };
  };

  const runSimulations = () => {
    const strategies = [
      { name: 'Raw Strategy', type: 'raw', color: '#10b981' }, // Green
      { name: 'Martingale', type: 'martingale', color: '#9333ea' }, // Purple
      { name: 'Anti-Martingale', type: 'antiMartingale', color: '#2563eb' }, // Blue
      { name: 'Linear', type: 'linear', color: '#eab308' }, // Yellow/Gold
      { name: 'Anti-Linear', type: 'antiLinear', color: '#dc2626' }, // Red
      { name: 'Smart Double', type: 'smartDouble', color: '#ff6b00' }, // Orange
      { name: 'Anti-Smart Double', type: 'antiSmartDouble', color: '#FF1493' }, // Deep Pink
    ];
    let allResults = {};
    let tempChartData = [];
    strategies.forEach(strategy => {
      const result = runSingleStrategy(config, strategy.type);
      allResults[strategy.type] = { ...result, name: strategy.name, color: strategy.color, type: strategy.type };
    });
    const numRounds = config.rounds;
    for (let i = 0; i < numRounds; i++) {
      let roundData = { round: i + 1 };
      let active = false;
      strategies.forEach(strategy => {
        if (allResults[strategy.type].history[i]) {
          roundData[strategy.type] = allResults[strategy.type].history[i].balance;
          active = true;
        } else {
          const lastHistoryEntry = allResults[strategy.type].history[allResults[strategy.type].history.length -1];
          roundData[strategy.type] = lastHistoryEntry ? lastHistoryEntry.balance : null;
        }
      });
      if(active) tempChartData.push(roundData);
      else break;
    }
    const sampleRate = Math.max(1, Math.floor(tempChartData.length / 500));
    const sampledChartData = tempChartData.filter((_, i) => i % sampleRate === 0);
    setChartData(sampledChartData);
    setSimulationResults(allResults);
  };
  
  const formatNumber = (num, digits = 2) => {
    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  const yAxisTickFormatter = (value) => `$${formatNumber(value, 0)}`;

  const tooltipFormatter = (value, name) => {
    // Ensure simulationResults is not null and the specific strategy result exists
    const strategyName = simulationResults && simulationResults[name] ? simulationResults[name].name : name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return [`$${formatNumber(value)}`, strategyName];
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Strategy Configuration</h2>
      <div className="p-4 mb-6 bg-blue-50 rounded-md shadow-sm">
        <span className="text-sm text-blue-700">Base Setup Expectancy: </span>
        <span className={`text-sm font-bold ${expectancy > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {expectancy.toFixed(3)} per $1 bet
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-2">
          <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1">Raw Strategy Settings</h3>
        </div>
        <div className="flex flex-col">
          <label htmlFor="rawBaseBet" className="mb-1 text-sm font-medium text-gray-600">Raw Strategy Base Bet ($)</label>
          <Input
            type="number"
            name="rawBaseBet"
            id="rawBaseBet"
            value={config.rawBaseBet}
            onChange={handleInputChange}
            step={1}
            min={1}
            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 mb-2">
          <h3 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1">General Settings</h3>
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="initialBalance" className="mb-1 text-sm font-medium text-gray-600">Initial Balance ($)</label>
          <Input
            type="number"
            name="initialBalance"
            id="initialBalance"
            value={config.initialBalance}
            onChange={handleInputChange}
            step={100}
            min={100}
            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="winRate" className="mb-1 text-sm font-medium text-gray-600">Win Rate (0-1)</label>
          <Input
            type="number"
            name="winRate"
            id="winRate"
            value={config.winRate}
            onChange={handleInputChange}
            step={0.01}
            min={0}
            max={1}
            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="riskRatio" className="mb-1 text-sm font-medium text-gray-600">Risk Ratio</label>
          <Input
            type="number"
            name="riskRatio"
            id="riskRatio"
            value={config.riskRatio}
            onChange={handleInputChange}
            step={0.1}
            min={0.1}
            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="rounds" className="mb-1 text-sm font-medium text-gray-600">Number of Rounds</label>
          <Input
            type="number"
            name="rounds"
            id="rounds"
            value={config.rounds}
            onChange={handleInputChange}
            step={100}
            min={100}
            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="baseBet" className="mb-1 text-sm font-medium text-gray-600">Base Bet ($)</label>
          <Input
            type="number"
            name="baseBet"
            id="baseBet"
            value={config.baseBet}
            onChange={handleInputChange}
            step={1}
            min={1}
            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="maxBetPercent" className="mb-1 text-sm font-medium text-gray-600">Max Bet (% of Balance)</label>
          <Input
            type="number"
            name="maxBetPercent"
            id="maxBetPercent"
            value={config.maxBetPercent}
            onChange={handleInputChange}
            step={5}
            min={1}
            max={100}
            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="maxBetSize" className="mb-1 text-sm font-medium text-gray-600">Max Bet Size ($)</label>
          <Input
            type="number"
            name="maxBetSize"
            id="maxBetSize"
            value={config.maxBetSize}
            onChange={handleInputChange}
            step={100}
            min={1}
            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="consecutiveLossesForDouble" className="mb-1 text-sm font-medium text-gray-600">Consecutive Losses for Double</label>
          <Input
            type="number"
            name="consecutiveLossesForDouble"
            id="consecutiveLossesForDouble"
            value={config.consecutiveLossesForDouble}
            onChange={handleInputChange}
            step={1}
            min={1}
            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="consecutiveWinsForDouble" className="mb-1 text-sm font-medium text-gray-600">Consecutive Wins for Double</label>
          <Input
            type="number"
            name="consecutiveWinsForDouble"
            id="consecutiveWinsForDouble"
            value={config.consecutiveWinsForDouble}
            onChange={handleInputChange}
            step={1}
            min={1}
            className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
          />
        </div>
      </div>
      
      <Button onClick={runSimulations} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md mb-8 shadow-md transition-colors">
        Run Simulation
      </Button>

      {simulationResults && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Balance Progression Comparison</h3>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {Object.values(simulationResults).map(res => (
              <div key={`legend-${res.type}`} className="flex items-center text-xs">
                <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: res.color }}></div>
                <span>{res.name}</span>
              </div>
            ))}
          </div>
          
          <div className="h-[400px] mb-8 bg-white p-4 rounded-md shadow-md border border-gray-200">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} ref={chartRef}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="round" 
                  stroke="#666" 
                  label={{ value: 'Round', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis 
                  tickFormatter={yAxisTickFormatter} 
                  stroke="#666"
                  label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '0.5rem', borderColor: '#ccc', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} 
                  formatter={tooltipFormatter}
                  labelFormatter={(label) => `Round ${label}`}
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
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(simulationResults).sort((a,b) => (b.finalBalance / (b.maxDrawdown || 1)) - (a.finalBalance / (a.maxDrawdown || 1))).map(res => (
              <div key={res.name} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: `${res.color}15` }}>
                  <h4 className="text-lg font-semibold" style={{ color: res.color }}>{res.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{strategyDescriptions[res.type]}</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">Final Balance:</p>
                      <p className={`font-semibold ${res.finalBalance > config.initialBalance ? 'text-green-600' : 'text-red-600'}`}>
                        {'$' + formatNumber(res.finalBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Return:</p>
                      <p className={`font-semibold ${res.finalBalance > config.initialBalance ? 'text-green-600' : 'text-red-600'}`}>
                        {((res.finalBalance / config.initialBalance - 1) * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Max Drawdown:</p>
                      <p className="font-semibold text-red-500">{'$' + formatNumber(res.maxDrawdown)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Return/Drawdown:</p>
                      <p className="font-semibold">{formatNumber(res.finalBalance / (res.maxDrawdown || 1))}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Trades:</p>
                      <p className="font-semibold">{res.tradesCount} (W: {res.wins}, L: {res.losses})</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Win Rate (Actual):</p>
                      <p className="font-semibold">{res.tradesCount > 0 ? formatNumber((res.wins / res.tradesCount) * 100, 1) + '%' : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Largest Bet:</p>
                      <p className="font-semibold">{'$' + formatNumber(res.maxBetUsed)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyAnalyzer;
