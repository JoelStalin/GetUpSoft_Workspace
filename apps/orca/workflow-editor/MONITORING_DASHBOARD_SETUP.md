# Phase 11 Monitoring Dashboard Setup Guide

**Purpose:** Configure real-time monitoring dashboards for Phase 11 features  
**Audience:** DevOps, Engineering Lead  
**Tools:** Datadog, Prometheus, Grafana (choose based on your stack)  
**Duration:** 30-60 minutes setup  
**Status:** READY TO IMPLEMENT

---

## Overview

Comprehensive monitoring setup for Phase 11 tracking:
- Bundle size metrics
- Performance metrics (FCP, LCP, TTI, mode switching)
- ML algorithm accuracy and latency
- API response times
- Error rates and uptime
- User analytics

---

## Option 1: Datadog (Recommended - SaaS)

### 1.1 Initial Setup (10 minutes)

**Install Datadog Browser SDK:**

```bash
npm install @datadog/browser-rum @datadog/browser-logs
```

**In `src/main.tsx` or `src/App.tsx`:**

```typescript
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: 'YOUR_APP_ID',
  clientToken: 'YOUR_CLIENT_TOKEN',
  site: 'datadoghq.com',
  service: 'orca-workflow-editor',
  env: 'staging',
  version: '11.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
});

datadogRum.startSessionReplayRecording();
```

### 1.2 Custom Metrics (20 minutes)

**Bundle Size Tracking:**

```typescript
// src/monitoring/bundleMetrics.ts
import { datadogRum } from '@datadog/browser-rum';

export function reportBundleSize(sizes: {
  initial: number;
  gzipped: number;
}) {
  datadogRum.addUserAction('bundle_size_report', {
    initial_kb: sizes.initial / 1024,
    gzipped_kb: sizes.gzipped / 1024,
    timestamp: Date.now(),
  });
}
```

**Performance Metrics:**

```typescript
// src/monitoring/performanceMetrics.ts
import { datadogRum } from '@datadog/browser-rum';

export function reportModeSwitch(fromMode: string, toMode: string, duration: number) {
  datadogRum.addTiming('mode_switch', duration);
  datadogRum.addUserAction('mode_switched', {
    from_mode: fromMode,
    to_mode: toMode,
    duration_ms: duration,
  });
}

export function reportLoadTime(metric: 'fcp' | 'lcp' | 'tti', value: number) {
  datadogRum.addTiming(metric, value);
}
```

**ML Performance:**

```typescript
// src/monitoring/mlMetrics.ts
import { datadogRum } from '@datadog/browser-rum';

export function reportMLPipeline(metrics: {
  ema_time: number;
  anomaly_time: number;
  forecast_time: number;
  accuracy: number;
}) {
  datadogRum.addUserAction('ml_pipeline_complete', {
    ema_ms: metrics.ema_time,
    anomaly_ms: metrics.anomaly_time,
    forecast_ms: metrics.forecast_time,
    accuracy_pct: metrics.accuracy * 100,
  });
}
```

### 1.3 Create Dashboard (20 minutes)

**In Datadog UI:**

1. Go to: Dashboards → New Dashboard
2. Name: "Phase 11 Monitoring"
3. Add widgets:

**Widget 1: Bundle Size**
```
Query: @initial_kb, @gzipped_kb
Type: Number
Alert: Gzipped > 210KB
```

**Widget 2: Performance Timeline**
```
Query: @fcp, @lcp, @tti over time
Type: Line graph
Thresholds: FCP<1000ms, LCP<1800ms, TTI<2000ms
```

**Widget 3: Mode Switch Duration**
```
Query: @duration_ms (mode_switched event)
Type: Histogram
Alert: >600ms (P95)
```

**Widget 4: ML Accuracy**
```
Query: @accuracy_pct
Type: Gauge
Target: >90%
```

**Widget 5: Error Rate**
```
Query: Status:Error
Type: Timeseries
Alert: >0.1%
```

**Widget 6: API Response Times**
```
Query: @duration (resource type:xhr)
Type: Heatmap
P95 Threshold: 500ms
```

---

## Option 2: Prometheus + Grafana (Self-Hosted)

### 2.1 Install Prometheus Client (10 minutes)

```bash
npm install prom-client
```

**Create metrics exporter:**

```typescript
// src/monitoring/prometheusMetrics.ts
import { register, Counter, Gauge, Histogram } from 'prom-client';

// Bundle metrics
export const bundleSizeGauge = new Gauge({
  name: 'bundle_size_bytes',
  help: 'Bundle size in bytes',
  labelNames: ['type'],
});

// Performance metrics
export const modeSwitchHistogram = new Histogram({
  name: 'mode_switch_duration_ms',
  help: 'Mode switching duration in milliseconds',
  buckets: [100, 250, 500, 750, 1000, 1500],
});

export const loadTimeHistogram = new Histogram({
  name: 'load_time_ms',
  help: 'Page load time metrics',
  labelNames: ['metric'],
  buckets: [500, 1000, 1500, 2000, 2500, 3000],
});

// ML metrics
export const mlAccuracyGauge = new Gauge({
  name: 'ml_accuracy_percent',
  help: 'ML model accuracy',
});

export const mlLatencyHistogram = new Histogram({
  name: 'ml_latency_ms',
  help: 'ML pipeline latency',
  labelNames: ['component'],
  buckets: [1, 5, 10, 20, 50, 100, 200, 400],
});

// Error metrics
export const errorCounter = new Counter({
  name: 'errors_total',
  help: 'Total errors',
  labelNames: ['type', 'component'],
});

export function getMetrics() {
  return register.metrics();
}
```

