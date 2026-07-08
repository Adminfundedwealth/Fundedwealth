FROM node:22.11-alpine

WORKDIR /app

# Install pnpm directly via corepack with the correct version
RUN npm install -g pnpm@9.15.0 --ignore-scripts

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Build
RUN pnpm --filter @workspace/api-server run build

EXPOSE 9010

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
