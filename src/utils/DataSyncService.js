// DataSyncService.js - Handles automatic synchronization between Strategy Results and Public Statistics

class DataSyncService {
  constructor() {
    this.listeners = [];
    this.strategyData = null;
    this.lastUpdateTime = null;
    
    // Initialize with default data
    this.initializeData();
    
    // Set up periodic checks for data changes
    this.startPeriodicSync();
  }

  // Initialize with current strategy data
  initializeData() {
    this.strategyData = {
      strategies: [
        { name: 'Anti-Smart Double', total: 13, optimal: 13, good: 0, notable: 0, risky: 0, safePercentage: 100.0 },
        { name: 'Anti-Martingale', total: 8, optimal: 4, good: 0, notable: 0, risky: 4, safePercentage: 50.0 },
        { name: 'Raw', total: 6, optimal: 5, good: 1, notable: 0, risky: 0, safePercentage: 100.0 },
        { name: 'Martingale', total: 4, optimal: 0, good: 0, notable: 0, risky: 4, safePercentage: 0.0 },
        { name: 'Anti-Linear', total: 4, optimal: 4, good: 0, notable: 0, risky: 0, safePercentage: 100.0 }
      ],
      winRateTrends: [
        { winRate: 0.3, dominantStrategy: 'Martingale', occurrences: 3, total: 5 },
        { winRate: 0.4, dominantStrategy: 'Raw', occurrences: 2, total: 5 },
        { winRate: 0.5, dominantStrategy: 'Anti-Linear', occurrences: 2, total: 5 },
        { winRate: 0.6, dominantStrategy: 'Anti-Smart Double', occurrences: 2, total: 5 },
        { winRate: 0.7, dominantStrategy: 'Anti-Smart Double', occurrences: 4, total: 5 },
        { winRate: 0.8, dominantStrategy: 'Anti-Smart Double', occurrences: 5, total: 5 },
        { winRate: 0.9, dominantStrategy: 'Anti-Martingale', occurrences: 4, total: 5 }
      ],
      riskRatioTrends: [
        { riskRatio: 0.5, dominantStrategy: 'Anti-Martingale', occurrences: 4, total: 7 },
        { riskRatio: 1.0, dominantStrategy: 'Martingale', occurrences: 2, total: 7 },
        { riskRatio: 1.5, dominantStrategy: 'Anti-Smart Double', occurrences: 3, total: 7 },
        { riskRatio: 2.0, dominantStrategy: 'Anti-Smart Double', occurrences: 3, total: 7 },
        { riskRatio: 2.5, dominantStrategy: 'Anti-Smart Double', occurrences: 3, total: 7 }
      ],
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        source: 'Strategy Results Engine'
      }
    };
    this.lastUpdateTime = Date.now();
  }

  // Subscribe to data changes
  subscribe(callback) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of data changes
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.strategyData);
      } catch (error) {
        console.error('Error in data sync listener:', error);
      }
    });
  }

  // Update strategy data (called from admin uploads or Strategy Results changes)
  updateStrategyData(newData) {
    // Validate and merge new data
    if (this.validateData(newData)) {
      this.strategyData = {
        ...this.strategyData,
        ...newData,
        metadata: {
          ...this.strategyData.metadata,
          lastUpdated: new Date().toISOString(),
          version: this.incrementVersion(this.strategyData.metadata.version)
        }
      };
      
      this.lastUpdateTime = Date.now();
      
      // Save to localStorage for persistence
      this.saveToStorage();
      
      // Notify all subscribers
      this.notifyListeners();
      
      console.log('Strategy data updated successfully:', this.strategyData.metadata);
      return true;
    }
    
    return false;
  }

  // Validate incoming data
  validateData(data) {
    if (!data || typeof data !== 'object') {
      console.error('Invalid data format');
      return false;
    }

    // Check for required strategies array
    if (data.strategies && Array.isArray(data.strategies)) {
      for (const strategy of data.strategies) {
        if (!strategy.name || typeof strategy.total !== 'number') {
          console.error('Invalid strategy data format');
          return false;
        }
      }
    }

    return true;
  }

  // Increment version number
  incrementVersion(version) {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || 0) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  // Save data to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('strategyAnalysisData', JSON.stringify({
        data: this.strategyData,
        timestamp: this.lastUpdateTime
      }));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  // Load data from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('strategyAnalysisData');
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        
        // Check if stored data is more recent
        if (timestamp > this.lastUpdateTime) {
          this.strategyData = data;
          this.lastUpdateTime = timestamp;
          this.notifyListeners();
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
    return false;
  }

  // Get current data
  getCurrentData() {
    return { ...this.strategyData };
  }

  // Simulate data changes from external sources (for demonstration)
  simulateDataChange() {
    const randomStrategy = this.strategyData.strategies[Math.floor(Math.random() * this.strategyData.strategies.length)];
    randomStrategy.total += 1;
    randomStrategy.optimal += Math.random() > 0.5 ? 1 : 0;
    
    this.updateStrategyData({
      strategies: this.strategyData.strategies,
      metadata: {
        ...this.strategyData.metadata,
        simulationUpdate: true
      }
    });
  }

  // Start periodic synchronization check
  startPeriodicSync() {
    // Check for updates every 30 seconds
    setInterval(() => {
      this.loadFromStorage();
    }, 30000);

    // For demonstration, simulate random data changes
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance every minute
          this.simulateDataChange();
        }
      }, 60000);
    }
  }

  // Process uploaded file data (for admin uploads)
  processUploadedData(fileData) {
    try {
      let parsedData;
      
      if (typeof fileData === 'string') {
        parsedData = JSON.parse(fileData);
      } else {
        parsedData = fileData;
      }

      // Transform uploaded data to internal format if needed
      const transformedData = this.transformUploadedData(parsedData);
      
      return this.updateStrategyData(transformedData);
    } catch (error) {
      console.error('Failed to process uploaded data:', error);
      return false;
    }
  }

  // Transform uploaded data to match internal format
  transformUploadedData(data) {
    // Handle different upload formats
    if (data.analysisResults) {
      // Handle analysis results format
      return {
        strategies: data.analysisResults.strategies || this.strategyData.strategies,
        winRateTrends: data.analysisResults.winRateTrends || this.strategyData.winRateTrends,
        riskRatioTrends: data.analysisResults.riskRatioTrends || this.strategyData.riskRatioTrends
      };
    }

    // Handle direct strategy data format
    if (data.strategies) {
      return data;
    }

    // Handle CSV-like data conversion
    if (Array.isArray(data)) {
      return {
        strategies: data.map(row => ({
          name: row.strategy || row.name,
          total: parseInt(row.total) || 0,
          optimal: parseInt(row.optimal) || 0,
          good: parseInt(row.good) || 0,
          notable: parseInt(row.notable) || 0,
          risky: parseInt(row.risky) || 0,
          safePercentage: parseFloat(row.safePercentage) || 0
        }))
      };
    }

    return data;
  }

  // Get statistical summary
  getStatisticalSummary() {
    const totalAnalyses = this.strategyData.strategies.reduce((acc, strategy) => acc + strategy.total, 0);
    const optimalAnalyses = this.strategyData.strategies.reduce((acc, strategy) => acc + strategy.optimal, 0);
    const topStrategy = this.strategyData.strategies.reduce((prev, current) => (prev.total > current.total) ? prev : current);
    const safestStrategy = this.strategyData.strategies.reduce((prev, current) => (prev.safePercentage > current.safePercentage) ? prev : current);

    return {
      totalAnalyses,
      optimalAnalyses,
      topStrategy,
      safestStrategy,
      lastUpdated: this.strategyData.metadata.lastUpdated,
      version: this.strategyData.metadata.version
    };
  }
}

// Create and export singleton instance
const dataSyncService = new DataSyncService();

export default dataSyncService;

// Export utility functions
export const useStrategyData = () => {
  return dataSyncService.getCurrentData();
};

export const subscribeToDataChanges = (callback) => {
  return dataSyncService.subscribe(callback);
};

export const updateStrategyData = (newData) => {
  return dataSyncService.updateStrategyData(newData);
};

export const processUploadedFile = (fileData) => {
  return dataSyncService.processUploadedData(fileData);
};

export const getStatisticalSummary = () => {
  return dataSyncService.getStatisticalSummary();
};