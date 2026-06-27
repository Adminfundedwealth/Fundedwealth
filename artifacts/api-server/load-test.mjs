// Phase 11: Load Testing Script
// Tests API performance under load (100, 500, 1000 concurrent users)
// Usage: node load-test.mjs --users 1000 --duration 60

import http from 'http';
import { performance } from 'perf_hooks';

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 3000;

interface LoadTestConfig {
  users: number;
  duration: number; // seconds
  rampUp: number; // seconds to ramp to full load
}

interface Metrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  latencies: number[];
  errors: Map<number, number>;
  startTime: number;
  endTime: number;
}

const config: LoadTestConfig = {
  users: parseInt(process.argv.find((a) => a.startsWith('--users'))?.split('=')[1] || '100'),
  duration: parseInt(process.argv.find((a) => a.startsWith('--duration'))?.split('=')[1] || '60'),
  rampUp: 10,
};

const metrics: Metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  latencies: [],
  errors: new Map(),
  startTime: 0,
  endTime: 0,
};

async function makeRequest(endpoint: string): Promise<{ statusCode: number; latency: number }> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();

    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const latency = performance.now() - startTime;
        resolve({ statusCode: res.statusCode || 500, latency });
      });
    });

    req.on('error', (err) => {
      const latency = performance.now() - startTime;
      resolve({ statusCode: 0, latency });
    });

    req.setTimeout(5000);
    req.end();
  });
}

async function runLoadTest() {
  console.log(`\n🚀 Starting Load Test`);
  console.log(`   Users: ${config.users}`);
  console.log(`   Duration: ${config.duration}s`);
  console.log(`   Ramp-up: ${config.rampUp}s\n`);

  metrics.startTime = performance.now();
  const endTime = metrics.startTime + config.duration * 1000;

  // API endpoints to test
  const endpoints = [
    '/api/health',
    '/api/accounts',
    '/api/orders',
    '/api/positions',
    '/api/market/data',
    '/api/challenge',
    '/api/payouts',
  ];

  let activeUsers = 0;
  const userInterval = (config.rampUp * 1000) / config.users;

  // Ramp up users gradually
  const rampUpInterval = setInterval(() => {
    if (activeUsers < config.users) {
      activeUsers++;
      startUser(endpoints);
    }
  }, userInterval);

  // Monitor metrics every 5 seconds
  const monitorInterval = setInterval(() => {
    const elapsed = (performance.now() - metrics.startTime) / 1000;
    const p50 = metrics.latencies.sort((a, b) => a - b)[Math.floor(metrics.latencies.length * 0.5)];
    const p95 = metrics.latencies[Math.floor(metrics.latencies.length * 0.95)];
    const p99 = metrics.latencies[Math.floor(metrics.latencies.length * 0.99)];
    const avgLatency = metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length;

    console.log(
      `[${elapsed.toFixed(1)}s] Users: ${activeUsers} | Requests: ${metrics.totalRequests} | Success: ${metrics.successfulRequests} | Failures: ${metrics.failedRequests} | Avg: ${avgLatency.toFixed(0)}ms | p95: ${p95?.toFixed(0) || 'N/A'}ms | p99: ${p99?.toFixed(0) || 'N/A'}ms`,
    );
  }, 5000);

  // Wait for test duration
  await new Promise((resolve) => {
    setTimeout(() => {
      clearInterval(rampUpInterval);
      clearInterval(monitorInterval);
      metrics.endTime = performance.now();
      resolve(null);
    }, config.duration * 1000);
  });

  console.log('\n✅ Load Test Complete\n');
  printMetrics();
}

function startUser(endpoints: string[]) {
  const makeUserRequests = async () => {
    while (performance.now() < metrics.startTime + config.duration * 1000) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const { statusCode, latency } = await makeRequest(endpoint);

      metrics.totalRequests++;
      metrics.latencies.push(latency);

      if (statusCode >= 200 && statusCode < 300) {
        metrics.successfulRequests++;
      } else {
        metrics.failedRequests++;
        metrics.errors.set(statusCode, (metrics.errors.get(statusCode) || 0) + 1);
      }

      // Random think time between requests (100-500ms)
      await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 400));
    }
  };

  makeUserRequests();
}

function printMetrics() {
  const sortedLatencies = metrics.latencies.sort((a, b) => a - b);
  const avgLatency = sortedLatencies.reduce((a, b) => a + b, 0) / sortedLatencies.length;
  const minLatency = sortedLatencies[0];
  const maxLatency = sortedLatencies[sortedLatencies.length - 1];
  const p50 = sortedLatencies[Math.floor(sortedLatencies.length * 0.5)];
  const p95 = sortedLatencies[Math.floor(sortedLatencies.length * 0.95)];
  const p99 = sortedLatencies[Math.floor(sortedLatencies.length * 0.99)];

  const duration = (metrics.endTime - metrics.startTime) / 1000;
  const throughput = metrics.totalRequests / duration;
  const successRate = ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2);

  console.log(`📊 LOAD TEST RESULTS`);
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`Total Requests:        ${metrics.totalRequests}`);
  console.log(`Successful:            ${metrics.successfulRequests} (${successRate}%)`);
  console.log(`Failed:                ${metrics.failedRequests}`);
  console.log(`Duration:              ${duration.toFixed(1)}s`);
  console.log(`Throughput:            ${throughput.toFixed(2)} req/s`);
  console.log(`═══════════════════════════════════════════════════════════`);
  console.log(`Latency (ms):`);
  console.log(`  Min:                 ${minLatency.toFixed(2)}ms`);
  console.log(`  Avg:                 ${avgLatency.toFixed(2)}ms`);
  console.log(`  p50:                 ${p50.toFixed(2)}ms`);
  console.log(`  p95:                 ${p95.toFixed(2)}ms`);
  console.log(`  p99:                 ${p99.toFixed(2)}ms`);
  console.log(`  Max:                 ${maxLatency.toFixed(2)}ms`);
  console.log(`═══════════════════════════════════════════════════════════`);

  if (metrics.errors.size > 0) {
    console.log(`Errors by Status Code:`);
    metrics.errors.forEach((count, statusCode) => {
      console.log(`  ${statusCode}:                 ${count}`);
    });
    console.log(`═══════════════════════════════════════════════════════════`);
  }

  // Pass/Fail criteria
  console.log(`\n📋 PASS/FAIL CRITERIA:`);
  const criteria = [
    { name: 'Throughput (>100 req/s)', pass: throughput > 100 },
    { name: 'Avg Latency (<500ms)', pass: avgLatency < 500 },
    { name: 'p95 Latency (<1000ms)', pass: p95 < 1000 },
    { name: 'Success Rate (>99%)', pass: parseFloat(successRate) > 99 },
    { name: 'Error Rate (<1%)', pass: (metrics.failedRequests / metrics.totalRequests) * 100 < 1 },
  ];

  criteria.forEach(({ name, pass }) => {
    console.log(`  ${pass ? '✅' : '❌'} ${name}`);
  });

  const allPassed = criteria.every((c) => c.pass);
  console.log(`\n${allPassed ? '✅ LOAD TEST PASSED' : '❌ LOAD TEST FAILED'}`);
}

runLoadTest().catch(console.error);
