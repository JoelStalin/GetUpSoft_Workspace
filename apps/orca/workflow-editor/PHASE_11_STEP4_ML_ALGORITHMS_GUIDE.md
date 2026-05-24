# Phase 11 Step 4: Enhanced ML Algorithms - Implementation Guide

**Based on:** 2026 Time Series Forecasting Best Practices  
**Purpose:** Implement time-series forecasting beyond Phase 10 EMA baseline  
**Target Accuracy:** >80% baseline match, ideally exceed EMA  
**Models:** ARIMA, Prophet, Hybrid Approach

---

## Executive Summary

Phase 10 uses simple EMA (Exponential Moving Average) with 80% accuracy. Phase 11 adds sophisticated time-series forecasting using ARIMA and Prophet, with a hybrid approach to combine their strengths:

- **ARIMA:** Captures linear dependencies and short-term fluctuations
- **Prophet:** Handles seasonality, trends, holidays automatically  
- **Hybrid:** Combines both for 10-15% accuracy improvement

**Expected Outcome:** 80% baseline → 90%+ combined accuracy

---

## Part 1: Understanding the Three Approaches

### 1.1 Phase 10: EMA (Current Baseline)

```typescript
// Phase 10 implementation
export function calculateEMA(data: DataPoint[], alpha: number = 0.2): number {
  if (data.length === 0) return 0;
  
  let ema = data[0].value;
  for (let i = 1; i < data.length; i++) {
    ema = alpha * data[i].value + (1 - alpha) * ema;
  }
  return ema;
}

// Accuracy: 80% on historical data
// Pros: Fast, simple, works for stationary data
// Cons: Can't capture seasonality, trends, or non-linear patterns
```

---

### 1.2 ARIMA: For Linear, Stationary Data

**Best For:** Small datasets with clear linear patterns  
**Accuracy:** 75-85% on most cost data  
**Cons:** Requires manual parameter tuning

```typescript
// src/services/arima.ts
export interface ARIMAParams {
  p: number; // AR: AutoRegressive order
  d: number; // I: Integrated (differencing) order
  q: number; // MA: Moving Average order
}

export class ARIMAForecaster {
  constructor(private params: ARIMAParams) {}

  // Step 1: Test for stationarity using Augmented Dickey-Fuller test
  private testStationarity(data: number[]): boolean {
    // ADF test implementation
    // If p-value < 0.05: data is stationary (d=0)
    // If p-value >= 0.05: data needs differencing (d=1 or d=2)
    return this.adfTest(data).pValue < 0.05;
  }

  // Step 2: Determine p and q using ACF/PACF plots
  private findPQ(data: number[]): [number, number] {
    const acf = this.calculateACF(data);
    const pacf = this.calculatePACF(data);
    
    // p: significant lags in PACF
    // q: significant lags in ACF
    return [this.countSignificantLags(pacf), this.countSignificantLags(acf)];
  }

  // Step 3: Fit ARIMA model
  forecast(data: number[], steps: number = 7): number[] {
    if (!this.testStationarity(data)) {
      // Apply differencing if needed
      data = this.differenceData(data, this.params.d);
    }

    const [p, q] = this.findPQ(data);
    const predictions: number[] = [];

    for (let i = 0; i < steps; i++) {
      // AR component: weighted sum of previous values
      const arComponent = this.arComponent(data, p);
      
      // MA component: weighted sum of previous errors
      const maComponent = this.maComponent(data, q);
      
      const prediction = arComponent + maComponent;
      predictions.push(prediction);
      data.push(prediction);
    }

    return predictions;
  }

  private adfTest(data: number[]): { pValue: number } {
    // Augmented Dickey-Fuller test
    // Returns p-value for stationarity
    // Implementation: use stdlib or custom calculation
    return { pValue: 0.01 }; // Placeholder
  }

  private calculateACF(data: number[]): number[] {
    // AutoCorrelation Function
    // Measures correlation of data with its own lags
    return [];
  }

  private calculatePACF(data: number[]): number[] {
    // Partial AutoCorrelation Function
    // Measures direct correlation with lags (excluding indirect effects)
    return [];
  }

  private differenceData(data: number[], order: number): number[] {
    // Make data stationary by taking differences
    let diff = [...data];
    for (let d = 0; d < order; d++) {
      diff = diff.slice(1).map((v, i) => v - diff[i]);
    }
    return diff;
  }

  private arComponent(data: number[], p: number): number {
    // Sum of AR(p) coefficients × previous values
    return 0; // Simplified
  }

  private maComponent(data: number[], q: number): number {
    // Sum of MA(q) coefficients × previous errors
    return 0; // Simplified
  }

  private countSignificantLags(values: number[]): number {
    // Count lags > critical value (95% confidence)
    return values.filter(v => Math.abs(v) > 1.96).length;
  }
}
```

