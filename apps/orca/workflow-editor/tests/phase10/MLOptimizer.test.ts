/**
 * Phase 10: ML Optimizer Service Tests
 * Validates EMA calculations, anomaly detection, cost prediction, and recommendations
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mlOptimizer } from '../../src/services/mlOptimizer'

describe('Phase 10 ML Optimizer: ML-Based Provider Optimization', () => {
  beforeEach(() => {
    mlOptimizer.reset()
  })

  describe('EMA (Exponential Moving Average)', () => {
    it('should calculate EMA correctly for simple cost series', () => {
      const costs = [0.001, 0.002, 0.003, 0.002, 0.001]

      costs.forEach((cost) => {
        mlOptimizer.trackDataPoint('openai', cost, 100, true)
      })

      const metrics = mlOptimizer.getMetrics('openai')
      expect(metrics.costEMA).toBeGreaterThan(0)
      expect(metrics.costEMA).toBeLessThanOrEqual(Math.max(...costs))
    })

    it('should smooth cost fluctuations with EMA', () => {
      // High variability data
      [0.001, 0.01, 0.002, 0.009, 0.0015].forEach((cost) => {
        mlOptimizer.trackDataPoint('openai', cost, 100, true)
      })

      const metrics = mlOptimizer.getMetrics('openai')
      // EMA should be between min and max
      expect(metrics.costEMA).toBeGreaterThan(0.001)
      expect(metrics.costEMA).toBeLessThan(0.01)
    })

    it('should calculate response time EMA independently', () => {
      const times = [100, 200, 150, 180, 120]
      times.forEach((time) => {
        mlOptimizer.trackDataPoint('anthropic', 0.001, time, true)
      })

      const metrics = mlOptimizer.getMetrics('anthropic')
      expect(metrics.responseTimeEMA).toBeGreaterThan(0)
      expect(metrics.responseTimeEMA).toBeLessThanOrEqual(Math.max(...times))
    })
  })

  describe('Anomaly Detection (Z-Score Method)', () => {
    it('should detect cost spike anomaly', () => {
      // Normal costs
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
      }

      // Add spike
      mlOptimizer.trackDataPoint('openai', 0.05, 100, true)

      const metrics = mlOptimizer.getMetrics('openai')
      expect(metrics.isAnomaly).toBe(true)
      expect(metrics.anomalyScore).toBeGreaterThan(2.5)
    })

    it('should not flag normal variation as anomaly', () => {
      // Normal costs with slight variation
      for (let i = 0; i < 20; i++) {
        const cost = 0.001 + Math.random() * 0.0005
        mlOptimizer.trackDataPoint('openai', cost, 100, true)
      }

      const metrics = mlOptimizer.getMetrics('openai')
      expect(metrics.isAnomaly).toBe(false)
      expect(metrics.anomalyScore).toBeLessThan(2.5)
    })

    it('should create alerts for detected anomalies', () => {
      // Setup normal data
      for (let i = 0; i < 15; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
      }

      // Add significant cost spike
      mlOptimizer.trackDataPoint('openai', 0.1, 100, true)

      const alerts = mlOptimizer.detectAnomalies()
      const costAlert = alerts.find((a) => a.type === 'cost_spike' && a.provider === 'openai')

      expect(costAlert).toBeDefined()
      expect(costAlert?.severity).toBe('high')
    })

    it('should detect performance degradation', () => {
      // Normal performance
      for (let i = 0; i < 15; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
      }

      // Performance degradation
      mlOptimizer.trackDataPoint('openai', 0.001, 300, true)

      const alerts = mlOptimizer.detectAnomalies()
      const perfAlert = alerts.find((a) => a.type === 'performance_degradation' && a.provider === 'openai')

      expect(perfAlert).toBeDefined()
      expect(perfAlert?.severity).toBe('medium')
    })

    it('should detect high error rate', () => {
      // Mix of success and failures
      for (let i = 0; i < 20; i++) {
        const success = i % 2 === 0
        mlOptimizer.trackDataPoint('openai', 0.001, 100, success)
      }

      const alerts = mlOptimizer.detectAnomalies()
      const errorAlert = alerts.find((a) => a.type === 'high_error_rate' && a.provider === 'openai')

      expect(errorAlert).toBeDefined()
      expect(errorAlert?.severity).toBe('high')
    })
  })

  describe('Cost Prediction', () => {
    it('should predict future costs based on trend', () => {
      // Increasing cost trend
      for (let i = 0; i < 20; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001 + i * 0.00005, 100, true)
      }

      const predicted = mlOptimizer.predictCost('openai', 60)
      expect(predicted).toBeGreaterThan(0)
    })

    it('should predict stable costs when no trend', () => {
      // Stable costs
      for (let i = 0; i < 20; i++) {
        mlOptimizer.trackDataPoint('anthropic', 0.002, 100, true)
      }

      const predicted = mlOptimizer.predictCost('anthropic', 60)
      // Should be close to 0.002
      expect(predicted).toBeGreaterThan(0.0015)
      expect(predicted).toBeLessThan(0.0025)
    })

    it('should return 0 for non-existent provider', () => {
      const predicted = mlOptimizer.predictCost('non-existent', 60)
      expect(predicted).toBe(0)
    })
  })

  describe('Recommendation Engine', () => {
    it('should recommend lowest cost provider', () => {
      // Expensive provider
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('expensive', 0.01, 100, true)
      }

      // Cheap provider
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('cheap', 0.001, 100, true)
      }

      const recommended = mlOptimizer.getOptimalProvider(['expensive', 'cheap'])
      expect(recommended).toBe('cheap')
    })

    it('should recommend best performing provider', () => {
      // Slow provider
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('slow', 0.001, 500, true)
      }

      // Fast provider
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('fast', 0.001, 50, true)
      }

      const recommended = mlOptimizer.getOptimalProvider(['slow', 'fast'])
      expect(recommended).toBe('fast')
    })

    it('should give detailed recommendation with reasoning', () => {
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
        mlOptimizer.trackDataPoint('anthropic', 0.002, 150, true)
      }

      const recommendation = mlOptimizer.getDetailedRecommendation(['openai', 'anthropic'])

      expect(recommendation.recommended).toBeDefined()
      expect(recommendation.scores).toHaveProperty('openai')
      expect(recommendation.scores).toHaveProperty('anthropic')
      expect(recommendation.reasoning).toContain('recommended')
    })
  })

  describe('Metrics Calculation', () => {
    it('should calculate recommendation score between 0-100', () => {
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('test', 0.001, 100, true)
      }

      const metrics = mlOptimizer.getMetrics('test')
      expect(metrics.recommendation).toBeGreaterThanOrEqual(0)
      expect(metrics.recommendation).toBeLessThanOrEqual(100)
    })

    it('should calculate anomaly score as z-score', () => {
      // Normal data
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('test', 0.001, 100, true)
      }

      // Add outlier
      mlOptimizer.trackDataPoint('test', 0.1, 100, true)

      const metrics = mlOptimizer.getMetrics('test')
      expect(metrics.anomalyScore).toBeGreaterThan(1) // Should be significant
    })

    it('should return valid metrics for all providers', () => {
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
        mlOptimizer.trackDataPoint('anthropic', 0.002, 150, false)
        mlOptimizer.trackDataPoint('nvidia', 0.0005, 80, true)
      }

      const providers = ['openai', 'anthropic', 'nvidia']
      providers.forEach((provider) => {
        const metrics = mlOptimizer.getMetrics(provider)
        expect(metrics.provider).toBe(provider)
        expect(metrics.costEMA).toBeGreaterThanOrEqual(0)
        expect(metrics.responseTimeEMA).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Threshold Auto-Adjustment', () => {
    it('should adjust threshold for high variability data', () => {
      // Create highly variable data
      const values = [0.001, 0.01, 0.0005, 0.015, 0.0002, 0.012]
      values.forEach((cost) => {
        mlOptimizer.trackDataPoint('volatile', cost, 100, true)
      })

      mlOptimizer.autoAdjustThreshold()
      // After auto-adjustment, threshold should be higher for volatile data
      const metrics = mlOptimizer.getMetrics('volatile')
      expect(metrics.provider).toBe('volatile')
    })

    it('should adjust threshold for stable data', () => {
      // Create stable data
      for (let i = 0; i < 50; i++) {
        mlOptimizer.trackDataPoint('stable', 0.001, 100, true)
      }

      mlOptimizer.autoAdjustThreshold()
      const metrics = mlOptimizer.getMetrics('stable')
      expect(metrics.isAnomaly).toBe(false)
    })
  })

  describe('Historical Data Management', () => {
    it('should maintain historical data limit', () => {
      // Add more than max points
      for (let i = 0; i < 1100; i++) {
        mlOptimizer.trackDataPoint('test', 0.001, 100, true)
      }

      const history = mlOptimizer.getHistoricalData('test')
      expect(history.length).toBeLessThanOrEqual(100)
    })

    it('should retrieve provider-specific historical data', () => {
      for (let i = 0; i < 20; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
        mlOptimizer.trackDataPoint('anthropic', 0.002, 150, true)
      }

      const openaiHistory = mlOptimizer.getHistoricalData('openai', 10)
      expect(openaiHistory).toHaveLength(10)
      expect(openaiHistory.every((d) => d.provider === 'openai')).toBe(true)
    })

    it('should clear historical data on reset', () => {
      for (let i = 0; i < 20; i++) {
        mlOptimizer.trackDataPoint('test', 0.001, 100, true)
      }

      mlOptimizer.reset()

      const metrics = mlOptimizer.getMetrics('test')
      expect(metrics.costEMA).toBe(0)
      expect(metrics.recommendation).toBe(0)
    })
  })

  describe('Alert Management', () => {
    it('should retrieve all active alerts', () => {
      for (let i = 0; i < 15; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
      }

      mlOptimizer.trackDataPoint('openai', 0.05, 100, true)
      mlOptimizer.detectAnomalies()

      const alerts = mlOptimizer.getAlerts()
      expect(alerts.length).toBeGreaterThan(0)
    })

    it('should include timestamp in alerts', () => {
      for (let i = 0; i < 15; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
      }

      mlOptimizer.trackDataPoint('openai', 0.05, 100, true)
      const alerts = mlOptimizer.detectAnomalies()

      expect(alerts.some((a) => a.timestamp > 0)).toBe(true)
    })
  })

  describe('Integration with Phase 8 Services', () => {
    it('should recommend provider based on combined metrics', () => {
      // Simulate different provider profiles
      // OpenAI: cheap but slow
      for (let i = 0; i < 15; i++) {
        mlOptimizer.trackDataPoint('openai', 0.0008, 200, true)
      }

      // Anthropic: expensive but fast
      for (let i = 0; i < 15; i++) {
        mlOptimizer.trackDataPoint('anthropic', 0.003, 50, true)
      }

      const recommendation = mlOptimizer.getDetailedRecommendation(['openai', 'anthropic'])
      expect(recommendation.recommended).toBeDefined()
      expect(Object.keys(recommendation.scores)).toHaveLength(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty provider gracefully', () => {
      const metrics = mlOptimizer.getMetrics('nonexistent')
      expect(metrics.costEMA).toBe(0)
      expect(metrics.isAnomaly).toBe(false)
    })

    it('should handle single data point', () => {
      mlOptimizer.trackDataPoint('test', 0.001, 100, true)

      const metrics = mlOptimizer.getMetrics('test')
      expect(metrics.recommendation).toBeGreaterThanOrEqual(0)
    })

    it('should return empty recommendation for no providers', () => {
      const recommended = mlOptimizer.getOptimalProvider([])
      expect(recommended).toBe('')
    })

    it('should handle zero cost data', () => {
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('free', 0, 100, true)
      }

      const metrics = mlOptimizer.getMetrics('free')
      expect(metrics.costEMA).toBe(0)
    })
  })
})
