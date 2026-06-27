#!/usr/bin/env bash
set -euo pipefail

# Blue-green deployment script for Kubernetes
# Usage: ./scripts/deploy_blue_green.sh --image <image> --namespace <ns> --service <service>

while [[ $# -gt 0 ]]; do
  case $1 in
    --image) IMAGE="$2"; shift 2;;
    --namespace) NAMESPACE="$2"; shift 2;;
    --service) SERVICE_NAME="$2"; shift 2;;
    --help) echo "Usage: $0 --image <image> --namespace <ns> --service <service>"; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

if [ -z "${IMAGE:-}" ] || [ -z "${NAMESPACE:-}" ] || [ -z "${SERVICE_NAME:-}" ]; then
  echo "--image, --namespace and --service are required"; exit 2
fi

kubectl() { command kubectl --kubeconfig=kubeconfig "$@"; }

DEPLOY_BASE=${SERVICE_NAME}

# Determine color to deploy (green if blue exists, else blue)
if kubectl -n "$NAMESPACE" get deploy "${DEPLOY_BASE}-green" >/dev/null 2>&1; then
  NEW_COLOR=blue
else
  NEW_COLOR=green
fi

NEW_DEPLOY_NAME="${DEPLOY_BASE}-${NEW_COLOR}"
OLD_COLOR=$( [ "$NEW_COLOR" = "green" ] && echo blue || echo green )
OLD_DEPLOY_NAME="${DEPLOY_BASE}-${OLD_COLOR}"

echo "Creating deployment: $NEW_DEPLOY_NAME -> image: $IMAGE"

# Create new deployment from template, replacing image and name
envsubst <<EOF | kubectl -n "$NAMESPACE" apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${NEW_DEPLOY_NAME}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${DEPLOY_BASE}
      color: ${NEW_COLOR}
  template:
    metadata:
      labels:
        app: ${DEPLOY_BASE}
        color: ${NEW_COLOR}
    spec:
      containers:
        - name: ${DEPLOY_BASE}
          image: ${IMAGE}
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
EOF

echo "Waiting for new pods to be ready"
kubectl -n "$NAMESPACE" rollout status deploy/$NEW_DEPLOY_NAME --timeout=180s

echo "Switching service selector to color=${NEW_COLOR}"
kubectl -n "$NAMESPACE" patch svc $SERVICE_NAME -p "{"'"spec"'":{"'"selector"'": {"'"app"'":"'"${DEPLOY_BASE}"'","'"color"'":"'"${NEW_COLOR}"'"}}}"

echo "Service now pointing to $NEW_DEPLOY_NAME"

echo "Waiting for traffic to stabilize (30s)"
sleep 30

# Optional: scale down and remove old deployment
if kubectl -n "$NAMESPACE" get deploy "$OLD_DEPLOY_NAME" >/dev/null 2>&1; then
  echo "Deleting old deployment: $OLD_DEPLOY_NAME"
  kubectl -n "$NAMESPACE" delete deploy "$OLD_DEPLOY_NAME" --ignore-not-found
fi

echo "Blue-green deploy completed"
