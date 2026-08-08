-- ============================================================================
-- Seed: Initial blog posts for FundedWealth
-- Date: 2026-08-09
-- Purpose: Populate blog_posts with initial articles so /blog is not empty.
-- SAFE TO RE-RUN: Uses INSERT ... ON CONFLICT DO NOTHING
-- Run in: Supabase SQL Editor → project nysrxvpjdlvzvcawysvh
-- ============================================================================

INSERT INTO public.blog_posts
  (title, slug, excerpt, content, category, author, read_time, is_featured, is_published, published_at, created_at, updated_at)
VALUES

-- 1. Featured: 5 Golden Rules (flagship article)
(
  '5 Golden Rules Every Prop Trader Must Follow',
  '5-golden-rules-every-prop-trader-must-follow',
  'Discipline separates profitable traders from the rest. Learn the 5 rules that our top-performing traders swear by.',
  '<h2>Why Rules Matter in Prop Trading</h2>
<p>Prop trading is not about luck — it is about discipline, consistency, and following a proven set of principles. At FundedWealth, India''s leading prop trading firm, our top-funded traders share one thing in common: they follow these 5 golden rules without exception.</p>
<h2>Rule 1: Never Risk More Than 1% Per Trade</h2>
<p>The single biggest killer of funded accounts is oversizing positions. Limit every trade to a maximum of 1% of your account balance. This keeps you in the game even after a losing streak.</p>
<h2>Rule 2: Always Use a Stop-Loss</h2>
<p>No trade should ever be entered without a pre-defined stop-loss. This is non-negotiable. A stop-loss protects your capital and ensures one bad trade does not wipe out a week of profits.</p>
<h2>Rule 3: Trade With the Trend</h2>
<p>On NSE and BSE, price tends to move in trends. Use simple indicators like the 20 EMA to identify the trend direction. Only take trades in the direction of the dominant trend.</p>
<h2>Rule 4: Maintain a 1:2 Risk-Reward Minimum</h2>
<p>For every trade, your potential profit should be at least twice your potential loss. A 1:2 risk-reward ratio means you can be right only 40% of the time and still be profitable.</p>
<h2>Rule 5: Review Your Trades Every Week</h2>
<p>Keep a trading journal. Every Sunday, review your week''s trades. What worked? What did not? Continuous improvement is what separates funded traders from those who keep failing evaluations.</p>
<h2>Conclusion</h2>
<p>These 5 rules are not just theory — they are the foundation of every successful funded trader at FundedWealth. Ready to get funded? Our plans start at just ₹999. <strong>Start your prop trading journey today at FundedWealth.</strong></p>',
  'Prop Trading Tips',
  'FundedWealth Team',
  '5 min read',
  TRUE,
  TRUE,
  NOW(),
  NOW(),
  NOW()
),

-- 2. Understanding Drawdown
(
  'Understanding Drawdown: Your #1 Risk Metric',
  'understanding-drawdown-your-1-risk-metric',
  'Drawdown is the most critical metric in prop trading. Here''s how to monitor, manage, and recover from drawdown effectively.',
  '<h2>What Is Drawdown?</h2>
<p>Drawdown refers to the peak-to-trough decline in your account value over a specific period. In prop trading, two types of drawdown matter: <strong>daily drawdown</strong> and <strong>maximum drawdown</strong>.</p>
<h2>Daily Drawdown</h2>
<p>Most prop firms, including FundedWealth, use a daily drawdown limit — typically 5% of your account. This means if your account is at ₹1,00,000, you cannot lose more than ₹5,000 in a single trading day.</p>
<h2>Maximum Drawdown</h2>
<p>The maximum drawdown is the total loss allowed from your starting balance — usually 10%. Breach this limit and your challenge or funded account is terminated.</p>
<h2>How to Monitor Drawdown in Real-Time</h2>
<p>Use your broker''s P&L dashboard to track intraday losses. Many traders set an alarm at 3% daily loss as an early warning signal before hitting the 5% hard limit.</p>
<h2>Recovery Strategy</h2>
<p>If you hit 3% drawdown, stop trading for the day. Come back fresh tomorrow. Trying to recover losses in the same session is the fastest way to blow an account.</p>
<h2>Conclusion</h2>
<p>Master your drawdown management and you will pass any prop trading evaluation. FundedWealth offers funded accounts from ₹999 — get started today.</p>',
  'Risk Management',
  'Ravi Kumar',
  '7 min read',
  FALSE,
  TRUE,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),

