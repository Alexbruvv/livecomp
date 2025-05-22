install:
    bun install

dev:
    bun dev

generate:
    cd apps/server && bun --bun drizzle-kit generate

migrate:
    cd apps/server && bun --bun drizzle-kit migrate

build:
    cd apps/client && bun run build