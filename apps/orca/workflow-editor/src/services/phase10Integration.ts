/**
 * Phase 10: Service Integration
 * Integrates ML Optimizer, Tenant Context Manager, and Analytics Dashboard with Phase 8 services
 */

import { mlOptimizer, type MLMetrics } from './mlOptimizer'
import { tenantContextManager, type TenantContext } from './tenantContextManager'
import { costOptimizer } from './costOptimizer'
import { analytics } from './analytics'
import { rateLimitManager } from './rateLimitManager'

interface Phase10ProviderRecommendation {
  provider: string
  score: number
  reason: string
  mlMetrics: MLMetrics
  costEstimate: number
  costPerRequest: number
  riskLevel: 'low' | 'medium' | 'high'
}

interface IntegrationConfig {
  enableMLOptimization: boolean
  enableTenantIsolation: boolean
  enableCostPrediction: boolean
  mlWeighting: number // 0-1, how much to weight ML recommendations vs cost optimizer
}

/**
 * Phase 10 Service Integration
 * Coordinates between all Phase 8, Phase 9, and Phase 10 services
 */
class Phase10IntegrationService {
  private config: IntegrationConfig = {
    enableMLOptimization: true,
    enableTenantIsolation: true,
    enableCostPrediction: true,
    mlWeighting: 0.6,
  }

  private lastProviderRecommendation: Map<string, Phase10ProviderRecommendation> = new Map()

