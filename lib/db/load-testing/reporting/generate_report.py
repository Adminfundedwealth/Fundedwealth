#!/usr/bin/env python3
"""
Simple k6 summary JSON -> HTML report generator.
Usage: python3 generate_report.py summary.json report.html
"""
import json
import sys
from datetime import datetime

if len(sys.argv) < 3:
    print("Usage: generate_report.py <summary.json> <out.html>")
    sys.exit(2)

infile = sys.argv[1]
outfile = sys.argv[2]

with open(infile, 'r', encoding='utf-8') as f:
    data = json.load(f)

metrics = data.get('metrics', {})

def metric_value(name):
    m = metrics.get(name)
    if not m:
        return 'n/a'
    return m.get('values', {}).get('avg') or m.get('values', {}).get('count') or 'n/a'

html = []
html.append('<html><head><meta charset="utf-8"><title>k6 Summary</title></head><body>')
html.append(f'<h1>k6 Summary — {datetime.utcnow().isoformat()} UTC</h1>')
html.append('<h2>Top-level metrics</h2>')
html.append('<ul>')
for name, m in metrics.items():
    typ = m.get('type')
    vals = m.get('values', {})
    html.append(f'<li><strong>{name}</strong> ({typ}) — {vals}</li>')
html.append('</ul>')

html.append('<h2>Selected metrics</h2>')
for key in ['http_req_duration', 'http_req_failed', 'api_latency_ms', 'ws_latency_ms', 'execution_latency_ms']:
    m = metrics.get(key)
    html.append('<div style="margin-bottom:12px">')
    html.append(f'<h3>{key}</h3>')
    if m:
        html.append('<pre>')
        html.append(json.dumps(m.get('values', {}), indent=2))
        html.append('</pre>')
    else:
        html.append('<p>n/a</p>')
    html.append('</div>')

html.append('</body></html>')

with open(outfile, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html))

print(f'Generated report: {outfile}')
