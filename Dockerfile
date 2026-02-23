FROM node:20-bookworm

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

COPY . .

# Install CMS deps
WORKDIR /app/apps/cms/health-cms
RUN pnpm install

# Install Frontend deps
WORKDIR /app/apps/frontend
RUN pnpm install

WORKDIR /app

CMD ["bash"]