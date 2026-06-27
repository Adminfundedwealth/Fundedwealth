#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const report = {
  timestamp: new Date().toISOString(),
  checks: {},
  status: 'CHECKING'
};

// Check 1: dist/index.mjs exists
const distPath = path.join(__dirname, 'dist', 'index.mjs');
report.checks.build_exists = fs.existsSync(distPath);

// Check 2: .env file has required keys
const envPath = path.join(__dirname, '.env');
const hasEnv = fs.existsSync(envPath);
if (hasEnv) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  report.checks.env_database_url = envContent.includes('DATABASE_URL');
  report.checks.env_clerk_key = envContent.includes('CLERK_SECRET_KEY');
  report.checks.env_supabase = envContent.includes('SUPABASE_URL');
} else {
  report.checks.env_database_url = false;
  report.checks.env_clerk_key = false;
  report.checks.env_supabase = false;
}

// Check 3: package.json has required deps
const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
report.checks.has_bcrypt = !!pkg.dependencies.bcrypt;
report.checks.has_zod = !!pkg.dependencies.zod;
report.checks.has_express = !!pkg.dependencies.express;

// Check 4: key files exist
report.checks.src_index_exists = fs.existsSync(path.join(__dirname, 'src', 'index.ts'));
report.checks.src_auth_exists = fs.existsSync(path.join(__dirname, 'src', 'routes', 'auth.ts'));

// Summary
const passing = Object.values(report.checks).filter(v => v === true).length;
const total = Object.keys(report.checks).length;
report.passing = passing;
report.total = total;
report.ready_for_build = report.checks.env_database_url && report.checks.env_clerk_key && report.checks.env_supabase;
report.ready_for_runtime = report.ready_for_build && report.checks.build_exists;

// Output
const output = JSON.stringify(report, null, 2);
console.log(output);
fs.writeFileSync(path.join(__dirname, 'simple_diagnostic_report.json'), output);
console.log('\nReport saved to: simple_diagnostic_report.json');
