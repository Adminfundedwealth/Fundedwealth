/**
 * Find the current Railway service URL for the api-server
 */
const TOKEN = 'hmVwz7FrWR4kTiGrSWf_EzMkYod-31aiaUOA5KW5LIR';
const PROJECT_ID = '5058c1dc-ab42-4276-8cf5-12f94b30ef2d';

const query = `
query GetProject($id: String!) {
  project(id: $id) {
    id name
    services {
      edges {
        node {
          id name
          serviceInstances {
            edges {
              node {
                domains { serviceDomains { domain } customDomains { domain } }
              }
            }
          }
        }
      }
    }
  }
}
`;

try {
  const res = await fetch('https://backboard.railway.com/graphql/v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({ query, variables: { id: PROJECT_ID } }),
    signal: AbortSignal.timeout(10000),
  });
  const data = await res.json();
  
  if (data.errors) {
    console.log('GraphQL errors:', JSON.stringify(data.errors));
    process.exit(1);
  }
  
  const projects = data.data ? [{ node: data.data.project }] : [];
  if (!data.data?.project) {
    console.log('Project not found or token lacks access');
    process.exit(1);
  }
  
  for (const pe of projects) {
    const p = pe.node;
    console.log(`PROJECT: ${p.id} — ${p.name}`);
    for (const se of (p.services?.edges || [])) {
      const s = se.node;
      console.log(`  SERVICE: ${s.id} — ${s.name}`);
      for (const ie of (s.serviceInstances?.edges || [])) {
        const domains = ie.node?.domains;
        const svc = (domains?.serviceDomains || []).map(d => d.domain);
        const custom = (domains?.customDomains || []).map(d => d.domain);
        if (svc.length || custom.length) {
          console.log(`    Railway domains: ${svc.join(', ')}`);
          if (custom.length) console.log(`    Custom domains: ${custom.join(', ')}`);
        }
      }
    }
  }
} catch (e) {
  console.error('Error:', e.message);
}

process.exit(0);