-- 3. Nifty 50 Analysis
(
  'Nifty 50 Weekly Analysis: Key Levels to Watch',
  'nifty-50-weekly-analysis-key-levels-to-watch',
  'Our technical breakdown of Nifty''s current structure, support/resistance levels, and what to expect this week.',
  '<h2>Nifty 50 Overview</h2>
<p>The Nifty 50 is India''s benchmark stock market index, representing the top 50 companies listed on the NSE. Understanding its structure is essential for every Indian prop trader.</p>
<h2>Current Market Structure</h2>
<p>Nifty is currently in a <strong>higher highs, higher lows</strong> pattern on the daily timeframe, indicating a bullish trend. The 20-day EMA is acting as dynamic support.</p>
<h2>Key Support Levels</h2>
<ul>
<li><strong>24,500</strong> — Immediate support; recent consolidation zone</li>
<li><strong>24,200</strong> — Strong demand zone; 50-day EMA confluence</li>
<li><strong>23,800</strong> — Major structural support; previous breakout level</li>
</ul>
<h2>Key Resistance Levels</h2>
<ul>
<li><strong>25,100</strong> — Immediate resistance; recent swing high</li>
<li><strong>25,500</strong> — All-time high zone; major supply</li>
</ul>
<h2>Trading Strategy This Week</h2>
<p>Look for buy-on-dip opportunities near the 24,500 support with a stop below 24,200. For aggressive traders, breakout above 25,100 with volume can offer a target of 25,500.</p>
<h2>Conclusion</h2>
<p>Stay disciplined, respect your levels, and manage your risk. Ready to trade with a funded account? FundedWealth plans start at ₹999.</p>',
  'Market Analysis',
  'Priya Sharma',
  '6 min read',
  FALSE,
  TRUE,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
),

-- 4. Psychology: Revenge Trading
(
  'The Psychology Behind Revenge Trading',
  'the-psychology-behind-revenge-trading',
  'Why do traders revenge trade after a loss? Understanding the psychology helps you break the cycle.',
  '<h2>What Is Revenge Trading?</h2>
<p>Revenge trading occurs when a trader, after a significant loss, immediately enters another trade to try to win back the lost money. It is driven by emotion, not analysis — and it almost always makes things worse.</p>
<h2>The Psychology at Play</h2>
<p>When we lose money, our brain activates the same emotional response as physical pain. The desire to eliminate that pain — to "get even" with the market — overrides rational thinking. This is called <strong>loss aversion bias</strong>.</p>
<h2>Why Revenge Trading Destroys Prop Accounts</h2>
<p>In a funded account, a single revenge trading session can trigger your daily drawdown limit. What starts as a small loss becomes account termination within hours.</p>
<h2>How to Break the Cycle</h2>
<ol>
<li><strong>Set a hard stop</strong> — Stop trading after 2 consecutive losses</li>
<li><strong>Step away</strong> — Close your terminal for at least 1 hour</li>
<li><strong>Journal the loss</strong> — Write down what happened and why</li>
<li><strong>Review your rules</strong> — Reconnect with your trading plan</li>
</ol>
<h2>Conclusion</h2>
<p>The best traders in the world lose trades. The difference is they do not let losses control their next decision. Build mental discipline alongside technical skills. FundedWealth rewards disciplined traders — start your funded journey for ₹999.</p>',
  'Trading Psychology',
  'FundedWealth Team',
  '8 min read',
  FALSE,
  TRUE,
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days'
),

