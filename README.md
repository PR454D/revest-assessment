# Revest Assessment

A full-stack assessment app with NestJS product/order microservices, SQLite databases, and a Next.js frontend with Material UI.

## Running Locally

```bash
# Install dependencies
bun install # in all projects, (backend/product, backend/order, client)

# Run all services (product, order, client)
bun run dev
```

The client will be available at http://localhost:3000, product service at :3001, and order service at :3002.

To run services individually:

```bash
bun run dev:product   # Product service (port 3001)
bun run dev:order     # Order service (port 3002)
bun run dev:client    # Next.js frontend (port 3000)
```

To run tests:

```bash
bun run test
```
