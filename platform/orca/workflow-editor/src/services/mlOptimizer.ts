/**
 * Phase 10: Machine Learning Optimizer Service
 * Provides intelligent provider selection, cost prediction, and anomaly detection
 */

interface HistoricalDataPoint {
  timestamp: number
  provider: string
  cost: number
  responseTime: number
  success: boolean
}

interface MLMetrics {
  provider: string
  costEMA: number
  responseTimeEMA: number
  anomalyScore: number
  predictedCost: number
  recommendation: number
  isAnomaly: boolean
}

interface AnomalyAlert {
  type: 'cost_spike' | 'performance_degradation' | 'high_error_rate'
  provider: string
  severity: 'low' | 'medium' | 'high'
  message: string
  timestamp: number
}

/**
 * ML Optimizer Service
 * Handles ML-based provider optimization and anomaly detection
 */
class MLOptimizerService {
  private historicalData: HistoricalDataPoint[] = []
  private emaAlpha = 0.2 // EMA smoothing factor
  private anomalyThreshold = 2.5 // Z-score threshold (98.8% confidence)
  private maxHistoricalPoints = 1000
  private alerts: AnomalyAlert[] = []

  /**
   * Track historical data point
   */
  trackDataPoint(provider: string, cost: number, responseTime: number, success: boolean) {
    this.historicalData.push({
      timestamp: Date.now(),
      provider,
      cost,
      responseTime,
      success,
    })

    // Maintain max size
    if (this.historicalData.length > this.maxHistoricalPoints) {
      this.historicalData.shift()
    }
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   * EMA = (price - EMA_previous) * alpha + EMA_previous
   */
  private calculateEMA(values: number[], alpha: number = this.emaAlpha): number {
    if (values.length === 0) return 0

    let ema = values[0]
    for (let i = 1; i < values.length; i++) {
      ema = (values[i] - ema) * alpha + ema
    }
    return ema
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(values: number[]): number {
    if (values.length < 2) return 0

    const mean = values.reduce((a, b) => a + b) / values.length
    const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  /**
   * Detect anomaly using z-score method
   * Z-score = (value - mean) / stdDev
   * Anomaly if |z-score| > threshold
   */
  isAnomaly(value: number, historicalValues: number[]): boolean {
    if (historicalValues.length < 2) return false

    const mean = historicalValues.reduce((a, b) => a + b) / historicalValues.length
    const stdDev = this.calculateStdDev(historicalValues)

    if (stdDev === 0) return false

    const zScore = Math.abs((value - mean) / stdDev)
    return zScore > this.anomalyThreshold
  }

  /**
   * Predict future cost based on historical trend
   * Simple linear regression: y = mx + b
   */
  predictCost(provider: string, lookAheadMinutes: number = 60): number {
    const providerData = this.historicalData.filter((d) => d.provider === provider).slice(-20)

    if (providerData.length < 2) {
      return 0
    }

    // Extract costs and calculate trend
    const costs = providerData.map((d) => d.cost)
    const ema = this.calculateEMA(costs)

    // Simple trend extrapolation
    const lastCost = costs[costs.length - 1]
    const trend = (lastCost - ema) / ema

    // Project forward with damping factor
    const dampingFactor = 0.9
    const projectedTrend = trend * Math.pow(dampingFactor, lookAheadMinutes / 10)

    return Math.max(0, lastCost * (1 + projectedTrend))
  }

  /**
   * Get ML metrics for provider
   */
  getMetrics(provider: string): MLMetrics {
    const providerData = this.historicalData.filter((d) => d.provider === provider)

    if (providerData.length === 0) {
      return {
        provider,
        costEMA: 0,
        responseTimeEMA: 0,
        anomalyScore: 0,
        predictedCost: 0,
        recommendation: 0,
        isAnomaly: false,
      }
    }

    const costs = providerData.map((d) => d.cost)
    const responseTimes = providerData.map((d) => d.responseTime)
    const lastCost = costs[costs.length - 1]

    const costEMA = this.calculateEMA(costs)
    const responseTimeEMA = this.calculateEMA(responseTimes)
    const predictedCost = this.predictCost(provider)

    // Calculate anomaly score (z-score)
    const mean = costs.reduce((a, b) => a + b) / costs.length
    const stdDev = this.calculateStdDev(costs)
    const anomalyScore = stdDev > 0 ? Math.abs((lastCost - mean) / stdDev) : 0

    // Calculate recommendation score (0-100)
    // Lower cost and response time = higher recommendation
    // Cost is weighted 70%, response time 30%
    const maxCost = 0.01 // Reference max cost
    const maxResponseTime = 1000 // Reference max response time

    const costScore = Math.max(0, 100 * (1 - costEMA / maxCost))
    const responseScore = Math.max(0, 100 * (1 - responseTimeEMA / maxResponseTime))
    const recommendation = costScore * 0.7 + responseScore * 0.3

    return {
      provider,
      costEMA,
      responseTimeEMA,
      anomalyScore,
      predictedCost,
      recommendation: Math.round(Math.max(0, Math.min(100, recommendation))),
      isAnomaly: anomalyScore > this.anomalyThreshold,
    }
  }

  /**
   * Get optimal provider based on ML metrics
   */
  getOptimalProvider(providers: string[]): string {
    if (providers.length === 0) return ''

    const metrics = providers.map((p) => this.getMetrics(p))
    const best = metrics.reduce((prev, current) => (current.recommendation > prev.recommendation ? current : prev))

    return best.provider
  }

  /**
   * Detect anomalies and create alerts
   */
  detectAnomalies(): AnomalyAlert[] {
    const newAlerts: AnomalyAlert[] = []
    const providerMap = new Map<string, HistoricalDataPoint[]>()

    // Group data by provider
    for (const data of this.historicalData) {
      if (!providerMap.has(data.provider)) {
        providerMap.set(data.provider, [])
      }
      providerMap.get(data.provider)!.push(data)
    }

    // Check each provider for anomalies
    for (const [provider, data] of providerMap) {
      if (data.length < 3) continue

      const costs = data.map((d) => d.cost)
      const lastCost = costs[costs.length - 1]
      const mean = costs.reduce((a, b) => a + b) / costs.length

      // Cost spike detection
      if (this.isAnomaly(lastCost, costs) && lastCost > mean * 1.5) {
        newAlerts.push({
          type: 'cost_spike',
          provider,
          severity: 'high',
          message: `Cost spike detected for ${provider}: $${lastCost.toFixed(4)} (normal: $${mean.toFixed(4)})`,
          timestamp: Date.now(),
        })
      }

      // Performance degradation detection
      const responseTimes = data.map((d) => d.responseTime)
      const lastTime = responseTimes[responseTimes.length - 1]
      const avgTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length

      if (lastTime > avgTime * 2) {
        newAlerts.push({
          type: 'performance_degradation',
          provider,
          severity: 'medium',
          message: `Performance degradation for ${provider}: ${lastTime.toFixed(0)}ms (normal: ${avgTime.toFixed(0)}ms)`,
          timestamp: Date.now(),
        })
      }

      // Error rate detection
      const recentData = data.slice(-20)
      const errorCount = recentData.filter((d) => !d.success).length
      const errorRate = (errorCount / recentData.length) * 100

      if (errorRate > 10) {
        newAlerts.push({
          type: 'high_error_rate',
          provider,
          severity: 'high',
          message: `High error rate for ${provider}: ${errorRate.toFixed(1)}%`,
          timestamp: Date.now(),
        })
      }
    }

    // Keep alerts from last hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    this.alerts = [...this.alerts.filter((a) => a.timestamp > oneHourAgo), ...newAlerts]

    return newAlerts
  }

  /**
   * Get all active alerts
   */
  getAlerts(): AnomalyAlert[] {
    return this.alerts
  }

  /**
   * Adjust anomaly threshold based on data variability
   */
  autoAdjustThreshold() {
    if (this.historicalData.length < 30) return

    // Calculate overall variability
    const costs = this.historicalData.map((d) => d.cost)
    const mean = costs.reduce((a, b) => a + b) / costs.length
    const stdDev = this.calculateStdDev(costs)
    const cv = stdDev / mean // Coefficient of variation

    // Adjust threshold based on variability
    // Higher variability = higher threshold
    if (cv > 0.5) {
      this.anomalyThreshold = 3.0 // 99.7% confidence
    } else if (cv > 0.3) {
      this.anomalyThreshold = 2.5 // 98.8% confidence
    } else {
      this.anomalyThreshold = 2.0 // 95.4% confidence
    }
  }

  /**
   * Get detailed provider recommendation with reasoning
   */
  getDetailedRecommendation(providers: string[]): {
    recommended: string
    scores: Record<string, number>
    reasoning: string
  } {
    const metrics = providers.map((p) => this.getMetrics(p))
    const scores = Object.fromEntries(metrics.map((m) => [m.provider, m.recommendation]))
    const best = metrics.reduce((prev, current) => (current.recommendation > prev.recommendation ? current : prev))

    let reasoning = `${best.provider} recommended based on:`
    reasoning += `\n- Cost EMA: $${best.costEMA.toFixed(4)}`
    reasoning += `\n- Response Time EMA: ${best.responseTimeEMA.toFixed(0)}ms`
    reasoning += `\n- Anomaly Score: ${best.anomalyScore.toFixed(2)}`

    if (best.isAnomaly) {
      reasoning += '\n⚠️ WARNING: Current metrics show anomaly'
    }

    return {
      recommended: best.provider,
      scores,
      reasoning,
    }
  }

  /**
   * Reset all data (for testing)
   */
  reset() {
    this.historicalData = []
    this.alerts = []
  }

  /**
   * Get historical data for provider
   */
  getHistoricalData(provider: string, limit: number = 100) {
    return this.historicalData.filter((d) => d.provider === provider).slice(-limit)
  }
}

// Export singleton instance
export const mlOptimizer = new MLOptimizerService()

export type { MLMetrics, AnomalyAlert, HistoricalDataPoint }
export default MLOptimizerService
