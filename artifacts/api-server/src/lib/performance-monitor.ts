// Phase 11: Performance Measurement Utilities
// Captures latency, throughput, memory, and resource metrics

import { performance, PerformanceObserver } from 'perf_hooks';

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  count: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  p50: number;
  p95: number;
  p99: number;
  successRate: number;
  errorRate: number;
  errors: Map<string, number>;
}

export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
}

export interface DbMetrics {
  query: string;
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p95Duration: number;
}

export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  private dbMetrics = new Map<string, number[]>();
  private errors = new Map<string, number>();

  recordLatency(endpoint: string, latency: number) {
    const key = `${endpoint}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key)!.push(latency);
  }

  recordError(endpoint: string, error: string) {
    const key = `${endpoint}:${error}`;
    this.errors.set(key, (this.errors.get(key) || 0) + 1);
  }

  recordDbQuery(query: string, duration: number) {
    const normalized = this.normalizeQuery(query);
    if (!this.dbMetrics.has(normalized)) {
      this.dbMetrics.set(normalized, []);
    }
    this.dbMetrics.get(normalized)!.push(duration);
  }

  private normalizeQuery(query: string): string {
    return query
      .replace(/\d+/g, '?') // Replace numbers with ?
      .replace(/'.+?'/g, "'?'") // Replace string literals
      .substring(0, 100); // First 100 chars
  }

  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.entries()).map(([endpoint, latencies]) => {
      const sorted = latencies.sort((a, b) => a - b);
      const total = latencies.length;
      const errors = total - latencies.length; // Errors not in latencies

      return {
        endpoint,
        method: 'GET',
        count: total,
        avgLatency: latencies.reduce((a, b) => a + b, 0) / total,
        minLatency: sorted[0],
        maxLatency: sorted[total - 1],
        p50: sorted[Math.floor(total * 0.5)],
        p95: sorted[Math.floor(total * 0.95)],
        p99: sorted[Math.floor(total * 0.99)],
        successRate: (latencies.length / (latencies.length + errors)) * 100,
        errorRate: (errors / (latencies.length + errors)) * 100,
        errors: new Map(),
      };
    });
  }

  getDbMetrics(): DbMetrics[] {
    return Array.from(this.dbMetrics.entries()).map(([query, durations]) => {
      const sorted = durations.sort((a, b) => a - b);
      const total = durations.length;

      return {
        query,
        count: total,
        avgDuration: durations.reduce((a, b) => a + b, 0) / total,
        minDuration: sorted[0],
        maxDuration: sorted[total - 1],
        p95Duration: sorted[Math.floor(total * 0.95)],
      };
    });
  }

  getMemoryMetrics(): MemoryMetrics {
    const mem = process.memoryUsage();
    return {
      heapUsed: mem.heapUsed / 1024 / 1024, // MB
      heapTotal: mem.heapTotal / 1024 / 1024,
      external: mem.external / 1024 / 1024,
      arrayBuffers: mem.arrayBuffers / 1024 / 1024,
      rss: mem.rss / 1024 / 1024,
    };
  }

  printReport() {
    console.log('\n📊 PERFORMANCE REPORT\n');

    // API Metrics
    console.log('API ENDPOINT LATENCIES');
    console.log('─────────────────────────────────────────────────────────');
    this.getMetrics().forEach((m) => {
      console.log(`${m.endpoint.padEnd(40)} | Count: ${m.count.toString().padEnd(5)} | Avg: ${m.avgLatency.toFixed(0)}ms | p95: ${m.p95.toFixed(0)}ms | p99: ${m.p99.toFixed(0)}ms`);
    });

    // DB Metrics
    console.log('\n\nDATABASE QUERY PERFORMANCE');
    console.log('─────────────────────────────────────────────────────────');
    this.getDbMetrics().forEach((m) => {
      console.log(`${m.query.padEnd(40)} | Count: ${m.count.toString().padEnd(5)} | Avg: ${m.avgDuration.toFixed(0)}ms | p95: ${m.p95Duration.toFixed(0)}ms`);
    });

    // Memory Metrics
    const mem = this.getMemoryMetrics();
    console.log('\n\nMEMORY USAGE');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`Heap Used:    ${mem.heapUsed.toFixed(2)} MB`);
    console.log(`Heap Total:   ${mem.heapTotal.toFixed(2)} MB`);
    console.log(`External:     ${mem.external.toFixed(2)} MB`);
    console.log(`Array Buffers: ${mem.arrayBuffers.toFixed(2)} MB`);
    console.log(`RSS:          ${mem.rss.toFixed(2)} MB`);

    console.log('\n');
  }

  reset() {
    this.metrics.clear();
    this.dbMetrics.clear();
    this.errors.clear();
  }
}

export const globalMonitor = new PerformanceMonitor();

// API Request Middleware
export function performanceMiddleware(req: any, res: any, next: any) {
  const start = performance.now();
  const endpoint = `${req.method} ${req.path}`;

  res.on('finish', () => {
    const duration = performance.now() - start;
    globalMonitor.recordLatency(endpoint, duration);

    if (res.statusCode >= 400) {
      globalMonitor.recordError(endpoint, res.statusCode.toString());
    }
  });

  next();
}

// Database Query Wrapper
export function withMetrics<T>(query: string, fn: () => Promise<T>): Promise<T> {
  return (async () => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      globalMonitor.recordDbQuery(query, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      globalMonitor.recordDbQuery(query, duration);
      throw error;
    }
  })();
}
