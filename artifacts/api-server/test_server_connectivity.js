#!/usr/bin/env node
const net = require('net');
const fs = require('fs');
const path = require('path');

let attempts = 0;
const maxAttempts = 10;

function testConnection() {
  attempts++;
  const sock = net.connect({ host: '127.0.0.1', port: 8080 }, () => {
    const result = {
      timestamp: new Date().toISOString(),
      status: 'SERVER_RUNNING',
      port: 8080,
      attempts: attempts
    };
    fs.writeFileSync(path.join(__dirname, 'server_connectivity_test.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
    process.exit(0);
  });

  sock.on('error', (err) => {
    sock.destroy();
    if (attempts < maxAttempts) {
      setTimeout(testConnection, 1000);
    } else {
      const result = {
        timestamp: new Date().toISOString(),
        status: 'SERVER_NOT_RUNNING',
        port: 8080,
        attempts: attempts,
        lastError: err.message
      };
      fs.writeFileSync(path.join(__dirname, 'server_connectivity_test.json'), JSON.stringify(result, null, 2));
      console.log(JSON.stringify(result));
      process.exit(1);
    }
  });

  sock.setTimeout(2000, () => {
    sock.destroy();
    testConnection();
  });
}

testConnection();