-- 5. RSI + MACD
(
  'How to Use RSI and MACD Together for Better Trades',
  'how-to-use-rsi-and-macd-together',
  'Combining RSI and MACD gives you a powerful confirmation system. Learn the exact setup our traders use.',
  '<h2>Why Combine RSI and MACD?</h2>
<p>Using two indicators together eliminates many false signals that each produces individually. RSI measures momentum and overbought/oversold conditions; MACD identifies trend direction and crossovers. Together, they form a powerful confirmation system.</p>
<h2>RSI Settings for Indian Markets</h2>
<p>Use a 14-period RSI on the 15-minute or 1-hour chart. Key levels: below 40 = oversold (look for buys), above 60 = overbought (look for sells).</p>
<h2>MACD Settings</h2>
<p>Standard MACD (12, 26, 9) works well for NSE intraday trading. A bullish MACD crossover occurs when the MACD line crosses above the signal line.</p>
<h2>The Combined Entry Strategy</h2>
<ul>
<li><strong>Buy signal:</strong> RSI below 40 AND MACD bullish crossover → enter long</li>
<li><strong>Sell signal:</strong> RSI above 60 AND MACD bearish crossover → enter short</li>
<li><strong>Filter:</strong> Only trade in the direction of the higher-timeframe trend</li>
</ul>
<h2>Risk Management</h2>
<p>Always place a stop below the recent swing low (for longs) and target a 1:2 risk-reward minimum.</p>
<h2>Conclusion</h2>
<p>This RSI + MACD system is simple, rule-based, and works well on Nifty, Bank Nifty, and individual stocks. Practice it, then apply it to your FundedWealth challenge. Plans from ₹999.</p>',
  'Technical Analysis',
  'Arjun Nair',
  '6 min read',
  FALSE,
  TRUE,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '5 days'
),

-- 6. Scaling success story
(
  'From ₹1L to ₹25L: A Prop Trading Scaling Story',
  'from-rs1l-to-rs25l-a-scaling-success-story',
  'How Sneha Patel scaled her funded account from ₹1 Lakh to ₹25 Lakhs in just 6 months.',
  '<h2>Meet Sneha Patel, Funded Trader</h2>
<p>Sneha Patel, a 27-year-old trader from Pune, started her prop trading journey with FundedWealth with a ₹1 Lakh funded account. Six months later, she is managing ₹25 Lakhs in trading capital. Here is her story.</p>
<h2>Month 1–2: Learning the Rules</h2>
<p>Sneha spent her first two months focusing entirely on rule compliance — never exceeding daily drawdown, always using stop-losses, and trading only during the first 90 minutes of the NSE session.</p>
<h2>Month 3–4: Consistent Profitability</h2>
<p>After establishing consistent profitability (2–3% per month), Sneha applied for her first scale-up. FundedWealth doubled her capital to ₹2 Lakhs.</p>
<h2>Month 5–6: Accelerated Growth</h2>
<p>With larger capital and the same disciplined approach, Sneha continued to compound. Through three consecutive scale-ups, she reached ₹25 Lakhs in trading capital.</p>
<h2>Sneha''s Top 3 Tips</h2>
<ol>
<li>Trade only 2–3 setups per day maximum</li>
<li>Never move a stop-loss to avoid being stopped out</li>
<li>Withdraw profits regularly — it keeps you psychologically stable</li>
</ol>
<h2>Start Your Journey</h2>
<p>FundedWealth offers funded accounts starting at just ₹999. Your scaling journey could start today.</p>',
  'Prop Trading Tips',
  'FundedWealth Team',
  '4 min read',
  FALSE,
  TRUE,
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '6 days'
),

-- 7. Position sizing
(
  'Position Sizing: The 1.5% Rule Explained for Prop Traders',
  'position-sizing-the-1-5-percent-rule-explained',
  'Never risk more than 1.5% per trade. Here''s the exact formula and why it works.',
  '<h2>What Is Position Sizing?</h2>
<p>Position sizing determines how many shares or lots you buy on each trade. It is the single most important risk management decision you make, and most traders get it wrong.</p>
<h2>The 1.5% Rule</h2>
<p>Risk no more than 1.5% of your trading capital on any single trade. For a ₹1,00,000 account, maximum risk per trade = ₹1,500.</p>
<h2>The Formula</h2>
<p><strong>Position Size = Risk Amount ÷ (Entry Price - Stop Loss Price)</strong></p>
<p>Example: Account = ₹1,00,000. Risk = 1.5% = ₹1,500. Entry = ₹500. Stop = ₹490. Risk per share = ₹10. Position size = 1500 ÷ 10 = <strong>150 shares</strong>.</p>
<h2>Why 1.5% and Not More?</h2>
<p>With 1.5% risk per trade, you can have 6 consecutive losing trades and still have 91% of your capital intact. This keeps you well within the 10% maximum drawdown limit of most prop firms.</p>
<h2>Dynamic Position Sizing</h2>
<p>As your account grows through scale-ups, recalculate your risk amount. Always base it on current capital, not starting capital.</p>
<h2>Conclusion</h2>
<p>Consistent position sizing is the foundation of long-term profitability. Combine it with a solid strategy and get funded with FundedWealth from ₹999.</p>',
  'Risk Management',
  'Deepak Mehta',
  '5 min read',
  FALSE,
  TRUE,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
),

