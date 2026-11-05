FROM node:22-slim AS build
RUN npm install -g pnpm@10.28.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @ssg-react-demo/prerender build

FROM nginx:1.29-alpine AS web
COPY experiments/prerender/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/experiments/prerender/dist /usr/share/nginx/html

FROM mcr.microsoft.com/playwright:v1.64.1-noble AS e2e
RUN npm install -g pnpm@10.28.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
WORKDIR /repo/experiments/prerender
CMD ["pnpm", "exec", "playwright", "test"]
