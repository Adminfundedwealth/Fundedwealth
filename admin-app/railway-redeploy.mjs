/**
 * Trigger a Railway redeploy via GraphQL API
 */
const TOKEN = 'hmVwz7FrWR4kTiGrSWf_EzMkYod-31aiaUOA5KW5LIR';
const SERVICE_ID = 'f2f00ffd-e354-4909-aa27-cd20d7ab5733';
const ENV_ID = '16f08975-7d0d-4624-afeb-3ac5f2743402';

// Step 1: Get the latest deployment ID for this service
const LIST_DEPLOYMENTS = `
query ListDeployments($serviceId: String!, $environmentId: String!) {
  deployments(
    input: { serviceId: $serviceId, environmentId: $environmentId }
    first: 1
  ) {
    edges {
      node {
        id
        status
        createdAt
      }
    }
  }
}
`;

// Step 2: Redeploy using that deployment ID
const REDEPLOY = `
mutation Redeploy($id: String!) {
  deploymentRedeploy(id: $id)
}
`;

async function gql(query, variables = {}) {
  const r = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(10000),
  });
  return r.json();
}

// Get latest deployment
console.log('Finding latest deployment...');
const listResult = await gql(LIST_DEPLOYMENTS, { serviceId: SERVICE_ID, environmentId: ENV_ID });

if (listResult.errors) {
  console.log('Error listing deployments:', JSON.stringify(listResult.errors));
  
  // Try alternative: serviceInstanceRedeploy
  console.log('\nTrying serviceInstanceRedeploy...');
  const REDEPLOY_INSTANCE = `
  mutation ServiceInstanceRedeploy($serviceId: String!, $environmentId: String!) {
    serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
  }
  `;
  const r2 = await gql(REDEPLOY_INSTANCE, { serviceId: SERVICE_ID, environmentId: ENV_ID });
  console.log('Result:', JSON.stringify(r2));
  process.exit(0);
}

const deployments = listResult.data?.deployments?.edges || [];
if (deployments.length === 0) {
  console.log('No deployments found');
  process.exit(1);
}

const latest = deployments[0].node;
console.log(`Latest deployment: ${latest.id} (${latest.status}) at ${latest.createdAt}`);

// Trigger redeploy
console.log('\nTriggering redeploy...');
const redeployResult = await gql(REDEPLOY, { id: latest.id });
console.log('Redeploy result:', JSON.stringify(redeployResult));

if (redeployResult.errors) {
  console.log('\nFailed. Try manually: Railway → fundedwealth-api → Deployments → three dots → Redeploy');
} else {
  console.log('\n✅ Redeploy triggered! Wait ~2 minutes then test again.');
}

process.exit(0);
