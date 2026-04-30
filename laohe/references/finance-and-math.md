# 财务与数学化参考

Use this reference for financial models, unit economics, ROI, sensitivity, scenario planning, and formal mathematical framing of engineering/product problems.

## Financial Model Skeleton

Minimum customer-facing model:

- Inputs: price, users/accounts, conversion, churn, gross margin, implementation cost, CAC, support cost.
- Revenue: acquisition, expansion, contraction, churn.
- Cost: COGS, engineering, support, sales/marketing, infrastructure.
- Unit economics: ARPA, gross margin, CAC payback, LTV/CAC, contribution margin.
- Scenario: base, downside, upside.
- Sensitivity: price, conversion, churn, CAC, margin.

Core formulas:

```latex
MRR_t = \sum_{i=1}^{N_t} P_{i,t}
```

```latex
NetRevenueRetention = \frac{StartingMRR + Expansion - Contraction - Churn}{StartingMRR}
```

```latex
ContributionMargin = Revenue - COGS - VariableSupport - PaymentFees
```

```latex
CACPayback = \frac{CAC}{ARPA \times GrossMargin}
```

```latex
LTV:CAC = \frac{ARPA \times GrossMargin / Churn}{CAC}
```

## Engineering As Math

Convert ambiguous engineering work into:

- State space: \(S\)
- Actions: \(A\)
- Observations: \(O\)
- Objective function: \(J(\theta)\)
- Constraints: \(g_i(x) \leq 0\), \(h_j(x) = 0\)
- Error/loss: \(L(y, \hat{y})\)
- Reliability target: \(P(failure) \leq \epsilon\)
- Latency/cost budget: \(C(x) \leq B\)

Example:

```latex
\max_{\theta \in \Theta} J(\theta)
= \mathbb{E}_{u \sim \mathcal{U}}
\left[
\alpha \cdot V(u,\theta)
- \beta \cdot T(u,\theta)
- \gamma \cdot R(u,\theta)
- \lambda \cdot C(u,\theta)
\right]
```

Subject to:

```latex
P95Latency(\theta) \leq 300ms,\quad
ErrorRate(\theta) \leq 0.1\%,\quad
InfraCost(\theta) \leq B
```

## Decision Thresholds

Prefer decision rules:

```latex
Ship =
\begin{cases}
1, & Q \geq Q_{min} \land R \leq R_{max} \land E[V] \geq V_{min} \\
0, & otherwise
\end{cases}
```

Where:

- \(Q\): quality score.
- \(R\): residual risk.
- \(E[V]\): expected value.

## Sensitivity Discipline

Every major recommendation should identify the variables that can flip the decision:

```latex
\frac{\partial Profit}{\partial Price},\quad
\frac{\partial Profit}{\partial Churn},\quad
\frac{\partial Profit}{\partial CAC}
```

If one assumption dominates, call it out as the risk owner.

## Communication Rule

Use dense math in appendices to create rigor. Keep the executive decision plain:

- What should we do?
- Why now?
- How much can it make or save?
- What must be true?
- What would make us stop?
