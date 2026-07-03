const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const bundles = [];
  
  // Capture all JS requests
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/assets/App-') && url.endsWith('.js')) {
      console.log(`\n=== FOUND APP BUNDLE ===`);
      console.log(`URL: ${url}`);
      console.log(`Status: ${response.status()}`);
      
      try {
        const text = await response.text();
        bundles.push({ url, text });
        
        // Search for onboarding-related code
        const hasOnboardingStatus = text.includes('onboarding-status');
        const hasOnboardingCompleted = text.includes('onboardingCompleted');
        const hasCreatePassword = text.includes('/auth/create-password');
        
        console.log(`\n=== SEARCH RESULTS ===`);
        console.log(`Contains "onboarding-status": ${hasOnboardingStatus}`);
        console.log(`Contains "onboardingCompleted": ${hasOnboardingCompleted}`);
        console.log(`Contains "/auth/create-password": ${hasCreatePassword}`);
        
        if (hasOnboardingStatus || hasOnboardingCompleted || hasCreatePassword) {
          // Extract relevant code snippets
          const lines = text.split('\n');
          lines.forEach((line, idx) => {
            if (line.includes('onboarding-status') || 
                line.includes('onboardingCompleted') || 
                line.includes('/auth/create-password')) {
              
              // Show context (50 chars before and after)
              const match = line.match(/.{0,200}(onboarding-status|onboardingCompleted|\/auth\/create-password).{0,200}/);
              if (match) {
                console.log(`\n--- Line ${idx + 1} ---`);
                console.log(match[0]);
              }
            }
          });
        }
      } catch (e) {
        console.log(`Error reading bundle: ${e.message}`);
      }
    }
  });
  
  console.log('Navigating to https://fundedwealth.com/dashboard...\n');
  
  try {
    await page.goto('https://fundedwealth.com/dashboard', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('\n=== PAGE LOADED ===');
    console.log(`Final URL: ${page.url()}`);
    console.log(`Total App bundles found: ${bundles.length}`);
    
    // Check if redirected
    if (page.url().includes('/auth/create-password')) {
      console.log('\n⚠️  PAGE WAS REDIRECTED TO CREATE-PASSWORD!');
    }
    
  } catch (e) {
    console.log(`\nNavigation error: ${e.message}`);
    console.log(`Current URL: ${page.url()}`);
  }
  
  await browser.close();
})();
