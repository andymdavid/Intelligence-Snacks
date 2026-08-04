FROM oven/bun:1-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG PUBLIC_INCLUDE_REVIEW=false
ENV PUBLIC_INCLUDE_REVIEW=${PUBLIC_INCLUDE_REVIEW}
RUN bun run build

FROM oven/bun:1-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server ./server
EXPOSE 80
CMD ["bun", "run", "server/index.ts"]
