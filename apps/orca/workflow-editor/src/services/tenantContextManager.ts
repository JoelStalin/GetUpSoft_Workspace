/**
 * Phase 10: Multi-Tenant Context Manager
 * Manages organization-specific isolation, quotas, and cost allocation
 */

interface TenantQuota {
  maxApiCallsPerMinute: number
  maxCostPerMonth: number
  maxCostPerDay: number
  storageGBLimit: number
  tier: 'free' | 'pro' | 'enterprise'
}

interface TenantMetrics {
  tenantId: string
  organizationId: string
  apiCallsThisMinute: number
  costThisMonth: number
  costThisDay: number
  storageUsedGB: number
}

interface TenantContext {
  tenantId: string
  organizationId: string
  userId: string
  tier: 'free' | 'pro' | 'enterprise'
  features: {
    analyticsEnabled: boolean
    mlOptimizerEnabled: boolean
    customProviderRules: boolean
    advancedReporting: boolean
  }
}

interface CostAllocation {
  tenantId: string
  organizationId: string
  provider: string
  cost: number
  timestamp: number
  requestCount: number
}

/**
 * Tenant Context Manager Service
 * Handles multi-tenant isolation and quota enforcement
 */
class TenantContextManagerService {
  private currentContext: TenantContext | null = null
  private quotas: Map<string, TenantQuota> = new Map()
  private metrics: Map<string, TenantMetrics> = new Map()
  private costAllocations: CostAllocation[] = []
  private contextStack: TenantContext[] = []

  // Default quotas by tier
  private defaultQuotas: Record<string, TenantQuota> = {
    free: {
      maxApiCallsPerMinute: 10,
      maxCostPerMonth: 50,
      maxCostPerDay: 5,
      storageGBLimit: 1,
      tier: 'free',
    },
    pro: {
      maxApiCallsPerMinute: 100,
      maxCostPerMonth: 500,
      maxCostPerDay: 50,
      storageGBLimit: 10,
      tier: 'pro',
    },
    enterprise: {
      maxApiCallsPerMinute: 1000,
      maxCostPerMonth: 10000,
      maxCostPerDay: 500,
      storageGBLimit: 100,
      tier: 'enterprise',
    },
  }

  /**
   * Set current tenant context
   */
  setContext(context: TenantContext): void {
    this.currentContext = context

    // Initialize metrics for new tenant
    if (!this.metrics.has(context.tenantId)) {
      this.metrics.set(context.tenantId, {
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        apiCallsThisMinute: 0,
        costThisMonth: 0,
        costThisDay: 0,
        storageUsedGB: 0,
      })
    }

    // Initialize quota for organization
    if (!this.quotas.has(context.organizationId)) {
      this.quotas.set(context.organizationId, this.defaultQuotas[context.tier])
    }
  }

  /**
   * Get current tenant context
   */
  getContext(): TenantContext | null {
    return this.currentContext
  }

  /**
   * Push context to stack (for nested operations)
   */
  pushContext(context: TenantContext): void {
    if (this.currentContext) {
      this.contextStack.push(this.currentContext)
    }
    this.setContext(context)
  }

  /**
   * Pop context from stack
   */
  popContext(): TenantContext | null {
    const popped = this.currentContext
    this.currentContext = this.contextStack.pop() || null
    return popped
  }

  /**
   * Verify tenant has access to feature
   */
  hasFeatureAccess(feature: keyof TenantContext['features']): boolean {
    if (!this.currentContext) return false
    return this.currentContext.features[feature]
  }

  /**
   * Check if organization is within quota
   */
  isWithinQuota(quotaType: keyof TenantQuota): boolean {
    if (!this.currentContext) return false

    const quota = this.quotas.get(this.currentContext.organizationId)
    if (!quota) return false

    const metrics = this.metrics.get(this.currentContext.tenantId)
    if (!metrics) return false

    switch (quotaType) {
      case 'maxApiCallsPerMinute':
        return metrics.apiCallsThisMinute < quota.maxApiCallsPerMinute
      case 'maxCostPerMonth':
        return metrics.costThisMonth < quota.maxCostPerMonth
      case 'maxCostPerDay':
        return metrics.costThisDay < quota.maxCostPerDay
      case 'storageGBLimit':
        return metrics.storageUsedGB < quota.storageGBLimit
      default:
        return true
    }
  }

  /**
   * Track API call against quota
   */
  trackApiCall(cost: number = 0): boolean {
    if (!this.currentContext) return false
    if (!this.isWithinQuota('maxApiCallsPerMinute')) return false
    if (!this.isWithinQuota('maxCostPerDay')) return false

    const metrics = this.metrics.get(this.currentContext.tenantId)
    if (!metrics) return false

    metrics.apiCallsThisMinute += 1
    metrics.costThisDay += cost
    metrics.costThisMonth += cost

    return true
  }

