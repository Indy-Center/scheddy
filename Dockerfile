FROM oven/bun:1 as builder

WORKDIR /app
COPY package*.json ./
COPY bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-slim as runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["bun", "./build"] 