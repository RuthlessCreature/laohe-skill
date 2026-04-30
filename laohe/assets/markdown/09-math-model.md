# 数学化问题定义

- Problem:
- Owner:
- Date:
- Decision needed:

## Variables

| Symbol | Meaning | Domain |
| --- | --- | --- |
| \(x\) | Decision variable |  |
| \(\theta\) | Model/design parameter |  |
| \(u\) | User/request state |  |

## Objective

```latex
\max_{\theta \in \Theta} J(\theta)
= \mathbb{E}_{u \sim \mathcal{U}}
\left[
\alpha V(u,\theta)
- \beta T(u,\theta)
- \gamma R(u,\theta)
- \lambda C(u,\theta)
\right]
```

## Constraints

```latex
g_i(x) \leq 0,\quad h_j(x)=0,\quad P(failure)\leq\epsilon
```

## Decision Rule

```latex
Decision =
\begin{cases}
Ship, & J(\theta) \geq \tau \land Risk \leq R_{max}\\
Hold, & otherwise
\end{cases}
```

## Sensitivity

Which variables can flip the decision?

```latex
\nabla J(\theta)=
\left[
\frac{\partial J}{\partial Price},
\frac{\partial J}{\partial Churn},
\frac{\partial J}{\partial Latency},
\frac{\partial J}{\partial ErrorRate}
\right]
```

## Plain-Language Decision

- Recommendation:
- What must be true:
- What to measure next:
