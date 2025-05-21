import React from 'react';

// Wrapper pour les cartes de stratégie qui ajoute les classes dark mode
const StrategyWrapper = ({ children, strategyColor, strategyType, description }) => {
  // Définir les classes de couleur de fond pour le mode sombre
  const darkBgClasses = {
    'raw': 'dark:bg-green-900/30',
    'martingale': 'dark:bg-purple-900/30',
    'antiMartingale': 'dark:bg-blue-900/30',
    'linear': 'dark:bg-amber-900/30',
    'antiLinear': 'dark:bg-red-900/30',
    'smartDouble': 'dark:bg-emerald-900/30',
    'antiSmartDouble': 'dark:bg-pink-900/30'
  };

  // Définir les classes de couleur de texte pour le mode sombre
  const darkTextClasses = {
    'raw': 'dark:text-green-300',
    'martingale': 'dark:text-purple-300',
    'antiMartingale': 'dark:text-blue-300',
    'linear': 'dark:text-amber-300',
    'antiLinear': 'dark:text-red-300',
    'smartDouble': 'dark:text-emerald-300',
    'antiSmartDouble': 'dark:text-pink-300'
  };

  return (
    <div className={`bg-white hover:scale-105 transition-transform duration-300 rounded-lg shadow-md overflow-hidden ${darkBgClasses[strategyType]}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-600" style={{ backgroundColor: `${strategyColor}20` }}>
        <h3 className={`text-lg font-bold ${darkTextClasses[strategyType]}`} style={{ color: strategyColor }}>{strategyType.charAt(0).toUpperCase() + strategyType.slice(1).replace(/([A-Z])/g, ' $1')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
      {children}
    </div>
  );
};

export default StrategyWrapper;