-- 8. Bank Nifty expiry strategies
(
  'Bank Nifty Expiry Day Trading Strategies for Indian Traders',
  'bank-nifty-expiry-day-strategies',
  'Expiry days offer unique opportunities. Learn 3 strategies specifically designed for Bank Nifty expiry trading.',
  '<h2>Why Expiry Day Is Different</h2>
<p>Bank Nifty weekly expiry (every Wednesday) creates unique volatility patterns. Options lose time value rapidly, creating both traps and opportunities for skilled traders.</p>
<h2>Strategy 1: The Opening Range Breakout</h2>
<p>Mark the high and low of the first 15 minutes after market open (9:15–9:30 AM). A breakout above the high with volume = buy. A breakdown below the low = sell. Stop loss at the opposite end of the range. Target: 1.5× the range size.</p>
<h2>Strategy 2: Strike Pinning</h2>
<p>Large option writers often defend round number strikes (e.g., 45,000, 45,500) near expiry. Watch for Bank Nifty to oscillate around these levels and trade reversals at the strike boundaries.</p>
<h2>Strategy 3: Avoid the Last Hour Trap</h2>
<p>The last 30 minutes of expiry day (3:00–3:30 PM) are extremely volatile and unpredictable. Unless you are an experienced trader, avoid positions during this window.</p>
<h2>Risk Management for Expiry Day</h2>
<p>Use tighter stop-losses on expiry day — no more than 0.75% risk per trade. The volatility cuts both ways.</p>
<h2>Conclusion</h2>
<p>Expiry day trading requires a specific playbook. Master these strategies and apply them in your funded account. Start with FundedWealth from ₹999.</p>',
  'Technical Analysis',
  'Vikram Singh',
  '7 min read',
  FALSE,
  TRUE,
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '8 days'
),

-- 9. Why traders fail
(
  'Why 90% of Traders Fail (And How to Be the 10%)',
  'why-90-percent-of-traders-fail',
  'The statistics are brutal, but the solution is simple. Here''s what separates winners from losers in trading.',
  '<h2>The Brutal Reality</h2>
<p>Studies consistently show that 80–90% of retail traders lose money. In prop trading, the failure rate at evaluation stage is even higher. But the reasons are not mysterious — they are predictable and preventable.</p>
<h2>Reason 1: No Written Trading Plan</h2>
<p>Most failing traders have no written plan. They enter trades based on tips, feelings, or social media calls. Winners have a documented strategy with clear entry, exit, and risk rules.</p>
<h2>Reason 2: Ignoring Risk Management</h2>
<p>The #1 account killer is oversizing. Traders risk 5–10% on a single trade because they are "sure" it will work. One wrong call wipes out weeks of gains.</p>
<h2>Reason 3: Emotional Decision Making</h2>
<p>Fear and greed drive more trading decisions than analysis. Cutting winners short, holding losers too long, and revenge trading are all emotional responses that erode capital.</p>
<h2>Reason 4: Lack of Patience</h2>
<p>The best setups appear 2–3 times per week, not 20 times per day. Overtrading due to boredom or FOMO is a consistent wealth destroyer.</p>
<h2>How to Be in the 10%</h2>
<ol>
<li>Write your trading plan and stick to it</li>
<li>Risk no more than 1–1.5% per trade</li>
<li>Stop trading after 2 consecutive losses in a day</li>
<li>Review your trades every week without exception</li>
</ol>
<h2>Conclusion</h2>
<p>The 10% are not smarter. They are just more disciplined. Join the 10% with FundedWealth — India''s #1 prop trading firm. Plans from ₹999.</p>',
  'Trading Psychology',
  'FundedWealth Team',
  '9 min read',
  FALSE,
  TRUE,
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '9 days'
)

ON CONFLICT (slug) DO NOTHING;
