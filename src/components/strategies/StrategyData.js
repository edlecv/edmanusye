// Advanced trading strategies data for admin page
export const tradingStrategies = [
  {
    id: 1,
    title: "Adaptive Volatility Strategy (AVS)",
    tags: ["Volatility", "Momentum", "Correlation"],
    description: "Dynamically adjusts position sizing based on market volatility and correlation between assets.",
    formula: [
      "Position Size = Capital × Base%",
      "× (1 - β × σrelative)",
      "× (1 + α × Momentum_Score)",
      "× (1 - γ × Corr_Score)"
    ],
    parameters: [
      { symbol: "σrel", definition: "Current Vol / 90d Avg Vol" },
      { symbol: "Mom_Score", definition: "(P - 20d_Avg) / (20d_Avg × 20d_σ)" },
      { symbol: "Corr_Score", definition: "Avg correlation with portfolio" },
      { symbol: "α,β,γ", definition: "Sensitivity (0.5, 0.7, 0.3)" }
    ],
    logic: "Reduces exposure during high volatility, increases positions on assets with positive momentum, and diversifies by reducing exposure to highly correlated assets."
  },
  {
    id: 2,
    title: "Market Regime Strategy (MRS)",
    tags: ["Trend", "Volatility", "Liquidity"],
    description: "Identifies market \"regime\" and adapts sizing strategy, implementing risk-on/risk-off approach based on market conditions.",
    formula: [
      "Position Size = Capital × Base%",
      "× Regime_Multiplier",
      "× (1 + δ × Liquidity_Score)"
    ],
    parameters: [
      { symbol: "Regime_Mult", definition: "Based on market conditions:" },
      { condition: "1.5", definition: "if (Uptrend & Low_Vol)" },
      { condition: "1.2", definition: "if (Uptrend & High_Vol)" },
      { condition: "0.8", definition: "if (Downtrend & Low_Vol)" },
      { condition: "0.5", definition: "if (Downtrend & High_Vol)" },
      { condition: "1.0", definition: "otherwise" },
      { symbol: "δ", definition: "Liquidity sensitivity (0.2)" }
    ],
    logic: "Adapts to macroeconomic context by increasing exposure in low-volatility bull markets and reducing it in volatile bear markets, while accounting for liquidity."
  },
  {
    id: 3,
    title: "Modified Kelly Strategy (MKS)",
    tags: ["Kelly", "Systemic Risk", "Drawdown"],
    description: "Extends classic Kelly formula by integrating systemic risk factors and historical drawdown for optimal capital allocation.",
    formula: [
      "f* = ((p × b - q) / b) ×",
      "(1 - ρ × Systemic_Risk)",
      "× (1 - λ × DD_Ratio)"
    ],
    parameters: [
      { symbol: "p", definition: "Probability of gain (winrate)" },
      { symbol: "q", definition: "Probability of loss (1-p)" },
      { symbol: "b", definition: "Average gain/loss ratio" },
      { symbol: "Sys_Risk", definition: "Corr × Index Vol / Hist Vol" },
      { symbol: "DD_Ratio", definition: "Max_DD / Tolerated_DD" },
      { symbol: "ρ,λ", definition: "Weight factors (0.3, 0.5)" }
    ],
    logic: "Optimizes long-term capital growth while accounting for systemic risk and drawdown history, avoiding over-sizing in unfavorable conditions."
  },
  {
    id: 4,
    title: "Fundamental Divergence Strategy (FDS)",
    tags: ["Fundamentals", "Value", "Quality"],
    description: "Adjusts position sizing based on gap between estimated fundamental value and market price, with quality factor weighting.",
    formula: [
      "Position Size = Capital × Base%",
      "× (1 + η × Divergence_Score)",
      "× (1 + θ × Quality_Score)"
    ],
    parameters: [
      { symbol: "Div_Score", definition: "(Fund_Value - Price) / Price" },
      { symbol: "Quality_Score", definition: "Metrics (ROE, Margin, etc.)" },
      { symbol: "Fund_Value", definition: "Weighted avg of valuations" },
      { symbol: "η,θ", definition: "Sensitivity (0.6, 0.4)" }
    ],
    logic: "Increases exposure to assets undervalued relative to fundamentals with high quality metrics, creating edge based on price-value convergence."
  },
  {
    id: 5,
    title: "Adaptive Time Cycle Strategy (ATCS)",
    tags: ["Cycles", "Seasonality", "Temporality"],
    description: "Adjusts position sizing based on identified time cycles and seasonality patterns detected through spectral analysis.",
    formula: [
      "Position Size = Capital × Base%",
      "× (1 + μ × Cycle_Score)",
      "× (1 + ν × Seasonality_Score)"
    ],
    parameters: [
      { symbol: "Cycle_Score", definition: "Weighted sum of cycle scores" },
      { symbol: "Season_Score", definition: "Hist perf / Avg perf" },
      { symbol: "μ,ν", definition: "Sensitivity (0.4, 0.3)" }
    ],
    logic: "Exploits cyclical and seasonal patterns in financial markets, increasing exposure during historically favorable periods and reducing during unfavorable ones."
  },
  {
    id: 6,
    title: "Volatility Asymmetry Strategy (VAS)",
    tags: ["Implied Volatility", "Realized Volatility", "Options"],
    description: "Exploits asymmetry between implied and realized volatility to size positions, capitalizing on market mispricing of risk.",
    formula: [
      "Position Size = Capital × Base%",
      "× (1 + ω × Asymmetry_Score)"
    ],
    parameters: [
      { symbol: "Asym_Score", definition: "(Impl_Vol - Real_Vol) / Real_Vol" },
      { symbol: "Real_Vol", definition: "StdDev of returns (20d)" },
      { symbol: "Impl_Vol", definition: "Derived from option prices" },
      { symbol: "ω", definition: "Sensitivity (0.5)" }
    ],
    logic: "Increases exposure when market overestimates future volatility (high risk premium) and reduces it when market underestimates it."
  },
  {
    id: 7,
    title: "Dynamic Multi-Factor Strategy (DMS)",
    tags: ["Multi-factors", "Adaptation", "Rotation"],
    description: "Integrates multiple market factors with dynamic weightings based on recent performance, using rolling metrics with time decay.",
    formula: [
      "Position Size = Capital × Base%",
      "× Σ(wi × Fi)"
    ],
    parameters: [
      { symbol: "Fi", definition: "Normalized factor score" },
      { symbol: "wi", definition: "Dynamic factor weight" },
      { symbol: "Σwi", definition: "= 1 (weights sum to 100%)" }
    ],
    logic: "Automatically adapts to factors that work best in current market environment, creating edge based on rotation of dominant factors across cycles."
  },
  {
    id: 8,
    title: "Tail Risk Hedging Strategy (TRS)",
    tags: ["Black Swan", "Convexity", "Hedging"],
    description: "Allocates a small portion of capital to positions with asymmetric payoff profiles that perform exceptionally well during market crashes.",
    formula: [
      "Position Size = Capital × Base%",
      "× (1 - κ)",
      "Hedge Size = Capital × κ × Convexity_Ratio"
    ],
    parameters: [
      { symbol: "κ", definition: "Allocation to tail hedges (0.05-0.15)" },
      { symbol: "Convexity_Ratio", definition: "Expected payoff asymmetry" },
      { symbol: "Hedge_Types", definition: "OTM options, VIX futures, safe havens" }
    ],
    logic: "Protects portfolio against extreme market events by maintaining small allocations to instruments with convex payoff profiles, improving long-term risk-adjusted returns despite drag during normal markets."
  }
];

export const usageRecommendations = [
  {
    id: 1,
    title: "Strategy Combination",
    description: "Combine strategies for robust trading system. Use MRS for overall allocation, then AVS for individual position sizing."
  },
  {
    id: 2,
    title: "Parameter Calibration",
    description: "Calibrate sensitivity parameters (α, β, etc.) based on risk tolerance and specific market characteristics."
  },
  {
    id: 3,
    title: "Backtesting",
    description: "Perform rigorous backtesting across different market periods to validate robustness and adjust parameters."
  },
  {
    id: 4,
    title: "Progressive Adaptation",
    description: "Introduce strategies gradually, starting with small allocations to observe behavior under real conditions."
  },
  {
    id: 5,
    title: "Regime Monitoring",
    description: "Continuously monitor market regimes and be prepared to adjust strategy weights as conditions evolve."
  }
];
