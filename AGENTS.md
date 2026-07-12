# AGENTS.md

## Repo Guidance

- **Runtime**: Bun (v1.3.5+). Always use `bun` — never npm/yarn/pnpm
- **Language**: TypeScript throughout (backend + frontend)
- **Repo state**: Greenfield assessment project. No code exists yet — all source must be created from scratch
- **Key reference files**: `INSTRUCTIONS.md` (the spec), `JD.md` (job context, not technical)
- **No existing CI, linting, formatting, or test config** — must be created as part of implementation
- **No existing AGENTS.md, CLAUDE.md, or cursor rules** — this file is the first

---

## Assessment Implementation Plan

Build a microservice backend (NestJS) + dynamic form frontend (Next.js) per INSTRUCTIONS.md.

### A. Project Structure

Bun workspace monorepo. Root `package.json` with `workspaces: ["backend/*", "client"]`.

```
revest-assessment/
├── package.json              # workspace root
├── backend/
│   ├── product-service/      # NestJS microservice (port 3001)
│   └── order-service/        # NestJS microservice (port 3002)
├── client/                   # Next.js app (port 3000)
├── INSTRUCTIONS.md
├── JD.md
└── README.md
```

Each NestJS service is a standalone project within the workspace with its own `package.json`, `nest-cli.json`, and `tsconfig.json`.

### B. Backend: Product Service

- NestJS app, HTTP on port 3001, TCP microservice on port 4001
- **Entity**: `Product { id, name, description, price, stock, createdAt, updatedAt }`
- **REST Controller**: `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`
- **TCP Message Handlers**: `get_product`, `validate_stock`, `update_stock` — consumed by Order Service
- TypeORM + SQLite (`product.sqlite`)
- Validation via `class-validator` + `class-transformer` DTOs

### C. Backend: Order Service

- NestJS app, HTTP on port 3002, TCP client connecting to Product Service
- **Entity**: `Order { id, items: [{productId, quantity}], totalAmount, status, createdAt }`
- **REST Controller**: `GET /orders`, `GET /orders/:id`, `POST /orders`, `PUT /orders/:id`, `DELETE /orders/:id`
- **POST /orders flow**: calls Product Service TCP (`validate_stock`, `get_product`) → verifies availability → calculates total → decrements stock via `update_stock` → saves order
- **GET /orders/:id**: returns order with populated product details (fetched via TCP)
- TypeORM + SQLite (`order.sqlite`)

### D. Inter-Service Communication

- NestJS built-in TCP transport (`@nestjs/microservices`)
- Product Service runs as hybrid app (HTTP + TCP microservice)
- Order Service registers Product Service as a TCP client in its module
- Message patterns:
  - `get_product` → `{ productId }` → returns Product entity
  - `validate_stock` → `{ productId, quantity }` → returns `{ available: boolean }`
  - `update_stock` → `{ productId, quantity }` → decrements stock, returns updated Product

### E. Frontend: Next.js Client

- Next.js 14+ with App Router + TypeScript
- Material UI (`@mui/material`) for all UI components
- React Hook Forms (`react-hook-form`) for form validation

**Dynamic Form System:**
- `DynamicForm` component reads JSON schema array, renders each field by `fieldType`:
  - `TEXT` → MUI `TextField` with `minLength`/`maxLength` validation
  - `LIST` → MUI `Select` populated from `listOfValues1`
  - `RADIO` → MUI `RadioGroup` populated from `listOfValues1`
- Each field uses `name` as label, `defaultValue` for initial value, `required` for validation
- Form state managed by React Hook Forms with schema-driven validation rules

**Pages:**
- `/` — landing/dashboard
- `/signup` — dynamic form (signup with the JSON-driven fields)
- `/products` — product list + create/edit forms (calls product service API)
- `/orders` — order list + create/edit forms (calls order service API)

**Data Persistence:**
- localStorage for form submissions and custom component state
- Direct API calls to backend services (or Next.js API route proxy)

### F. Database

- SQLite via TypeORM — each service gets its own `.sqlite` file
- Use `synchronize: true` for assessment scope (no migration files needed)
- Entities defined in each service's `entities/` directory

### G. Commands

```bash
# Install all dependencies (from root)
bun install

# Run product service (dev mode)
cd backend/product-service && bun run start:dev

# Run order service (dev mode)
cd backend/order-service && bun run start:dev

# Run client (dev mode)
cd client && bun run dev
```

Root `package.json` should also have scripts to run all services concurrently:
```bash
bun run dev          # runs all three services
```

### H. Implementation Order

1. Set up Bun workspace + root `package.json`
2. Scaffold NestJS product service (module, entity, DTOs, controller, service, TCP handlers)
3. Scaffold NestJS order service (module, entity, DTOs, controller, service, TCP client)
4. Verify backend integration: create product → create order → GET order with product details
5. Scaffold Next.js client app with TypeScript
6. Build dynamic form component system from JSON schema
7. Add Material UI styling and responsiveness
8. Wire up API calls from client to both backend services
9. Add localStorage persistence for form submissions
10. End-to-end testing of full flow
11. Update `README.md` with complete run instructions

### I. Key Gotchas

- NestJS hybrid app setup: call `app.connectMicroservice()` before `app.startAllMicroservices()`
- Order Service must be a TCP **client**, not a server — register Product Service transport in `ClientModule`
- CORS: enable `app.enableCors()` in both NestJS services for frontend access
- Next.js client needs `NEXT_PUBLIC_PRODUCT_API_URL` and `NEXT_PUBLIC_ORDER_API_URL` env vars
- Product stock decrement must be atomic — check stock > quantity before decrementing