---

### 1.3 Prophet: For Seasonality & Trends

**Best For:** Data with strong seasonal patterns (weekly, monthly, yearly)  
**Accuracy:** 85-92% with built-in seasonality handling  
**Pros:** Automatic, handles missing values, requires minimal tuning

```typescript
// src/services/prophet.ts
import Prophet from 'prophet-js'; // Hypothetical library

export class ProphetForecaster {
  private model: any;

  constructor(private data: DataPoint[]) {}

  // Prophet automatically detects:
  // - Trend (growth pattern)
  // - Seasonality (repeating patterns)
  // - Holidays (special events)
  async forecast(periods: number = 7): Promise<Forecast[]> {
    // Convert data to Prophet format
    const df = this.data.map(point => ({
      ds: new Date(point.timestamp), // DateTime
      y: point.value // Value
    }));

    // Initialize and fit model
    this.model = new Prophet({
      yearly_seasonality: true,   // Yearly patterns
      weekly_seasonality: true,   // Weekly patterns
      daily_seasonality: false,   // Usually not needed for cost data
      seasonality_mode: 'additive' // Or 'multiplicative' for larger swings
    });

    // Add special events (holidays, known incidents)
    this.model.addHolidays([
      { holiday: 'Black Friday', ds: new Date('2026-11-28') },
      { holiday: 'Cyber Monday', ds: new Date('2026-12-01') },
    ]);

    // Fit the model
    await this.model.fit(df);

    // Generate future dates
    const future = this.generateFutureDates(periods);

    // Forecast
    const forecast = await this.model.predict(future);

    return forecast.map(row => ({
      timestamp: row.ds,
      prediction: row.yhat,
      lower: row.yhat_lower,  // 95% confidence interval
      upper: row.yhat_upper,
      trend: row.trend,
      seasonality: row.yearly + row.weekly
    }));
  }

  private generateFutureDates(periods: number): Date[] {
    const future: Date[] = [];
    const lastDate = new Date(this.data[this.data.length - 1].timestamp);

    for (let i = 1; i <= periods; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + i);
      future.push(nextDate);
    }

    return future;
  }
}

interface Forecast {
  timestamp: Date;
  prediction: number;
  lower: number;
  upper: number;
  trend: number;
  seasonality: number;
}
```

---

### 1.4 Hybrid Approach: ARIMA + Prophet

```typescript
// src/services/hybridForecaster.ts
export class HybridForecaster {
  private arima: ARIMAForecaster;
  private prophet: ProphetForecaster;

  constructor(data: DataPoint[]) {
    this.arima = new ARIMAForecaster({ p: 2, d: 1, q: 2 });
    this.prophet = new ProphetForecaster(data);
  }

  async forecast(periods: number = 7): Promise<HybridForecast[]> {
    // Get predictions from both models
    const arimaPreds = this.arima.forecast(
      data.map(d => d.value),
      periods
    );

    const prophetPreds = await this.prophet.forecast(periods);

    // Combine predictions with weighted average
    // ARIMA weight: 40% (better for short-term linear patterns)
    // Prophet weight: 60% (better for seasonality)
    return prophetPreds.map((prophet, i) => {
      const hybrid = 0.4 * arimaPreds[i] + 0.6 * prophet.prediction;

      return {
        timestamp: prophet.timestamp,
        arima: arimaPreds[i],
        prophet: prophet.prediction,
        hybrid, // Weighted combination
        confidence: this.calculateConfidence(
          prophet.lower,
          prophet.upper,
          hybrid
        ),
        trend: prophet.trend,
        seasonality: prophet.seasonality
      };
    });
  }

  private calculateConfidence(lower: number, upper: number, prediction: number): number {
    // Confidence as distance from bounds
    const range = upper - lower;
    const distance = Math.abs(prediction - (lower + upper) / 2);
    return 1 - (distance / (range / 2));
  }
}

interface HybridForecast {
  timestamp: Date;
  arima: number;
  prophet: number;
  hybrid: number; // Final prediction
  confidence: number; // 0-1
  trend: number;
  seasonality: number;
}
```