  /**
   * Record cost allocation for billing
   */
  recordCostAllocation(provider: string, cost: number, requestCount: number = 1): void {
    if (!this.currentContext) return

    this.costAllocations.push({
      tenantId: this.currentContext.tenantId,
      organizationId: this.currentContext.organizationId,
      provider,
      cost,
      timestamp: Date.now(),
      requestCount,
    })
  }

  /**
   * Get organization-specific analytics (isolation)
   */
  getOrganizationAnalytics(organizationId?: string): {
    totalCost: number
    totalApiCalls: number
    providers: Record<string, { cost: number; requests: number }>
  } {
    const orgId = organizationId || this.currentContext?.organizationId

    if (!orgId) {
      return {
        totalCost: 0,
        totalApiCalls: 0,
        providers: {},
      }
    }

    const allocations = this.costAllocations.filter((a) => a.organizationId === orgId)

    const providers: Record<string, { cost: number; requests: number }> = {}
    let totalCost = 0
    let totalRequests = 0

    for (const allocation of allocations) {
      totalCost += allocation.cost
      totalRequests += allocation.requestCount

      if (!providers[allocation.provider]) {
        providers[allocation.provider] = { cost: 0, requests: 0 }
      }
      providers[allocation.provider].cost += allocation.cost
      providers[allocation.provider].requests += allocation.requestCount
    }

    return {
      totalCost,
      totalApiCalls: totalRequests,
      providers,
    }
  }

  /**
   * Get tenant-specific metrics
   */
  getTenantMetrics(tenantId?: string): TenantMetrics | null {
    const id = tenantId || this.currentContext?.tenantId
    return (id && this.metrics.get(id)) || null
  }

  /**
   * Reset minute counter (called every minute)
   */
  resetMinuteCounter(): void {
    for (const metrics of this.metrics.values()) {
      metrics.apiCallsThisMinute = 0
    }
  }

  /**
   * Reset day counter (called at midnight)
   */
  resetDayCounter(): void {
    for (const metrics of this.metrics.values()) {
      metrics.costThisDay = 0
    }
  }

  /**
   * Reset month counter (called on first of month)
   */
  resetMonthCounter(): void {
    for (const metrics of this.metrics.values()) {
      metrics.costThisMonth = 0
    }
  }

  /**
   * Get quota for organization
   */
  getQuota(organizationId?: string): TenantQuota | null {
    const orgId = organizationId || this.currentContext?.organizationId
    return (orgId && this.quotas.get(orgId)) || null
  }

  /**
   * Set custom quota for organization
   */
  setQuota(organizationId: string, quota: TenantQuota): void {
    this.quotas.set(organizationId, quota)
  }

  /**
   * Get quota usage percentage
   */
  getQuotaUsagePercentage(quotaType: keyof TenantQuota): number {
    if (!this.currentContext) return 0

    const quota = this.quotas.get(this.currentContext.organizationId)
    const metrics = this.metrics.get(this.currentContext.tenantId)

    if (!quota || !metrics) return 0

    const quotaValue = quota[quotaType]
    let usedValue = 0

    switch (quotaType) {
      case 'maxApiCallsPerMinute':
        usedValue = metrics.apiCallsThisMinute
        break
      case 'maxCostPerMonth':
        usedValue = metrics.costThisMonth
        break
      case 'maxCostPerDay':
        usedValue = metrics.costThisDay
        break
      case 'storageGBLimit':
        usedValue = metrics.storageUsedGB
        break
    }

    return (usedValue / (quotaValue as number)) * 100
  }

  /**
   * Get cost allocation report for organization
   */
  getCostAllocationReport(organizationId?: string, startTime?: number, endTime?: number) {
    const orgId = organizationId || this.currentContext?.organizationId

    if (!orgId) return []

    let allocations = this.costAllocations.filter((a) => a.organizationId === orgId)

    if (startTime) {
      allocations = allocations.filter((a) => a.timestamp >= startTime)
    }

    if (endTime) {
      allocations = allocations.filter((a) => a.timestamp <= endTime)
    }

    return allocations.map((a) => ({
      ...a,
      costPerRequest: a.requestCount > 0 ? a.cost / a.requestCount : 0,
    }))
  }

  /**
   * Validate tenant can perform action
   */
  validateTenantAction(action: 'analytics' | 'ml_optimizer' | 'custom_rules' | 'advanced_reporting'): boolean {
    if (!this.currentContext) return false

    switch (action) {
      case 'analytics':
        return this.currentContext.features.analyticsEnabled
      case 'ml_optimizer':
        return this.currentContext.features.mlOptimizerEnabled
      case 'custom_rules':
        return this.currentContext.features.customProviderRules
      case 'advanced_reporting':
        return this.currentContext.features.advancedReporting
      default:
        return false
    }
  }

  /**
   * Clear all data (testing)
   */
  reset(): void {
    this.currentContext = null
    this.quotas.clear()
    this.metrics.clear()
    this.costAllocations = []
    this.contextStack = []
  }
}

// Export singleton instance
export const tenantContextManager = new TenantContextManagerService()

export type { TenantContext, TenantQuota, TenantMetrics, CostAllocation }
export default TenantContextManagerService
