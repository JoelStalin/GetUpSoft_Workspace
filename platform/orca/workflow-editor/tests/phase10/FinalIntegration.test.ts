/**
 * Phase 10: Final Integration & Deployment Tests
 * Validates complete workflows, performance, backward compatibility, and deployment readiness
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { phase10Integration } from '../../src/services/phase10Integration'
import { mlOptimizer } from '../../src/services/mlOptimizer'
import { tenantContextManager, type TenantContext } from '../../src/services/tenantContextManager'
import { costOptimizer } from '../../src/services/costOptimizer'
import { analytics } from '../../src/services/analytics'

describe('Phase 10 Final Integration & Deployment', () => {
  beforeEach(() => {
    phase10Integration.reset()
    mlOptimizer.reset()
    tenantContextManager.reset()
    costOptimizer.reset()
    analytics.clear()
  })

  describe('Complete Multi-Tenant Workflow', () => {
    it('should handle complete request workflow with multi-tenancy', () => {
      // Setup two tenant contexts
      const tenant1: TenantContext = {
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

      const tenant2: TenantContext = {
        tenantId: 'tenant-2',
        organizationId: 'org-2',
        userId: 'user-2',
        tier: 'pro',
        features: {
          analyticsEnabled: true,
          mlOptimizerEnabled: true,
          customProviderRules: false,
          advancedReporting: false,
        },
      }

      // Process requests for both tenants
      tenantContextManager.setContext(tenant1)
      for (let i = 0; i < 5; i++) {
        phase10Integration.trackRequest('openai', 0.001, 100, true, 1)
      }

      tenantContextManager.setContext(tenant2)
      for (let i = 0; i < 5; i++) {
        phase10Integration.trackRequest('anthropic', 0.002, 150, true, 1)
      }

      // Verify isolation
      const org1Analytics = tenantContextManager.getOrganizationAnalytics('org-1')
      const org2Analytics = tenantContextManager.getOrganizationAnalytics('org-2')

      expect(org1Analytics.totalCost).toBe(0.005)
      expect(org2Analytics.totalCost).toBe(0.01)
      expect(org1Analytics.providers['openai']).toBeDefined()
      expect(org2Analytics.providers['anthropic']).toBeDefined()
    })

    it('should maintain data consistency across tenant operations', () => {
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

      // Track multiple requests
      const requests = [
        { provider: 'openai', cost: 0.001 },
        { provider: 'anthropic', cost: 0.002 },
        { provider: 'openai', cost: 0.001 },
        { provider: 'anthropic', cost: 0.002 },
      ]

      let expectedTotal = 0
      for (const req of requests) {
        phase10Integration.trackRequest(req.provider, req.cost, 100, true, 1)
        expectedTotal += req.cost
      }

      const analytics_org = tenantContextManager.getOrganizationAnalytics('org-1')
      expect(analytics_org.totalCost).toBe(expectedTotal)
    })
  })

  describe('Performance Under Load', () => {
    it('should process 100 requests within acceptable time', () => {
      const startTime = Date.now()

      for (let i = 0; i < 100; i++) {
        phase10Integration.trackRequest('openai', 0.001, 100, true, 1)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should process 100 requests in under 1 second
      expect(duration).toBeLessThan(1000)
    })

    it('should maintain performance with multiple providers', () => {
      const providers = ['openai', 'anthropic', 'nvidia', 'google', 'meta']
      const startTime = Date.now()

      for (let i = 0; i < 50; i++) {
        providers.forEach((provider) => {
          phase10Integration.trackRequest(provider, 0.001, 100, true, 1)
        })
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should process 250 requests (50 * 5 providers) in under 2 seconds
      expect(duration).toBeLessThan(2000)
    })

    it('should handle anomaly detection under load', () => {
      // Create load with anomalies
      for (let i = 0; i < 50; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
      }

      // Add anomalies
      mlOptimizer.trackDataPoint('openai', 0.1, 100, true)
      mlOptimizer.trackDataPoint('openai', 0.05, 100, true)

      const startTime = Date.now()
      const anomalies = phase10Integration.detectAnomalies()
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(100) // Should complete quickly
      expect(anomalies.mlAnomalies.length).toBeGreaterThan(0)
    })
  })

  describe('Backward Compatibility with Phase 8/9', () => {
    it('should maintain Phase 8 rate limiting compatibility', () => {
      // Phase 8 rate limiter should still work
      const check = phase10Integration.checkRateLimits('openai')
      expect(check.withinLimit).toBeDefined()
      expect(check.recommendation).toBeDefined()
    })

    it('should maintain Phase 8 cost optimizer integration', () => {
      // Cost optimizer should still function
      phase10Integration.trackRequest('openai', 0.001, 100, true, 1)

      const stats = costOptimizer.getProviderStats('openai')
      expect(stats).toBeDefined()
      expect(stats?.totalCost).toBeGreaterThan(0)
    })

    it('should maintain Phase 8 analytics integration', () => {
      // Analytics service should still track events
      phase10Integration.trackRequest('openai', 0.001, 100, true, 1)

      const analyticsStats = analytics.getStats()
      expect(analyticsStats).toBeDefined()
    })

    it('should support Phase 8 request workflows', () => {
      // Existing workflows should continue to work
      const providers = ['openai', 'anthropic']

      // Get recommendation
      const recommendation = phase10Integration.getProviderRecommendation(providers)
      expect(recommendation).not.toBeNull()

      // Track request
      phase10Integration.trackRequest(recommendation!.provider, 0.001, 100, true, 1)

      // Verify tracking worked
      const metrics = mlOptimizer.getMetrics(recommendation!.provider)
      expect(metrics.costEMA).toBeGreaterThan(0)
    })
  })

  describe('Deployment Readiness', () => {
    it('should have all services initialized', () => {
      // All Phase 10 services should be available
      expect(phase10Integration).toBeDefined()
      expect(mlOptimizer).toBeDefined()
      expect(tenantContextManager).toBeDefined()
      expect(costOptimizer).toBeDefined()
      expect(analytics).toBeDefined()
    })

    it('should handle graceful degradation', () => {
      // System should work even if some features unavailable
      const context: TenantContext = {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        userId: 'user-1',
        tier: 'free',
        features: {
          analyticsEnabled: true,
          mlOptimizerEnabled: false, // ML disabled
          customProviderRules: false,
          advancedReporting: false,
        },
      }

      tenantContextManager.setContext(context)

      // Should still work with fallback
      const recommendation = phase10Integration.getProviderRecommendation(['openai'])
      expect(recommendation).not.toBeNull()
    })

    it('should validate configuration before deployment', () => {
      // Check critical configurations
      const checks = {
        mlOptimizerAvailable: mlOptimizer !== null,
        tenantManagerAvailable: tenantContextManager !== null,
        integrationLayerAvailable: phase10Integration !== null,
        costOptimizerAvailable: costOptimizer !== null,
        analyticsAvailable: analytics !== null,
      }

      Object.values(checks).forEach((check) => {
        expect(check).toBe(true)
      })
    })

    it('should support multiple deployment scenarios', () => {
      // Single tenant mode
      const singleTenantContext: TenantContext = {
        tenantId: 'admin',
        organizationId: 'single-tenant',
        userId: 'admin',
        tier: 'enterprise',
        features: {
          analyticsEnabled: true,
          mlOptimizerEnabled: true,
          customProviderRules: true,
          advancedReporting: true,
        },
      }

      tenantContextManager.setContext(singleTenantContext)
      phase10Integration.trackRequest('openai', 0.001, 100, true, 1)

      const stats = tenantContextManager.getOrganizationAnalytics('single-tenant')
      expect(stats.totalCost).toBe(0.001)

      // System should handle both single and multi-tenant modes
      expect(tenantContextManager.getContext()?.tier).toBe('enterprise')
    })

    it('should provide clear error messages for deployment issues', () => {
      // Error handling should be informative
      const validation = phase10Integration.canProcessRequest('openai')
      expect(validation.reason).toBeDefined()
      expect(typeof validation.reason).toBe('string')
    })
  })

  describe('Integration Completeness', () => {
    it('should integrate all Phase 10 components', () => {
      // All three Phase 10 components should work together
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

      // 1. ML Optimizer tracks data
      for (let i = 0; i < 10; i++) {
        mlOptimizer.trackDataPoint('openai', 0.001, 100, true)
      }

      // 2. Integration provides recommendations
      const recommendation = phase10Integration.getProviderRecommendation(['openai'])
      expect(recommendation?.provider).toBe('openai')

      // 3. Tenant manager tracks allocation
      phase10Integration.trackRequest('openai', 0.001, 100, true, 1)
      const analytics_org = tenantContextManager.getOrganizationAnalytics('org-1')
      expect(analytics_org.totalCost).toBeGreaterThan(0)
    })

    it('should provide comprehensive analytics across all services', () => {
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

      // Generate data across all services
      for (let i = 0; i < 10; i++) {
        phase10Integration.trackRequest('openai', 0.001, 100, true, 1)
      }

      // Get integrated analytics
      const integratedAnalytics = phase10Integration.getIntegratedAnalytics('org-1')

      expect(integratedAnalytics.costMetrics).toBeDefined()
      expect(integratedAnalytics.performanceMetrics).toBeDefined()
      expect(integratedAnalytics.mlMetrics).toBeDefined()
      expect(integratedAnalytics.tenantMetrics).toBeDefined()
    })
  })
})
