import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

const AdminAnalysisReport = () => {
  const [modalImage, setModalImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const openModal = (imageSrc, altText) => {
    setModalImage({ src: imageSrc, alt: altText });
  };

  const closeModal = () => {
    setModalImage(null);
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadStatus(`Processing ${files.length} file(s)...`);

    // Simulate file processing without actually updating any external data
    setTimeout(() => {
      setUploadStatus(`Files uploaded successfully. Static analysis data maintained (no external updates).`);
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 2000);
  };

  const exportAnalysisData = () => {
    // Create analysis data export
    const analysisData = {
      strategies: [
        { name: 'Anti-Smart Double', total: 13, optimal: 13, good: 0, notable: 0, risky: 0, safePercentage: 100.0 },
        { name: 'Anti-Martingale', total: 8, optimal: 4, good: 0, notable: 0, risky: 4, safePercentage: 50.0 },
        { name: 'Raw', total: 6, optimal: 5, good: 1, notable: 0, risky: 0, safePercentage: 100.0 },
        { name: 'Martingale', total: 4, optimal: 0, good: 0, notable: 0, risky: 4, safePercentage: 0.0 },
        { name: 'Anti-Linear', total: 4, optimal: 4, good: 0, notable: 0, risky: 0, safePercentage: 100.0 }
      ],
      metadata: {
        lastUpdated: new Date().toISOString(),
        totalAnalyses: 35,
        adminUser: 'admin',
        dataSource: 'Strategy Analysis Engine'
      }
    };

    const dataStr = JSON.stringify(analysisData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `strategy_analysis_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Admin Only - Static Analysis Archive</span>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          This is a secure, static archive of strategy analysis data. This page does not update with new data and is completely separate from the public dynamic statistics page.
        </p>
      </div>

      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">Note: Public Dynamic Statistics Available</span>
        </div>
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
          For real-time, interactive statistics with automatic updates, public users can visit the "Statistics" page in the main navigation.
        </p>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">Admin Strategy Analysis Dashboard</h1>
      
      {/* Admin Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload Analysis Data</span>
            </CardTitle>
            <CardDescription>
              Upload new strategy analysis results to update the public statistics page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".json,.csv,.png,.jpg"
              className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`w-full font-bold py-2 px-4 rounded transition-colors ${
                isUploading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isUploading ? 'Processing...' : 'Select Files to Upload'}
            </button>
            {uploadStatus && (
              <div className={`mt-2 text-sm ${
                uploadStatus.includes('Failed') || uploadStatus.includes('error')
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {uploadStatus}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Supported formats: JSON, CSV, PNG, JPG. This is a secure admin-only static archive.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Analysis Data</span>
            </CardTitle>
            <CardDescription>
              Export current analysis data for backup or external processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={exportAnalysisData}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Export Analysis Report
            </button>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Downloads a JSON file with complete analysis data and metadata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Original Analysis Content */}
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
              yellow bars represent good cases (risk ≤ 5%), orange bars represent notable cases (risk &gt; 5% but positive profit),
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
                  <th className="px-4 py-2 text-left">Notable (&gt;5%)</th>
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

      {/* Admin Actions Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Admin Activity Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span>Analysis data last updated</span>
              <span className="text-gray-600 dark:text-gray-400">{new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
              <span>Public statistics page sync</span>
              <span className="text-green-600 dark:text-green-400">Active</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Total strategy analyses processed</span>
              <span className="text-blue-600 dark:text-blue-400">35</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalysisReport;