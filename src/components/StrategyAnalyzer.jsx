import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
// Removed Card import for main container, will use divs and Tailwind classes for styling

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
      { name: 'Raw', type: 'raw', color: '#10b981' }, // Green
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
    // Removed main Card component, using div with Tailwind classes for styling
    <div className="p-6 bg-white rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-semibold mb-2 text-gray-700">Strategy Configuration</h2>
      <div className="p-4 mb-6 bg-blue-50 rounded-md">
        <span className="text-sm text-blue-700">Base Setup Expectancy: </span>
        <span className={`text-sm font-bold ${expectancy > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {expectancy.toFixed(3)} per $1 bet
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 mb-6">
        {Object.keys(initialConfig).map(key => (
          <div key={key} className="flex flex-col">
            <label htmlFor={key} className="mb-1 text-sm font-medium text-gray-600">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
            <Input
              type="number"
              name={key}
              id={key}
              value={config[key]}
              onChange={handleInputChange}
              step={key === 'winRate' || key === 'riskRatio' ? 0.01 : 1}
              min={key === 'winRate' ? 0 : (key === 'riskRatio' ? 0.1 : 0)}
              max={key === 'winRate' ? 1 : undefined}
              className="bg-white border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>
        ))}
      </div>
      
      <Button onClick={runSimulations} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-md mb-6">
        Run Simulation
      </Button>

      {simulationResults && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Simulation Results</h3>
          <div className="h-[400px] mb-6 bg-gray-50 p-2 rounded-md shadow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} ref={chartRef}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="round" stroke="#666" />
                <YAxis tickFormatter={yAxisTickFormatter} stroke="#666"/>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', borderColor: '#ccc' }} 
                  formatter={tooltipFormatter}
                />
                <Legend />
                {Object.values(simulationResults).map(res => (
                  <Line key={res.name} type="monotone" dataKey={res.type} name={res.name} stroke={res.color} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(simulationResults).sort((a,b) => (b.finalBalance / (b.maxDrawdown || 1)) - (a.finalBalance / (a.maxDrawdown || 1))).map(res => (
              // Using div instead of Card for simpler styling matching the old site
              <div key={res.name} className="bg-white rounded-md shadow p-4 border-t-4" style={{ borderTopColor: res.color }}>
                <h4 className="text-md font-semibold mb-2" style={{ color: res.color }}>{res.name}</h4>
                <div className="text-xs space-y-1 text-gray-600">
                  <p>Final Balance: <strong className={res.finalBalance > config.initialBalance ? 'text-green-600' : 'text-red-600'}>{'$' + formatNumber(res.finalBalance)}</strong></p>
                  <p>Total Return: <strong className={res.finalBalance > config.initialBalance ? 'text-green-600' : 'text-red-600'}>{((res.finalBalance / config.initialBalance - 1) * 100).toFixed(2)}%</strong></p>
                  <p>Max Drawdown: <strong className="text-red-500">{'$' + formatNumber(res.maxDrawdown)}</strong></p>
                  <p>Return/Drawdown: <strong>{formatNumber(res.finalBalance / (res.maxDrawdown || 1))}</strong></p>
                  <p>Trades: {res.tradesCount} (W: {res.wins}, L: {res.losses})</p>
                  <p>Win Rate (Actual): {res.tradesCount > 0 ? formatNumber((res.wins / res.tradesCount) * 100, 1) + '%' : 'N/A'}</p>
                  <p>Largest Bet: {'$' + formatNumber(res.maxBetUsed)}</p>
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

