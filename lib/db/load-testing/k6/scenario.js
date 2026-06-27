import http from 'k6/http';
import ws from 'k6/ws';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Metrics
export const apiLatency = new Trend('api_latency_ms');
export const dbLatency = new Trend('db_latency_ms');
export const wsLatency = new Trend('ws_latency_ms');
export const execLatency = new Trend('execution_latency_ms');
export const pageLoad = new Trend('page_load_ms');
export const errorRate = new Rate('errors');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const WS_URL = __ENV.WS_URL || 'ws://localhost:3000/ws';
const TEST_USER = __ENV.TEST_USER || 'loadtest@example.com';
const TEST_PASS = __ENV.TEST_PASS || 'password';

export let options = {
  vus: __ENV.VUS ? parseInt(__ENV.VUS) : 100,
  duration: __ENV.DURATION || '5m',
  thresholds: {
    'api_latency_ms': ['p(95)<2000'],
    'ws_latency_ms': ['p(95)<2000'],
    'execution_latency_ms': ['p(95)<3000'],
    'errors': ['rate<0.02'],
  },
};

function login() {
  const url = `${BASE_URL}/auth/login`;
  const payload = JSON.stringify({ email: TEST_USER, password: TEST_PASS });
  const params = { headers: { 'Content-Type': 'application/json' } };
  const start = Date.now();
  const res = http.post(url, payload, params);
  apiLatency.add(Date.now() - start);
  const ok = check(res, { 'login 200': (r) => r.status === 200 });
  if (!ok) errorRate.add(1);
  const token = res.json('token') || '';
  return token;
}

function doDashboard(token) {
  const url = `${BASE_URL}/dashboard`;
  const params = { headers: { Authorization: `Bearer ${token}` } };
  const start = Date.now();
  const res = http.get(url, params);
  pageLoad.add(Date.now() - start);
  check(res, { 'dashboard 200': (r) => r.status === 200 });
}

function createOrder(token) {
  const url = `${BASE_URL}/orders`;
  const body = JSON.stringify({ symbol: 'BTCUSD', side: 'BUY', size: 0.001, price: 30000 });
  const params = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
  const start = Date.now();
  const res = http.post(url, body, params);
  apiLatency.add(Date.now() - start);
  const ok = check(res, { 'order created': (r) => r.status === 201 || r.status === 200 });
  if (!ok) errorRate.add(1);
  const orderId = res.json('id') || res.json('orderId') || null;
  return orderId;
}

function pollExecution(token, orderId) {
  if (!orderId) return;
  const url = `${BASE_URL}/orders/${orderId}`;
  const params = { headers: { Authorization: `Bearer ${token}` } };
  const start = Date.now();
  let status = null;
  for (let i = 0; i < 6; i++) {
    const res = http.get(url, params);
    status = res.json('status');
    if (status === 'EXECUTED' || status === 'FILLED') break;
    sleep(1);
  }
  execLatency.add(Date.now() - start);
}

function doPayment(token) {
  const url = `${BASE_URL}/payments`;
  const body = JSON.stringify({ amount: 10.0, currency: 'USD', method: 'test_card' });
  const params = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
  const start = Date.now();
  const res = http.post(url, body, params);
  apiLatency.add(Date.now() - start);
  check(res, { 'payment 200': (r) => r.status === 200 || r.status === 201 });
}

function doChallengeUpdate(token) {
  const url = `${BASE_URL}/challenges`; // list or update endpoint
  const params = { headers: { Authorization: `Bearer ${token}` } };
  const start = Date.now();
  const res = http.get(url, params);
  apiLatency.add(Date.now() - start);
  check(res, { 'challenges 200': (r) => r.status === 200 });
}

function terminalFlow(token) {
  // open websocket and ping/pong to check latency
  const url = `${WS_URL}?token=${token}`;
  const res = ws.connect(url, null, function (socket) {
    socket.on('open', function () {
      const t0 = Date.now();
      socket.send(JSON.stringify({ type: 'ping' }));
      socket.on('message', function (msg) {
        const delta = Date.now() - t0;
        wsLatency.add(delta);
        socket.close();
      });
    });
    socket.setTimeout(function () {
      socket.close();
    }, 5000);
  });
  check(res, { 'ws status 101': (r) => r && r.status === 101 });
}

export default function () {
  // single VU flow: login -> dashboard -> terminal -> orders -> payments -> challenge
  const token = login();
  if (token) {
    group('dashboard', function () { doDashboard(token); });
    group('terminal', function () { terminalFlow(token); });
    group('orders', function () { const oid = createOrder(token); pollExecution(token, oid); });
    group('payments', function () { doPayment(token); });
    group('challenges', function () { doChallengeUpdate(token); });
  } else {
    errorRate.add(1);
  }
  sleep(1 + Math.random() * 2);
}
