# Dynamic Sizing Strategy Enhancer Simulator

Ce projet est un simulateur interactif permettant d'analyser différentes stratégies de sizing pour le trading ou les jeux de hasard, en fonction du taux de réussite (Win Rate) et du ratio risque/rendement (Risk Ratio).

## Fonctionnalités

Le simulateur comprend trois pages principales :

1. **Simulator** - Permet de configurer et d'exécuter des simulations avec différents paramètres
2. **Strategy Analyzer Grid** - Affiche une grille d'analyse des différentes stratégies selon les combinaisons de Win Rate et Risk Ratio
3. **Strategy Analysis Results** - Présente une analyse visuelle détaillée des stratégies dominantes avec heatmaps et graphiques

## Installation et lancement dans VSCode

Pour exécuter ce projet localement dans Visual Studio Code :

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/edlecv/edmanusye.git
   cd edmanusye
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement**
   ```bash
   npm start
   ```

Le site sera accessible à l'adresse [http://localhost:3000](http://localhost:3000).

## Structure du projet

- `src/components/` - Contient les composants React principaux
  - `StrategyAnalyzer.jsx` - Composant de la page principale du simulateur
  - `ResultsGrid.jsx` - Composant de la grille d'analyse des stratégies
  - `StrategyResults.jsx` - Composant d'analyse visuelle des résultats
- `src/data/` - Contient les données JSON pour les simulations
- `public/images/` - Contient les visualisations et graphiques

## Stratégies disponibles

Le simulateur analyse sept stratégies de sizing différentes :

1. **Raw** - Taille de mise constante
2. **Martingale** - Double la mise après chaque perte
3. **Anti-Martingale** - Double la mise après chaque gain
4. **Linear** - Progression linéaire (augmentation/diminution fixe)
5. **Anti-Linear** - Progression linéaire inverse
6. **Smart Double** - Augmentation d'une unité après une perte, diminution d'une unité après un gain
7. **Anti-Smart Double** - Augmentation d'une unité après un gain, diminution d'une unité après une perte

## Métriques d'analyse

- **Profit attendu** - Gain moyen à la fin des simulations
- **EMDD (Expected Maximum Drawdown)** - Perte maximale attendue
- **Ratio P/EMDD (similaire au ratio de Calmar)** - Mesure du rendement par rapport au risque
- **Probabilité de ruine** - Risque de perdre l'intégralité du capital

## Développement

Ce projet utilise :
- React pour l'interface utilisateur
- Tailwind CSS pour le styling
- Recharts pour les graphiques
- React Router pour la navigation

Pour contribuer au projet, veuillez suivre les conventions de code existantes et tester vos modifications avant de soumettre une pull request.
