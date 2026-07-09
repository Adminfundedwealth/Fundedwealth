import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fundedwealth_dev'
});

async function setupTestData() {
  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Create test user
    const userId = 'test-user-' + Date.now();
    const clerkId = 'user_test_' + Date.now();
    const email = 'test@fundedwealth.com';

    const userResult = await client.query(
      `INSERT INTO users (id, "clerkId", email, "firstName", "lastName")
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET "clerkId" = $2
       RETURNING id, "clerkId"`,
      [userId, clerkId, email, 'Test', 'User']
    );

    const createdUser = userResult.rows[0];
    console.log('✓ Created test user:', createdUser.id);

    // Create trading account chain
    const traderId = 'trader-' + Date.now();
    const traderResult = await client.query(
      `INSERT INTO terminal_traders (id, external_id, email, display_name, plan, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [traderId, createdUser.id, email, 'Test Trader', '1step', 'active']
    );

    console.log('✓ Created terminal_trader:', traderId);

    // Create challenge account
    const challengeAccountId = 'challenge-' + Date.now();
    const challengeResult = await client.query(
      `INSERT INTO challenge_accounts (id, trader_id, type, plan, initial_balance, current_balance, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        challengeAccountId, 
        traderId, 
        'funded', 
        '1step', 
        1000000, 
        1000000, 
        'active',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ]
    );

    console.log('✓ Created challenge_account:', challengeAccountId);

    // Create trading account
    const tradingAccountId = 'trading-' + Date.now();
    const accountCode = 'FW' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const tradingResult = await client.query(
      `INSERT INTO trading_accounts (id, trader_id, challenge_id, account_code, balance, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [tradingAccountId, traderId, challengeAccountId, accountCode, 1000000, 'active']
    );

    console.log('✓ Created trading_account:', tradingAccountId);

    // Output for test script
    console.log('\nTEST_DATA_JSON:' + JSON.stringify({
      userId: createdUser.id,
      clerkId: createdUser.clerkId,
      traderId: traderId,
      challengeAccountId: challengeAccountId,
      tradingAccountId: tradingAccountId,
      accountCode: accountCode,
      email: email
    }));

    await client.end();
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
}

setupTestData();
