import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

const StrategyResults = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Analyse des Stratégies Dominantes</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Heatmap des Stratégies Dominantes</CardTitle>
          <CardDescription>
            Cette heatmap montre quelle stratégie est dominante pour chaque combinaison de Win Rate et Risk Ratio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <img 
              src="/images/strategy_heatmap.png" 
              alt="Heatmap des stratégies dominantes" 
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Les couleurs représentent différentes stratégies. On peut observer que certaines stratégies 
            dominent dans des régions spécifiques du graphique, indiquant leur efficacité dans ces conditions particulières.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Fréquence de Dominance par Stratégie</CardTitle>
            <CardDescription>
              Ce graphique montre combien de fois chaque stratégie est dominante et son niveau de risque.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src="/images/strategy_dominance_frequency.png" 
              alt="Fréquence de dominance par stratégie" 
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Les barres vertes représentent les cas optimaux (risque de ruine ≤ 1%), 
              les jaunes les cas bons (risque ≤ 5%), les oranges les cas notables (risque > 5% mais profit positif), 
              et les rouges les cas très risqués (profit négatif).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pourcentage de Dominance Sûre</CardTitle>
            <CardDescription>
              Ce graphique montre le pourcentage de cas où chaque stratégie est considérée comme sûre.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <img 
              src="/images/strategy_safe_percentage.png" 
              alt="Pourcentage de dominance sûre par stratégie" 
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Une stratégie est considérée comme "sûre" lorsque sa probabilité de ruine est inférieure ou égale à 5%.
              Ce graphique montre le pourcentage de cas où chaque stratégie dominante est également sûre.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Résumé Global</CardTitle>
          <CardDescription>
            Cette analyse identifie quelle stratégie de sizing est la plus performante pour chaque combinaison de taux de réussite et ratio risque/rendement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-semibold mb-4">Fréquence de Dominance par Stratégie</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Stratégie</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Optimal (≤1%)</th>
                  <th className="px-4 py-2 text-left">Bon (≤5%)</th>
                  <th className="px-4 py-2 text-left">Notable (>5%)</th>
                  <th className="px-4 py-2 text-left">Risqué</th>
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

          <h3 className="text-xl font-semibold mt-8 mb-4">Pourcentage de Dominance Sûre (Ruin ≤ 5%)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Anti-Smart Double</strong>: 100.0% des cas où cette stratégie est dominante sont considérés sûrs</li>
            <li><strong>Anti-Martingale</strong>: 50.0% des cas où cette stratégie est dominante sont considérés sûrs</li>
            <li><strong>Raw</strong>: 100.0% des cas où cette stratégie est dominante sont considérés sûrs</li>
            <li><strong>Martingale</strong>: 0.0% des cas où cette stratégie est dominante sont considérés sûrs</li>
            <li><strong>Anti-Linear</strong>: 100.0% des cas où cette stratégie est dominante sont considérés sûrs</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Observations Clés</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-6 space-y-4">
            <li>
              <strong>Anti-Smart Double</strong> est la stratégie la plus fréquemment dominante avec 13 occurrences.
            </li>
            <li>
              <strong>Raw</strong> est la stratégie la plus sûre avec 100.0% de ses occurrences dans les catégories à faible risque (≤5%).
            </li>
            <li>
              <strong>Anti-Smart Double</strong> apparaît le plus souvent dans la catégorie optimale (Ruin ≤1%) avec 13 occurrences.
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Tendances par Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>Win Rate 0.3: <strong>Martingale</strong> est dominant dans 3 cas sur 5</li>
              <li>Win Rate 0.4: <strong>Raw</strong> est dominant dans 2 cas sur 5</li>
              <li>Win Rate 0.5: <strong>Anti-Linear</strong> est dominant dans 2 cas sur 5</li>
              <li>Win Rate 0.6: <strong>Anti-Smart Double</strong> est dominant dans 2 cas sur 5</li>
              <li>Win Rate 0.7: <strong>Anti-Smart Double</strong> est dominant dans 4 cas sur 5</li>
              <li>Win Rate 0.8: <strong>Anti-Smart Double</strong> est dominant dans 5 cas sur 5</li>
              <li>Win Rate 0.9: <strong>Anti-Martingale</strong> est dominant dans 4 cas sur 5</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendances par Risk Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>Risk Ratio 0.5: <strong>Anti-Martingale</strong> est dominant dans 4 cas sur 7</li>
              <li>Risk Ratio 1.0: <strong>Martingale</strong> est dominant dans 2 cas sur 7</li>
              <li>Risk Ratio 1.5: <strong>Anti-Smart Double</strong> est dominant dans 3 cas sur 7</li>
              <li>Risk Ratio 2.0: <strong>Anti-Smart Double</strong> est dominant dans 3 cas sur 7</li>
              <li>Risk Ratio 2.5: <strong>Anti-Smart Double</strong> est dominant dans 3 cas sur 7</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conclusion et Recommandations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Cette analyse montre que les performances des stratégies de sizing varient considérablement en fonction du taux de réussite (WR) 
            et du ratio risque/rendement (RR). Les stratégies les plus performantes tendent à être celles qui s'adaptent de manière optimale 
            aux conditions spécifiques du marché ou du jeu.
          </p>

          <h3 className="text-xl font-semibold mt-4 mb-2">Recommandations Générales</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Pour les environnements à faible risque (WR élevé, RR élevé): <strong>Anti-Smart Double</strong> offre généralement les meilleurs résultats
            </li>
            <li>
              Pour une approche équilibrée dans la plupart des scénarios: <strong>Anti-Smart Double</strong> est le choix le plus polyvalent
            </li>
            <li>
              Pour minimiser le risque de ruine: <strong>Raw</strong> offre la meilleure protection du capital
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default StrategyResults;
