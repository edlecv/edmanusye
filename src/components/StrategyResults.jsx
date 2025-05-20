import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

const StrategyResults = () => {
  const [modalImage, setModalImage] = useState(null);

  const openModal = (imageSrc, altText) => {
    setModalImage({ src: imageSrc, alt: altText });
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Dominant Strategy Analysis</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Dominant Strategies Heatmap</CardTitle>
          <CardDescription>
            This heatmap shows which strategy is dominant for each combination of Win Rate and Risk Ratio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <img 
              src="/images/strategy_heatmap.png" 
              alt="Dominant strategies heatmap" 
              className="max-w-full h-auto rounded-lg shadow-lg result-image"
              id="heatmap-image"
              onClick={() => openModal("/images/strategy_heatmap.png", "Dominant strategies heatmap")}
            />
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Colors represent different strategies. We can observe that certain strategies 
            dominate in specific regions of the chart, indicating their effectiveness under those particular conditions.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Strategy Dominance Frequency</CardTitle>
            <CardDescription>
              This chart shows how often each strategy is dominant and its risk level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src="/images/strategy_dominance_frequency.png" 
              alt="Strategy dominance frequency" 
              className="max-w-full h-auto rounded-lg shadow-lg result-image"
              id="frequency-image"
              onClick={() => openModal("/images/strategy_dominance_frequency.png", "Strategy dominance frequency")}
            />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Green bars represent optimal cases (ruin risk ≤ 1%), 
              yellow bars represent good cases (risk ≤ 5%), orange bars represent notable cases (risk > 5% but positive profit), 
              and red bars represent very risky cases (negative profit).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safe Dominance Percentage</CardTitle>
            <CardDescription>
              This chart shows the percentage of cases where each strategy is considered safe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src="/images/strategy_safe_percentage.png" 
              alt="Safe dominance percentage by strategy" 
              className="max-w-full h-auto rounded-lg shadow-lg result-image"
              id="percentage-image"
              onClick={() => openModal("/images/strategy_safe_percentage.png", "Safe dominance percentage by strategy")}
            />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              A strategy is considered "safe" when its probability of ruin is less than or equal to 5%.
              This chart shows the percentage of cases where each dominant strategy is also safe.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal for image enlargement */}
      {modalImage && (
        <div className="modal-overlay active" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={modalImage.src} 
              alt={modalImage.alt} 
              className="modal-image" 
            />
            <button className="modal-close" onClick={closeModal}>×</button>
          </div>
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Global Summary</CardTitle>
          <CardDescription>
            This analysis identifies which sizing strategy performs best for each combination of win rate and risk/reward ratio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mb-4">Strategy Dominance Frequency</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Strategy</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Optimal (≤1%)</th>
                  <th className="px-4 py-2 text-left">Good (≤5%)</th>
                  <th className="px-4 py-2 text-left">Notable (>5%)</th>
                  <th className="px-4 py-2 text-left">Risky</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t dark:border-gray-700">
                  <td className="px-4 py-2">Anti-Smart Double</td>
                  <td className="px-4 py-2">13</td>
                  <td className="px-4 py-2">13</td>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">0</td>
                </tr>
                <tr className="border-t dark:border-gray-700">
                  <td className="px-4 py-2">Anti-Martingale</td>
                  <td className="px-4 py-2">8</td>
                  <td className="px-4 py-2">4</td>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">4</td>
                </tr>
                <tr className="border-t dark:border-gray-700">
                  <td className="px-4 py-2">Raw</td>
                  <td className="px-4 py-2">6</td>
                  <td className="px-4 py-2">5</td>
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">0</td>
                </tr>
                <tr className="border-t dark:border-gray-700">
                  <td className="px-4 py-2">Martingale</td>
                  <td className="px-4 py-2">4</td>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">4</td>
                </tr>
                <tr className="border-t dark:border-gray-700">
                  <td className="px-4 py-2">Anti-Linear</td>
                  <td className="px-4 py-2">4</td>
                  <td className="px-4 py-2">4</td>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">0</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Safe Dominance Percentage (Ruin ≤ 5%)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Anti-Smart Double</strong>: 100.0% of cases where this strategy is dominant are considered safe</li>
            <li><strong>Anti-Martingale</strong>: 50.0% of cases where this strategy is dominant are considered safe</li>
            <li><strong>Raw</strong>: 100.0% of cases where this strategy is dominant are considered safe</li>
            <li><strong>Martingale</strong>: 0.0% of cases where this strategy is dominant are considered safe</li>
            <li><strong>Anti-Linear</strong>: 100.0% of cases where this strategy is dominant are considered safe</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Key Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Anti-Smart Double</strong> is the most frequently dominant strategy with 13 occurrences.
            </li>
            <li>
              <strong>Raw</strong> is the safest strategy with 100.0% of its occurrences in low-risk categories (≤5%).
            </li>
            <li>
              <strong>Anti-Smart Double</strong> appears most often in the optimal category (Ruin ≤1%) with 13 occurrences.
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Trends by Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>Win Rate 0.3: <strong>Martingale</strong> is dominant in 3 out of 5 cases</li>
              <li>Win Rate 0.4: <strong>Raw</strong> is dominant in 2 out of 5 cases</li>
              <li>Win Rate 0.5: <strong>Anti-Linear</strong> is dominant in 2 out of 5 cases</li>
              <li>Win Rate 0.6: <strong>Anti-Smart Double</strong> is dominant in 2 out of 5 cases</li>
              <li>Win Rate 0.7: <strong>Anti-Smart Double</strong> is dominant in 4 out of 5 cases</li>
              <li>Win Rate 0.8: <strong>Anti-Smart Double</strong> is dominant in 5 out of 5 cases</li>
              <li>Win Rate 0.9: <strong>Anti-Martingale</strong> is dominant in 4 out of 5 cases</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trends by Risk Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>Risk Ratio 0.5: <strong>Anti-Martingale</strong> is dominant in 4 out of 7 cases</li>
              <li>Risk Ratio 1.0: <strong>Martingale</strong> is dominant in 2 out of 7 cases</li>
              <li>Risk Ratio 1.5: <strong>Anti-Smart Double</strong> is dominant in 3 out of 7 cases</li>
              <li>Risk Ratio 2.0: <strong>Anti-Smart Double</strong> is dominant in 3 out of 7 cases</li>
              <li>Risk Ratio 2.5: <strong>Anti-Smart Double</strong> is dominant in 3 out of 7 cases</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conclusion and Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This analysis shows that the performance of sizing strategies varies considerably depending on the win rate (WR) 
            and risk/reward ratio (RR). The most effective strategies tend to be those that optimally adapt to 
            the specific market or game conditions.
          </p>

          <h3 className="text-xl font-semibold mt-4 mb-2">General Recommendations</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              For low-risk environments (high WR, high RR): <strong>Anti-Smart Double</strong> generally offers the best results
            </li>
            <li>
              For a balanced approach in most scenarios: <strong>Anti-Smart Double</strong> is the most versatile choice
            </li>
            <li>
              To minimize the risk of ruin: <strong>Raw</strong> offers the best capital protection
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyResults;