**Expose metrics endpoint:**

```typescript
// src/routes/metrics.ts
import { Router } from 'express';
import { getMetrics } from '../monitoring/prometheusMetrics';

const router = Router();

router.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(getMetrics());
});

export default router;
```

### 2.2 Configure Prometheus (15 minutes)

**prometheus.yml:**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'orca-editor'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
```

**Run Prometheus:**

```bash
docker run -d \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

### 2.3 Configure Grafana (20 minutes)

**Run Grafana:**

```bash
docker run -d \
  -p 3000:3000 \
  grafana/grafana
```

**Add Prometheus Data Source:**
1. Login: http://localhost:3000 (admin/admin)
2. Configuration → Data Sources → Add Prometheus
3. URL: http://prometheus:9090

**Create Dashboard:**
1. Create → Dashboard
2. Add panels:

**Panel 1: Bundle Size**
```
Query: bundle_size_bytes{type="gzipped"}
Unit: Bytes
Threshold: 210000
```

**Panel 2: Mode Switch Latency**
```
Query: rate(mode_switch_duration_ms_sum[5m]) / rate(mode_switch_duration_ms_count[5m])
Unit: ms
Alert: >600ms
```

**Panel 3: Error Rate**
```
Query: rate(errors_total[5m])
Unit: short
Alert: >0.001
```

---

## Option 3: ELK Stack (Elasticsearch + Logstash + Kibana)

### 3.1 Setup (30 minutes)

**Install logging package:**

```bash
npm install winston winston-elasticsearch
```

**Configure logging:**

```typescript
// src/monitoring/logger.ts
import winston from 'winston';
import ElasticsearchTransport from 'winston-elasticsearch';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { nodes: ['http://localhost:9200'] },
      index: 'orca-logs',
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export default logger;
```

**Log critical events:**

```typescript
import logger from './logger';

// Phase 11 events
logger.info('mode_switch', {
  from_mode: 'workflow',
  to_mode: 'web_design',
  duration_ms: 450,
});

logger.info('ml_pipeline', {
  ema_time: 1,
  anomaly_time: 5,
  forecast_time: 45,
  total_time: 51,
  accuracy: 0.94,
});
```

**Run ELK Stack:**

```bash
docker-compose up -d
# Kibana: http://localhost:5601
```

---

## Real-Time Alerting

### Alert Rules (All Options)

**Critical Alerts:**

```
Bundle size > 210KB gzip → Alert immediately
Error rate > 0.1% → Page
ML accuracy < 80% → Notify team
Mode switch > 700ms → Investigate
API p95 latency > 600ms → Alert
```

**Notification Channels:**

```
#phase-11 Slack channel
Pagerduty on-call rotation
Email to devops@getupsoft.com
```

---

## Phase 11 Metrics Checklist

Daily tracking (during implementation):

- [ ] Bundle size trend (target: decreasing)
- [ ] Mode switch latency (target: <500ms)
- [ ] FCP/LCP/TTI (target: meet thresholds)
- [ ] ML accuracy (target: >90%)
- [ ] API p95 latency (target: <500ms)
- [ ] Error rate (target: <0.1%)
- [ ] Uptime (target: >99.5%)

---

## Integration with Phase 11 Steps

**Step 1 (Performance Optimization):**
- Monitor bundle size daily
- Track mode switching improvements
- Validate code-splitting effectiveness

**Step 2 (User Preferences):**
- Monitor preference API latency
- Track user adoption metrics

**Step 3 (Custom Metrics):**
- Monitor custom metric collection
- Validate data aggregation

**Step 4 (Enhanced ML):**
- Monitor ML pipeline latency
- Track accuracy improvements
- Validate new algorithms

**Step 5 (Advanced Monitoring):**
- Finalize dashboard configuration
- Establish alerting thresholds
- Document runbooks

---

## Quick Start Commands

```bash
# Datadog (with environment variables)
export DATADOG_APP_ID=your_id
export DATADOG_CLIENT_TOKEN=your_token
npm install @datadog/browser-rum
npm run dev

# Prometheus + Grafana
docker-compose up -d prometheus grafana
npm install prom-client
npm run dev

# ELK Stack
docker-compose up -d elasticsearch logstash kibana
npm install winston winston-elasticsearch
npm run dev
```

---

**Version:** 1.0  
**Created:** 2026-05-24  
**Owner:** DevOps/Monitoring Team