---

## Part 2: Data Preprocessing

### Critical Steps

```typescript
export class DataPreprocessor {
  static prepare(rawData: RawDataPoint[]): DataPoint[] {
    let data = [...rawData];

    // Step 1: Handle missing values
    data = this.fillMissingValues(data);

    // Step 2: Remove outliers
    data = this.removeOutliers(data, 3); // 3-sigma rule

    // Step 3: Normalize values
    data = this.normalize(data);

    // Step 4: Resample irregular intervals
    data = this.resample(data, 'daily');

    // Step 5: Add features
    data = this.addFeatures(data);

    return data;
  }

  private static fillMissingValues(data: DataPoint[]): DataPoint[] {
    // Forward fill or interpolation
    for (let i = 1; i < data.length; i++) {
      if (data[i].value === null) {
        // Linear interpolation
        const prev = data[i - 1];
        const next = data.find((d, j) => j > i && d.value !== null);
        
        if (next) {
          const ratio = (i - (i - 1)) / (next.timestamp - prev.timestamp);
          data[i].value = prev.value + ratio * (next.value - prev.value);
        }
      }
    }
    return data;
  }

  private static removeOutliers(data: DataPoint[], sigma: number): DataPoint[] {
    const mean = data.reduce((sum, d) => sum + d.value, 0) / data.length;
    const std = Math.sqrt(
      data.reduce((sum, d) => sum + (d.value - mean) ** 2, 0) / data.length
    );

    return data.filter(d => Math.abs(d.value - mean) <= sigma * std);
  }

  private static normalize(data: DataPoint[]): DataPoint[] {
    const min = Math.min(...data.map(d => d.value));
    const max = Math.max(...data.map(d => d.value));

    return data.map(d => ({
      ...d,
      value: (d.value - min) / (max - min) // Normalize to [0, 1]
    }));
  }

  private static resample(data: DataPoint[], period: 'daily' | 'hourly'): DataPoint[] {
    // Aggregate to consistent intervals
    const aggregated = new Map();

    data.forEach(point => {
      const key = period === 'daily'
        ? new Date(point.timestamp).toDateString()
        : new Date(point.timestamp).toISOString().slice(0, 13);

      if (!aggregated.has(key)) {
        aggregated.set(key, []);
      }
      aggregated.get(key).push(point.value);
    });

    return Array.from(aggregated.entries()).map(([key, values]) => ({
      timestamp: new Date(key),
      value: values.reduce((a, b) => a + b) / values.length // Average
    }));
  }

  private static addFeatures(data: DataPoint[]): (DataPoint & Features)[] {
    return data.map((point, i) => ({
      ...point,
      lag1: i > 0 ? data[i - 1].value : null,
      lag7: i > 7 ? data[i - 7].value : null, // Weekly lag
      rolling_mean: this.rollingAverage(data, i, 7),
      dayOfWeek: new Date(point.timestamp).getDay(),
      weekOfYear: this.getWeekOfYear(point.timestamp)
    }));
  }

  private static rollingAverage(data: DataPoint[], index: number, window: number): number {
    const start = Math.max(0, index - window + 1);
    const slice = data.slice(start, index + 1);
    return slice.reduce((sum, d) => sum + d.value, 0) / slice.length;
  }

  private static getWeekOfYear(date: Date): number {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDay.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  }
}

interface Features {
  lag1: number | null;
  lag7: number | null;
  rolling_mean: number;
  dayOfWeek: number;
  weekOfYear: number;
}
```

---

## Part 3: Model Selection Decision Tree

```
Start: Time-series cost/performance data
  │
  ├─ Is data stationary?
  │  ├─ YES (ADF test p-value < 0.05)
  │  │  └─ Use ARIMA
  │  │      └─ Works for: Linear trends, short-term patterns
  │  │      └─ Accuracy: 75-85%
  │  │
  │  └─ NO (has trend or seasonality)
  │     ├─ Is there clear seasonality (weekly/monthly)?
  │     │  ├─ YES
  │     │  │  └─ Use Prophet
  │     │  │      └─ Works for: Seasonal patterns, holidays
  │     │  │      └─ Accuracy: 85-92%
  │     │  │
  │     │  └─ UNCLEAR
  │     │     └─ Use Hybrid (ARIMA + Prophet)
  │     │         └─ Works for: All patterns
  │     │         └─ Accuracy: 90%+ combined
  │     │
  │     └─ Is dataset very large (>10,000 points) and multivariate?
  │        └─ Consider: LSTM neural network (Phase 12)
```