  /**
   * Initialize integration with configuration
   */
  initialize(config: Partial<IntegrationConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get provider recommendation using ML + Cost Optimizer
   * Combines ML Optimizer predictions with Phase 8 cost optimization
   */
  getProviderRecommendation(providers: string[]): Phase10ProviderRecommendation | null {
    if (providers.length === 0) return null

    // Check tenant context and feature access
    const context = tenantContextManager.getContext()
    if (context && !tenantContextManager.validateTenantAction('ml_optimizer')) {
      // Fallback to cost optimizer only if ML optimizer not available
      return this.fallbackToCostOptimizer(providers, context)
    }

    // Get ML Optimizer recommendation
    const mlRecommendation = mlOptimizer.getDetailedRecommendation(providers)
    const mlMetrics = mlOptimizer.getMetrics(mlRecommendation.recommended)

    // Get Cost Optimizer recommendation
    const costStats = costOptimizer.getProviderStats(mlRecommendation.recommended)

    // Calculate blended score
    const mlScore = mlMetrics.recommendation // 0-100
    const costScore = costStats ? (costStats.totalRequests > 0 ? 100 - Math.min(100, costStats.totalCost * 1000) : 50) : 50
    const blendedScore = mlScore * this.config.mlWeighting + costScore * (1 - this.config.mlWeighting)

    // Predict cost
    const predictedCost = mlOptimizer.predictCost(mlRecommendation.recommended)
    const costPerRequest = predictedCost > 0 ? predictedCost / (costStats?.totalRequests || 1) : 0

    // Determine risk level based on anomaly score
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (mlMetrics.anomalyScore > 3) {
      riskLevel = 'high'
    } else if (mlMetrics.anomalyScore > 2) {
      riskLevel = 'medium'
    }

    const recommendation: Phase10ProviderRecommendation = {
      provider: mlRecommendation.recommended,
      score: Math.round(blendedScore),
      reason: `ML Optimizer (${mlScore}/100) + Cost Analysis (${Math.round(costScore)}/100) = ${Math.round(blendedScore)}/100`,
      mlMetrics,
      costEstimate: predictedCost,
      costPerRequest,
      riskLevel,
    }

    // Cache recommendation
    this.lastProviderRecommendation.set(mlRecommendation.recommended, recommendation)

    return recommendation
  }

  /**
   * Fallback to cost optimizer when ML optimizer not available
   */
  private fallbackToCostOptimizer(
    providers: string[],
    context: TenantContext | null,
  ): Phase10ProviderRecommendation | null {
    let bestProvider = providers[0]
    let bestScore = 0

    for (const provider of providers) {
      const stats = costOptimizer.getProviderStats(provider)
      const score = stats ? 100 - Math.min(100, stats.totalCost * 1000) : 50
      if (score > bestScore) {
        bestScore = score
        bestProvider = provider
      }
    }

    // Get ML metrics even if not enabled, for reference
    const mlMetrics = mlOptimizer.getMetrics(bestProvider)

    return {
      provider: bestProvider,
      score: Math.round(bestScore),
      reason: `Cost Optimizer recommendation (ML disabled ${context ? 'for tier' : 'globally'})`,
      mlMetrics,
      costEstimate: 0,
      costPerRequest: 0,
      riskLevel: 'low',
    }
  }

  /**
   * Track request through integrated services
   */
  trackRequest(
    provider: string,
    cost: number,
    responseTime: number,
    success: boolean,
    requestCount: number = 1,
  ): void {
    // Track in ML Optimizer
    if (this.config.enableMLOptimization) {
      mlOptimizer.trackDataPoint(provider, cost, responseTime, success)
    }

    // Track in Cost Optimizer (Phase 8)
    costOptimizer.trackRequest(provider, cost, responseTime, success, requestCount)

    // Track in Analytics (Phase 8)
    analytics.trackApiCall({
      provider,
      cost,
      responseTime,
      success,
      tokens: Math.round(requestCount),
    })

    // Track in Tenant Context if available
    const context = tenantContextManager.getContext()
    if (context && this.config.enableTenantIsolation) {
      tenantContextManager.trackApiCall(cost)
      tenantContextManager.recordCostAllocation(provider, cost, requestCount)
    }
  }

  /**
   * Detect anomalies across services
   */
  detectAnomalies(): {
    mlAnomalies: any[]
    riskAssessment: string
    recommendations: string[]
  } {
    const mlAnomalies = mlOptimizer.detectAnomalies()

    let riskAssessment = 'System Status: '
    const recommendations: string[] = []

    if (mlAnomalies.length === 0) {
      riskAssessment += 'Normal'
    } else if (mlAnomalies.length === 1) {
      riskAssessment += 'Minor Issues'
      recommendations.push(`Investigate ${mlAnomalies[0].type} for ${mlAnomalies[0].provider}`)
    } else {
      riskAssessment += 'Multiple Issues Detected'
      recommendations.push('Enable fallback providers')
      recommendations.push('Review provider health')
    }

    return {
      mlAnomalies,
      riskAssessment,
      recommendations,
    }
  }

  /**
   * Get integrated analytics for organization/tenant
   */
  getIntegratedAnalytics(organizationId?: string): {
    costMetrics: any
    performanceMetrics: any
    mlMetrics: any
    tenantMetrics: any
  } {
    const orgId = organizationId || tenantContextManager.getContext()?.organizationId

    return {
      costMetrics: tenantContextManager.getOrganizationAnalytics(orgId),
      performanceMetrics: costOptimizer.getAllStats(),
      mlMetrics: mlOptimizer.getMetrics('openai'), // Return sample metric
      tenantMetrics: tenantContextManager.getTenantMetrics(),
    }
  }

  /**
   * Check rate limits across services
   */
  checkRateLimits(provider: string): {
    withinLimit: boolean
    remaining: number
    resetTime: number
    recommendation: string
  } {
    // Check Phase 8 rate limiter
    const phase8Check = rateLimitManager.canMakeRequest(provider)
    const status = rateLimitManager.getStatus(provider)

    // Check tenant quota
    const context = tenantContextManager.getContext()
    const tenantCheck = !context || tenantContextManager.isWithinQuota('maxApiCallsPerMinute')

    const withinLimit = phase8Check && tenantCheck
    const remaining = status?.availableTokens ?? 0
    const resetTime = 0 // Rate limiter doesn't expose reset time directly

    let recommendation = ''
    if (!withinLimit) {
      if (!phase8Check) {
        recommendation = 'Provider rate limit exceeded - use fallback'
      } else if (!tenantCheck) {
        recommendation = 'Tenant quota exceeded - upgrade plan'
      }
    }

    return {
      withinLimit,
      remaining,
      resetTime,
      recommendation,
    }
  }

  /**
   * Validate request can be processed
   */
  canProcessRequest(provider: string, estimatedCost: number = 0): {
    allowed: boolean
    reason: string
    alternatives?: string[]
  } {
    // Check rate limits
    const rateLimitCheck = this.checkRateLimits(provider)
    if (!rateLimitCheck.withinLimit) {
      return {
        allowed: false,
        reason: rateLimitCheck.recommendation,
        alternatives: this.getAlternativeProviders(provider),
      }
    }

    // Check tenant quotas
    const context = tenantContextManager.getContext()
    if (context) {
      if (!tenantContextManager.isWithinQuota('maxCostPerDay')) {
        return {
          allowed: false,
          reason: 'Daily cost quota exceeded',
          alternatives: undefined,
        }
      }
      if (!tenantContextManager.isWithinQuota('maxCostPerMonth')) {
        return {
          allowed: false,
          reason: 'Monthly cost quota exceeded',
          alternatives: undefined,
        }
      }
    }

    return {
      allowed: true,
      reason: 'Request can be processed',
    }
  }

  /**
   * Get alternative providers if primary is unavailable
   */
  private getAlternativeProviders(primaryProvider: string): string[] {
    // This would typically come from configuration, but for now
    // we return common alternatives
    const allProviders = ['openai', 'anthropic', 'nvidia']
    return allProviders.filter((p) => p !== primaryProvider).slice(0, 2)
  }

  /**
   * Get ML Optimizer stats
   */
  getMLOptimizerStats(): {
    optimalProvider: string
    metrics: Record<string, MLMetrics>
    alerts: any[]
  } {
    const providers = ['openai', 'anthropic', 'nvidia']
    const optimal = mlOptimizer.getOptimalProvider(providers)
    const metrics = Object.fromEntries(providers.map((p) => [p, mlOptimizer.getMetrics(p)]))
    const alerts = mlOptimizer.getAlerts()

    return {
      optimalProvider: optimal,
      metrics,
      alerts,
    }
  }

  /**
   * Reset all services (for testing)
   */
  reset(): void {
    mlOptimizer.reset()
    tenantContextManager.reset()
    costOptimizer.reset()
    analytics.clear()
    this.lastProviderRecommendation.clear()
  }
}

// Export singleton instance
export const phase10Integration = new Phase10IntegrationService()

export type { Phase10ProviderRecommendation, IntegrationConfig }
export default Phase10IntegrationService
