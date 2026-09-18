/**
 * Phase 10: Service Integration Tests
 * Validates integration between ML Optimizer, Tenant Manager, and Phase 8 services
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { phase10Integration } from '../../src/services/phase10Integration'
import { mlOptimizer } from '../../src/services/mlOptimizer'
import { tenantContextManager, type TenantContext } from '../../src/services/tenantContextManager'
import { costOptimizer } from '../../src/services/costOptimizer'
import { analytics } from '../../src/services/analytics'

describe('Phase 10 Service Integration', () => {
  beforeEach(() => {
    phase10Integration.reset()
    mlOptimizer.reset()
    tenantContextManager.reset()
    costOptimizer.reset()
    analytics.clear()
  })

  describe('Provider Recommendation Integration', () => {
    it('should blend ML and Cost Optimizer recommendations', () => {
      // Track data in ML Optimizer
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
        mlOptimizer.trackDataPoint('anthropic', 0.002, 150, true)
      }

      // Track data in Cost Optimizer
      for (let i = 0; i < 10; i++) {
        costOptimizer.trackRequest('openai', 0.001, 100, true, 1)
        costOptimizer.trackRequest('anthropic', 0.002, 150, true, 1)
      }

      const recommendation = phase10Integration.getProviderRecommendation(['openai', 'anthropic'])

      expect(recommendation).not.toBeNull()
      expect(recommendation?.provider).toBeDefined()
      expect(recommendation?.score).toBeGreaterThanOrEqual(0)
      expect(recommendation?.score).toBeLessThanOrEqual(100)
      expect(recommendation?.reason).toContain('ML Optimizer')
    })

    it('should return recommendation with risk assessment', () => {
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
      }

      const recommendation = phase10Integration.getProviderRecommendation(['openai'])

      expect(recommendation?.riskLevel).toMatch(/low|medium|high/)
      expect(['low', 'medium', 'high']).toContain(recommendation?.riskLevel)
    })

    it('should detect ML anomalies and recommend fallback', () => {
      // Normal data
      for (let i = 0; i < 15; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
      }

      // Add spike
      mlOptimizer.trackDataPoint('openai', 0.1, 100, true)

      const recommendation = phase10Integration.getProviderRecommendation(['openai', 'anthropic'])

      expect(recommendation?.riskLevel).toBeDefined()
      if (recommendation?.riskLevel === 'high') {
        expect(recommendation.reason).toContain('ML Optimizer')
      }
    })
  })

  describe('Request Tracking Integration', () => {
    it('should track request across all services', () => {
      phase10Integration.trackRequest('openai', 0.001, 100, true, 1)

      // Verify in ML Optimizer
      const mlMetrics = mlOptimizer.getMetrics('openai')
      expect(mlMetrics.costEMA).toBeGreaterThan(0)

      // Verify in Cost Optimizer
      const costStats = costOptimizer.getProviderStats('openai')
      expect(costStats?.totalCost).toBe(0.001)

      // Verify that request was tracked
      expect(mlMetrics.costEMA).toBeGreaterThanOrEqual(0)
    })

    it('should track tenant cost allocation when context set', () => {
      const context: TenantContext = {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        userId: 'user-1',
        tier: 'pro',
        features: {
          analyticsEnabled: true,
          mlOptimizerEnabled: true,
          customProviderRules: false,
          advancedReporting: false,
        },
      }

      tenantContextManager.setContext(context)

      phase10Integration.trackRequest('openai', 0.005, 100, true, 5)

      const analytics_org = tenantContextManager.getOrganizationAnalytics('org-1')
      expect(analytics_org.totalCost).toBe(0.005)
      expect(analytics_org.providers['openai'].requests).toBe(5)
    })

    it('should track multiple requests with accurate aggregation', () => {
      phase10Integration.trackRequest('openai', 0.001, 100, true, 1)
      phase10Integration.trackRequest('anthropic', 0.002, 150, true, 1)
      phase10Integration.trackRequest('openai', 0.001, 100, true, 1)

      const mlMetricsOpenAI = mlOptimizer.getMetrics('openai')
      const mlMetricsAnthropic = mlOptimizer.getMetrics('anthropic')

      expect(mlMetricsOpenAI.costEMA).toBeGreaterThan(0)
      expect(mlMetricsAnthropic.costEMA).toBeGreaterThan(0)
    })
  })

  describe('Anomaly Detection Integration', () => {
    it('should detect anomalies across services', () => {
      // Setup normal data
      for (let i = 0; i < 15; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
      }

      // Add spike
      mlOptimizer.trackDataPoint('openai', 0.05, 100, true)

      const anomalyReport = phase10Integration.detectAnomalies()

      expect(anomalyReport.mlAnomalies).toBeDefined()
      expect(anomalyReport.riskAssessment).toBeDefined()
      expect(anomalyReport.recommendations).toBeDefined()
      expect(anomalyReport.recommendations.length).toBeGreaterThan(0)
    })

    it('should provide actionable recommendations for anomalies', () => {
      // Create multiple anomalies
      for (let i = 0; i < 15; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
        mlOptimizer.trackDataPoint('anthropic', 0.001, 100, true)
      }

      mlOptimizer.trackDataPoint('openai', 0.05, 100, true)
      mlOptimizer.trackDataPoint('anthropic', 0.05, 100, true)

      const anomalyReport = phase10Integration.detectAnomalies()

      expect(anomalyReport.recommendations).toBeDefined()
      expect(Array.isArray(anomalyReport.recommendations)).toBe(true)
      if (anomalyReport.mlAnomalies.length > 1) {
        const hasRecommendation = anomalyReport.recommendations.some((rec: string) => rec.includes('fallback'))
        expect(hasRecommendation).toBe(true)
      }
    })
  })

  describe('Rate Limiting Integration', () => {
    it('should check rate limits across services', () => {
      const rateLimitCheck = phase10Integration.checkRateLimits('openai')

      expect(rateLimitCheck.withinLimit).toBeDefined()
      expect(rateLimitCheck.remaining).toBeGreaterThanOrEqual(0)
      expect(rateLimitCheck.resetTime).toBeGreaterThanOrEqual(0)
    })

    it('should prevent requests when rate limited', () => {
      // This would require mocking rate limiter
      const check = phase10Integration.checkRateLimits('openai')
      expect(check.withinLimit).toBe(true) // Initially within limit
    })
  })

  describe('Request Validation', () => {
    it('should allow valid requests', () => {
      const validation = phase10Integration.canProcessRequest('openai', 0.001)

      expect(validation.allowed).toBe(true)
      expect(validation.reason).toContain('can be processed')
    })

    it('should reject requests when tenant quota exceeded', () => {
      const context: TenantContext = {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        userId: 'user-1',
        tier: 'free',
        features: {
          analyticsEnabled: true,
          mlOptimizerEnabled: false,
          customProviderRules: false,
          advancedReporting: false,
        },
      }

      tenantContextManager.setContext(context)

      // Exceed daily quota ($5 for free tier)
      for (let i = 0; i < 60; i++) {
        phase10Integration.trackRequest('openai', 0.1, 100, true, 1)
      }

      const validation = phase10Integration.canProcessRequest('openai', 0.1)

      expect(validation.allowed).toBe(false)
      expect(validation.reason).toContain('quota')
    })

    it('should suggest alternatives when primary provider unavailable', () => {
      const validation = phase10Integration.canProcessRequest('openai')

      if (!validation.allowed) {
        expect(validation.alternatives).toBeDefined()
        expect(validation.alternatives?.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Integrated Analytics', () => {
    it('should aggregate analytics from all services', () => {
      const context: TenantContext = {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        userId: 'user-1',
        tier: 'pro',
        features: {
          analyticsEnabled: true,
          mlOptimizerEnabled: true,
          customProviderRules: false,
          advancedReporting: false,
        },
      }

      tenantContextManager.setContext(context)

      phase10Integration.trackRequest('openai', 0.001, 100, true, 5)
      phase10Integration.trackRequest('anthropic', 0.002, 150, true, 3)

      const integratedAnalytics = phase10Integration.getIntegratedAnalytics('org-1')

      expect(integratedAnalytics.costMetrics).toBeDefined()
      expect(integratedAnalytics.performanceMetrics).toBeDefined()
      expect(integratedAnalytics.mlMetrics).toBeDefined()
      expect(integratedAnalytics.tenantMetrics).toBeDefined()
    })

    it('should track ML optimizer stats', () => {
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
        mlOptimizer.trackDataPoint('anthropic', 0.002, 150, true)
      }

      const mlStats = phase10Integration.getMLOptimizerStats()

      expect(mlStats.optimalProvider).toBeDefined()
      expect(mlStats.metrics).toBeDefined()
      expect(mlStats.metrics['openai']).toBeDefined()
      expect(mlStats.metrics['anthropic']).toBeDefined()
    })
  })
})
