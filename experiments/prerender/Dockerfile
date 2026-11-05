FROM node:26-slim AS deps
RUN npm install -g pnpm@10.28.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile

FROM deps AS build
RUN pnpm --filter @ssg-react-demo/prerender build

FROM deps AS dev
WORKDIR /repo/experiments/prerender
CMD ["pnpm", "exec", "rsbuild", "dev", "--host", "0.0.0.0", "--port", "3000"]

FROM nginx:1.29-alpine AS web
COPY experiments/prerender/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/experiments/prerender/build/nginx/csr-routes.map /etc/nginx/csr-routes.map
COPY --from=build /repo/experiments/prerender/dist /usr/share/nginx/html

FROM mcr.microsoft.com/playwright:v1.64.1-noble AS e2e
RUN npm install -g pnpm@10.28.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
WORKDIR /repo/experiments/prerender
CMD ["pnpm", "exec", "playwright", "test"]
