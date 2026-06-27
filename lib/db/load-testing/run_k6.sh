#!/usr/bin/env bash
# Run k6 with a profile. Usage: run_k6.sh <VUS> <DURATION>

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT="$ROOT_DIR/k6/scenario.js"

VUS=${1:-100}
DURATION=${2:-5m}

SUMMARY="summary-${VUS}.json"
OUTJSON="out-${VUS}.json"

echo "Running k6: VUS=${VUS}, DURATION=${DURATION}"

# Allow pushing to InfluxDB if K6_OUT_INFLUX is set
OUT_OPTS="--summary-export=${SUMMARY} --out json=${OUTJSON}"
if [ -n "${K6_OUT_INFLUX:-}" ]; then
  OUT_OPTS+=" --out ${K6_OUT_INFLUX}"
fi

# Prefer dockerized k6 if k6 not installed
if command -v k6 >/dev/null 2>&1; then
  k6 run --vus ${VUS} --duration ${DURATION} ${OUT_OPTS} ${SCRIPT}
else
  echo "k6 not found locally — falling back to docker image loadimpact/k6"
  docker run --rm -i loadimpact/k6 run --vus ${VUS} --duration ${DURATION} ${OUT_OPTS} - < ${SCRIPT}
fi

echo "Summary saved: ${SUMMARY}, raw output: ${OUTJSON}"