---

## Part 4: Validation Strategy

### Rolling Forecast Origin (Correct for Time Series)

```typescript
export function evaluateModel(
  data: DataPoint[],
  forecastFn: (d: DataPoint[]) => number[]
): Metrics {
  const predictions: number[] = [];
  const actuals: number[] = [];

  // Use rolling forecast origin (not random splits!)
  const trainSize = Math.floor(data.length * 0.8);

  for (let t = trainSize; t < data.length; t++) {
    // Train on everything before time t
    const trainData = data.slice(0, t);
    
    // Forecast the next value
    const pred = forecastFn(trainData)[0];
    
    predictions.push(pred);
    actuals.push(data[t].value);
  }

  return calculateMetrics(predictions, actuals);
}

function calculateMetrics(pred: number[], actual: number[]): Metrics {
  // MAE: Mean Absolute Error (lower is better)
  const mae = pred.reduce((sum, p, i) => sum + Math.abs(p - actual[i]), 0) / pred.length;

  // MAPE: Mean Absolute Percentage Error (%)
  const mape = (pred.reduce((sum, p, i) => 
    sum + Math.abs((p - actual[i]) / actual[i]), 0) / pred.length) * 100;

  // RMSE: Root Mean Squared Error (penalizes large errors)
  const rmse = Math.sqrt(
    pred.reduce((sum, p, i) => sum + (p - actual[i]) ** 2, 0) / pred.length
  );

  // Accuracy: % of predictions within tolerance (e.g., 5%)
  const accuracy = (pred.filter((p, i) => 
    Math.abs(p - actual[i]) / actual[i] < 0.05
  ).length / pred.length) * 100;

  return { mae, mape, rmse, accuracy };
}

interface Metrics {
  mae: number;      // Mean Absolute Error
  mape: number;     // Mean Absolute Percentage Error (%)
  rmse: number;     // Root Mean Squared Error
  accuracy: number; // % within 5% tolerance
}
```

**Target Metrics:**
- Accuracy: >80% (beat EMA baseline)
- MAPE: <15% (mean percentage error)
- RMSE: <$50 (or <5% of mean value)

---

## Part 5: Phase 11 Step 4 Implementation Plan

### Days 1-2: ARIMA Implementation
- [ ] Implement ADF test for stationarity
- [ ] Implement ACF/PACF calculations
- [ ] Create ARIMA parameter tuning
- [ ] Test on historical cost data
- [ ] Validate: Accuracy >75%

### Days 3-4: Prophet Implementation
- [ ] Set up Prophet model
- [ ] Add seasonality detection (weekly, monthly)
- [ ] Add holiday handling
- [ ] Test on historical data
- [ ] Validate: Accuracy >85%

### Days 5: Hybrid & Optimization
- [ ] Combine ARIMA + Prophet
- [ ] Tune weights (currently 40/60)
- [ ] Final validation
- [ ] Deploy to staging
- [ ] Target: Accuracy >90%

---

## References & Sources

- [A Hybrid Approach to Time Series Forecasting | ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2590123025017748)
- [Time Series Forecasting Phase 2 | Medium](https://photokheecher.medium.com/time-series-forecasting-for-beginners-phase-2-classical-models-arima-sarima-prophet-ml-a44d6fcba174)
- [ARIMA, Prophet, LSTMs Comparison | Sanfoundry](https://www.sanfoundry.com/time-series-forecasting-arima-prophet-lstms-in-ml/)
- [Prophet & ARIMA Comparison | Medium](https://medium.com/@tarangds/traditional-prediction-models-prophet-arima-83bc8b980ec4)
- [Choose the Best Model | Ikigai Labs](https://www.ikigailabs.io/blog/how-to-choose-the-best-model-for-time-series-forecasting-arima-prophet-or-mssa)

---

**Version:** 1.0  
**Created:** 2026-05-24  
**Owner:** Data Science Team  
**Phase:** Phase 11 Step 4 Implementation  
**Target Accuracy:** >90% (vs 80% EMA baseline)
