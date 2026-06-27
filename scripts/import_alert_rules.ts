/*
 * Import alert rules from monitoring/alert_rules_templates.json into the running
 * monitoring API. Usage:
 *   MONITOR_API_URL=http://localhost:3000/api/monitor npm run ts-node scripts/import_alert_rules.ts
 * or
 *   node --experimental-specifier-resolution=node scripts/import_alert_rules.js
 * Ensure the API is reachable and you have appropriate auth if required.
 */
import fs from "fs";
import path from "path";

const apiUrl = process.env.MONITOR_API_URL || "http://localhost:3000/api/monitor/alerts";

async function main() {
  const file = path.resolve(process.cwd(), "monitoring/alert_rules_templates.json");
  if (!fs.existsSync(file)) {
    console.error("Templates not found:", file);
    process.exit(2);
  }

  const raw = fs.readFileSync(file, "utf8");
  const templates = JSON.parse(raw);

  for (const t of templates) {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to import rule", t.name, res.status, text);
      } else {
        const json = await res.json();
        console.log("Imported rule:", json.name || t.name, "id=" + (json.id ?? "?"));
      }
    } catch (err) {
      console.error("Error importing rule", t.name, err);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
