/**
 * Phase 10: Multi-Tenant Context Manager Tests
 * Validates tenant isolation, quotas, and cost allocation
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { tenantContextManager, type TenantContext } from '../../src/services/tenantContextManager'

describe('Phase 10 Multi-Tenant Support: Tenant Context Manager', () => {
  beforeEach(() => {
    tenantContextManager.reset()
  })

  describe('Context Management', () => {
    it('should set and retrieve current context', () => {
      const context: TenantContext = {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        userId: 'user-1',
        tier: 'pro',
        features: {
          analyticsEnabled: true,
          mlOptimizerEnabled: true,
          customProviderRules: true,
          advancedReporting: true,
        },
      }

      tenantContextManager.setContext(context)
      const retrieved = tenantContextManager.getContext()

      expect(retrieved).toEqual(context)
    })

    it('should support context stack operations', () => {
      const context1: TenantContext = {
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

      const context2: TenantContext = {
        tenantId: 'tenant-2',
        organizationId: 'org-2',
        userId: 'user-2',
        tier: 'enterprise',
        features: {
          analyticsEnabled: true,
          mlOptimizerEnabled: true,
          customProviderRules: true,
          advancedReporting: true,
        },
      }

      tenantContextManager.setContext(context1)
      tenantContextManager.pushContext(context2)

      expect(tenantContextManager.getContext()).toEqual(context2)

      const popped = tenantContextManager.popContext()
      expect(popped).toEqual(context2)
      expect(tenantContextManager.getContext()).toEqual(context1)
    })

    it('should handle null context gracefully', () => {
      expect(tenantContextManager.getContext()).toBeNull()
    })
  })

  describe('Feature Access Control', () => {
    it('should verify feature access for pro tier', () => {
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

      expect(tenantContextManager.hasFeatureAccess('analyticsEnabled')).toBe(true)
      expect(tenantContextManager.hasFeatureAccess('mlOptimizerEnabled')).toBe(true)
      expect(tenantContextManager.hasFeatureAccess('customProviderRules')).toBe(false)
      expect(tenantContextManager.hasFeatureAccess('advancedReporting')).toBe(false)
    })

    it('should verify feature access for enterprise tier', () => {
      const context: TenantContext = {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        userId: 'user-1',
        tier: 'enterprise',
        features: {
          analyticsEnabled: true,
          mlOptimizerEnabled: true,
          customProviderRules: true,
          advancedReporting: true,
        },
      }

      tenantContextManager.setContext(context)

      expect(tenantContextManager.hasFeatureAccess('analyticsEnabled')).toBe(true)
      expect(tenantContextManager.hasFeatureAccess('customProviderRules')).toBe(true)
      expect(tenantContextManager.hasFeatureAccess('advancedReporting')).toBe(true)
    })

    it('should return false when no context is set', () => {
      expect(tenantContextManager.hasFeatureAccess('analyticsEnabled')).toBe(false)
    })
  })

  describe('Quota Management', () => {
    it('should enforce api calls per minute quota', () => {
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

      // Free tier has max 10 calls per minute
      for (let i = 0; i < 10; i++) {
        expect(tenantContextManager.trackApiCall(0.001)).toBe(true)
      }

      // 11th call should fail
      expect(tenantContextManager.trackApiCall(0.001)).toBe(false)
    })

    it('should enforce daily cost quota', () => {
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

      // Pro tier has max $50 per day
      // Make calls that cost total of $50
      const callsNeeded = Math.ceil(50 / 0.1)
      for (let i = 0; i < callsNeeded; i++) {
        tenantContextManager.trackApiCall(0.1)
      }

      // Next call should fail
      expect(tenantContextManager.trackApiCall(0.01)).toBe(false)
    })

    it('should check quota before allowing operations', () => {
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

      // Use up quota
      for (let i = 0; i < 10; i++) {
        tenantContextManager.trackApiCall(0.001)
      }

      expect(tenantContextManager.isWithinQuota('maxApiCallsPerMinute')).toBe(false)
      expect(tenantContextManager.isWithinQuota('maxCostPerDay')).toBe(true)
    })
  })

  describe('Cost Tracking and Allocation', () => {
    it('should track API calls with costs', () => {
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

      expect(tenantContextManager.trackApiCall(0.001)).toBe(true)
      expect(tenantContextManager.trackApiCall(0.002)).toBe(true)
      expect(tenantContextManager.trackApiCall(0.003)).toBe(true)

      const metrics = tenantContextManager.getTenantMetrics()
      expect(metrics?.costThisDay).toBe(0.006)
      expect(metrics?.apiCallsThisMinute).toBe(3)
    })

    it('should record cost allocations by provider', () => {
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

      tenantContextManager.recordCostAllocation('openai', 0.002, 5)
      tenantContextManager.recordCostAllocation('anthropic', 0.001, 3)

      const analytics = tenantContextManager.getOrganizationAnalytics()
      expect(analytics.totalCost).toBe(0.003)
      expect(analytics.totalApiCalls).toBe(8)
      expect(analytics.providers['openai'].cost).toBe(0.002)
      expect(analytics.providers['anthropic'].cost).toBe(0.001)
    })

    it('should isolate cost data between organizations', () => {
      const context1: TenantContext = {
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

      const context2: TenantContext = {
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

      tenantContextManager.setContext(context1)
      tenantContextManager.recordCostAllocation('openai', 0.005, 5)

      tenantContextManager.setContext(context2)
      tenantContextManager.recordCostAllocation('openai', 0.003, 3)

      const analytics1 = tenantContextManager.getOrganizationAnalytics('org-1')
      const analytics2 = tenantContextManager.getOrganizationAnalytics('org-2')

      expect(analytics1.totalCost).toBe(0.005)
      expect(analytics2.totalCost).toBe(0.003)
    })
  })

  describe('Metrics and Counters', () => {
    it('should get tenant-specific metrics', () => {
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
      tenantContextManager.trackApiCall(0.005)
      tenantContextManager.trackApiCall(0.003)

      const metrics = tenantContextManager.getTenantMetrics()
      expect(metrics?.tenantId).toBe('tenant-1')
      expect(metrics?.organizationId).toBe('org-1')
      expect(metrics?.apiCallsThisMinute).toBe(2)
      expect(metrics?.costThisDay).toBe(0.008)
    })

    it('should reset minute counter', () => {
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
      tenantContextManager.trackApiCall(0.001)
      expect(tenantContextManager.getTenantMetrics()?.apiCallsThisMinute).toBe(1)

      tenantContextManager.resetMinuteCounter()
      expect(tenantContextManager.getTenantMetrics()?.apiCallsThisMinute).toBe(0)
    })

    it('should reset day counter', () => {
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
      tenantContextManager.trackApiCall(0.010)
      expect(tenantContextManager.getTenantMetrics()?.costThisDay).toBe(0.01)

      tenantContextManager.resetDayCounter()
      expect(tenantContextManager.getTenantMetrics()?.costThisDay).toBe(0)
    })
  })

  describe('Quota Usage Calculation', () => {
    it('should calculate quota usage percentage', () => {
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

      // Free tier: 10 calls per minute
      for (let i = 0; i < 5; i++) {
        tenantContextManager.trackApiCall(0.001)
      }

      const usage = tenantContextManager.getQuotaUsagePercentage('maxApiCallsPerMinute')
      expect(usage).toBe(50)
    })

    it('should show 0% usage with no context', () => {
      const usage = tenantContextManager.getQuotaUsagePercentage('maxApiCallsPerMinute')
      expect(usage).toBe(0)
    })
  })

  describe('Custom Quotas', () => {
    it('should set custom quota for organization', () => {
      const customQuota = {
        maxApiCallsPerMinute: 50,
        maxCostPerMonth: 1000,
        maxCostPerDay: 100,
        storageGBLimit: 50,
        tier: 'enterprise' as const,
      }

      tenantContextManager.setQuota('org-1', customQuota)
      const quota = tenantContextManager.getQuota()

      // Set context to test
      const context: TenantContext = {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        userId: 'user-1',
        tier: 'enterprise',
        features: {
          analyticsEnabled: true,
          mlOptimizerEnabled: true,
          customProviderRules: true,
          advancedReporting: true,
        },
      }

      tenantContextManager.setContext(context)
      const retrievedQuota = tenantContextManager.getQuota()

      expect(retrievedQuota?.maxApiCallsPerMinute).toBe(50)
      expect(retrievedQuota?.maxCostPerMonth).toBe(1000)
    })
  })

  describe('Cost Allocation Reports', () => {
    it('should generate cost allocation report for organization', () => {
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

      tenantContextManager.recordCostAllocation('openai', 0.010, 5)
      tenantContextManager.recordCostAllocation('anthropic', 0.006, 3)
      tenantContextManager.recordCostAllocation('openai', 0.004, 2)

      const report = tenantContextManager.getCostAllocationReport()

      expect(report).toHaveLength(3)
      expect(report[0].provider).toBe('openai')
      expect(report[0].costPerRequest).toBe(0.002)
    })

    it('should filter report by time range', () => {
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

      const now = Date.now()
      tenantContextManager.recordCostAllocation('openai', 0.010, 5)

      // Get report with time range covering only first allocation
      const report = tenantContextManager.getCostAllocationReport('org-1', now - 1000, now + 1000)
      expect(report.length).toBeGreaterThan(0)
      expect(report[0].provider).toBe('openai')
    })
  })

  describe('Tenant Action Validation', () => {
    it('should validate tenant can perform analytics action', () => {
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

      expect(tenantContextManager.validateTenantAction('analytics')).toBe(true)
      expect(tenantContextManager.validateTenantAction('ml_optimizer')).toBe(false)
      expect(tenantContextManager.validateTenantAction('custom_rules')).toBe(false)
      expect(tenantContextManager.validateTenantAction('advanced_reporting')).toBe(false)
    })

    it('should validate enterprise has all features', () => {
      const context: TenantContext = {
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        userId: 'user-1',
        tier: 'enterprise',
        features: {
          analyticsEnabled: true,
          mlOptimizerEnabled: true,
          customProviderRules: true,
          advancedReporting: true,
        },
      }

      tenantContextManager.setContext(context)

      expect(tenantContextManager.validateTenantAction('analytics')).toBe(true)
      expect(tenantContextManager.validateTenantAction('ml_optimizer')).toBe(true)
      expect(tenantContextManager.validateTenantAction('custom_rules')).toBe(true)
      expect(tenantContextManager.validateTenantAction('advanced_reporting')).toBe(true)
    })

    it('should return false when no context set', () => {
      expect(tenantContextManager.validateTenantAction('analytics')).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple tenants concurrently', () => {
      const context1: TenantContext = {
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

      const context2: TenantContext = {
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

      tenantContextManager.setContext(context1)
      tenantContextManager.trackApiCall(0.001)

      tenantContextManager.pushContext(context2)
      tenantContextManager.trackApiCall(0.002)

      const metrics1 = tenantContextManager.getTenantMetrics('tenant-1')
      const metrics2 = tenantContextManager.getTenantMetrics('tenant-2')

      expect(metrics1?.costThisDay).toBe(0.001)
      expect(metrics2?.costThisDay).toBe(0.002)
    })

    it('should handle tier-specific feature defaults', () => {
      const freeContext: TenantContext = {
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

      tenantContextManager.setContext(freeContext)
      const freeQuota = tenantContextManager.getQuota()
      expect(freeQuota?.maxApiCallsPerMinute).toBe(10)
      expect(freeQuota?.maxCostPerMonth).toBe(50)
    })
  })
})
