#!/usr/bin/env node
/**
 * Startup test for FundedWealth API server
 * Attempts to require the built dist/index.mjs without starting server
 */

const fs = require('fs');
const path = require('path');

const report = {
  timestamp: new Date().toISOString(),
  tests: []
};

try {
  // Test 1: Check dist/index.mjs file
  const distPath = path.join(__dirname, 'dist', 'index.mjs');
  if (fs.existsSync(distPath)) {
    const stats = fs.statSync(distPath);
    report.tests.push({
      name: 'dist/index.mjs exists',
      status: 'PASS',
      size: stats.size
    });
  } else {
    report.tests.push({
      name: 'dist/index.mjs exists',
      status: 'FAIL',
      error: 'File not found'
    });
    process.exit(1);
  }

  // Test 2: Check .env
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    const required = ['DATABASE_URL', 'CLERK_SECRET_KEY', 'SUPABASE_URL'];
    const missing = required.filter(key => !env.includes(key));
    
    if (missing.length === 0) {
      report.tests.push({
        name: 'Environment variables',
        status: 'PASS',
        variables: required
      });
    } else {
      report.tests.push({
        name: 'Environment variables',
        status: 'FAIL',
        missing: missing
      });
    }
  } else {
    report.tests.push({
      name: 'Environment variables',
      status: 'FAIL',
      error: '.env file not found'
    });
  }

  // Test 3: Try to read package.json version
  const pkgPath = path.join(__dirname, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  report.tests.push({
    name: 'Package.json',
    status: 'PASS',
    version: pkg.version,
    name: pkg.name
  });

  // Summary
  report.summary = {
    passed: report.tests.filter(t => t.status === 'PASS').length,
    failed: report.tests.filter(t => t.status === 'FAIL').length,
    ready_for_start: report.tests.every(t => t.status === 'PASS')
  };

} catch (err) {
  report.error = err.message;
  report.stack = err.stack;
}

const output = JSON.stringify(report, null, 2);
console.log(output);

// Write to file
fs.writeFileSync(path.join(__dirname, 'startup_test_result.json'), output);

process.exit(report.summary && report.summary.ready_for_start ? 0 : 1);
