# Storeflow / Bictree Storefront

## Overview

StoreFlow is a production-grade MERN e-commerce storefront slice built for the Bictree assignment. It delivers an end-to-end shopping journey from product discovery to atomic checkout with server-side inventory control, strict state synchronization, and a responsive UI based on the Figma MegaMart design language.

---

## Features

- **Product Listing**: Server-driven product catalog with category badges, price ranges, discount badges, and stock availability tags.
- **Server-Side Search & Filtering**: Multi-parameter search, category filtering, min/max price range filtering, price sorting (`price_asc`, `price_desc`), and pagination (`limit`, `page`) handled 100% on the server.
- **Product Detail**: Multi-image thumbnail gallery, variant selection (size and colour combinations), dynamic price updates, and real-time stock feedback.
- **Stock-Aware Add to Cart**: Live variant stock validation preventing requests that exceed available inventory.
- **Server-Side User Cart**: Isolated server-side cart persistence tied strictly to authenticated users via JWT.
- **Centralized Cart State**: Single source of truth via React `CartContext`, keeping the Cart Page, Navbar Badge, and Product Detail page synchronized in real time.
- **JWT Authentication**: Secure user registration, login, password hashing with bcrypt, and profile verification (`/api/auth/me`).
- **Checkout & Order Creation**: Atomic order placement powered by MongoDB ACID transactions.
- **Atomic Stock Decrement & Overselling Protection**: Concurrency-safe inventory decrements using `$elemMatch: { stock: { $gte: qty } }` and `$inc`, guaranteeing stock never falls below zero even under simultaneous checkout races.
- **Stale Cart Handling**: Live stock and price recalculation on cart load. Items with stock changes or depletion remain visible with clear indicators (`Out of stock`, `Only X available`); checkout safely rejects with HTTP 409 without clearing cart or showing fake success.
- **Responsive UI**: Fully responsive across mobile, tablet, and desktop viewports with zero horizontal overflow, adhering to Figma design tokens.

---

## Tech Stack

### Frontend
- **React** (v19) — Component-based architecture with hooks
- **React Router** (v7) — Client-side declarative routing
- **Vanilla CSS** — Custom properties, design tokens, and modular styling adhering to the Figma visual specification
- **Vite** (v8) — Fast development server with proxy configuration and optimized production builds

### Backend
- **Node.js** (v18+) — Runtime environment
- **Express.js** (v4) — REST API routing, controller-service layers, and middleware
- **MongoDB & Mongoose** (v9) — Document database with schema validation and ACID transaction support
- **JSON Web Tokens (`jsonwebtoken`)** — Stateless authentication and route protection
- **bcryptjs** — Password hashing with salt rounds
- **cors** & **dotenv** — Cross-Origin Resource Sharing and environment configuration
- **express-validator** — Server-side request payload validation

---

## Project Structure

```
bectree-store-flow/
├── backend/
│   ├── src/
│   │   ├── config/              # MongoDB connection & DNS configuration
│   │   ├── controllers/         # Request handling & HTTP response logic
│   │   │   ├── authController.js
│   │   │   ├── cartController.js
│   │   │   ├── orderController.js
│   │   │   └── productController.js
│   │   ├── middleware/          # JWT auth guard, error handling, route validators
│   │   ├── models/              # Mongoose schemas (User, Product, Cart, Order)
│   │   ├── routes/              # Express API route declarations
│   │   ├── seed/                # Seed script with mock products and variants
│   │   ├── services/            # Business logic (live cart calculation, stock checks)
│   │   ├── utils/               # Token generators and helper utilities
│   │   └── app.js               # Express application entry point
│   ├── tests/                   # Automated unit & integration tests
│   │   ├── auth.test.js
│   │   ├── cart.test.js
│   │   ├── order.test.js
│   │   └── product.test.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                 # Centralized fetch API client
│   │   │   └── client.js
│   │   ├── components/          # Reusable UI components (Navbar, ProductCard, etc.)
│   │   ├── context/             # React Context providers (AuthContext, CartContext)
│   │   ├── pages/               # Top-level route pages
│   │   │   ├── ProductListingPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── App.jsx              # Route definitions & provider tree
│   │   ├── index.css            # Figma design tokens & application styles
│   │   └── main.jsx             # React DOM entry
│   ├── .env.example
│   ├── vite.config.js           # Vite config with API proxy
│   └── package.json
├── .gitignore
└── README.md
```

---

## Setup & Running Locally

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** instance (local or MongoDB Atlas URI)

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure your environment variables by copying `.env.example`:
```bash
cp .env.example .env
```
Update `.env` with your MongoDB connection string and JWT secret (see [Environment Variables](#environment-variables)).

Seed the database with sample products:
```bash
npm run seed
```

Start the backend development server:
```bash
npm run dev
```
The API server will listen on `http://localhost:5000`.

### 2. Frontend Setup

Open a new terminal window:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```
Open `http://localhost:5173` (or the port indicated by Vite) in your browser.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | Port for Express server | `5000` |
| `MONGO_URI` | MongoDB connection connection string | `mongodb://localhost:27017/storeflow` |
| `JWT_SECRET` | Secret key used to sign JWT tokens | `your_secure_random_jwt_secret` |
| `JWT_EXPIRES_IN` | Token expiration period | `7d` |

> **Security Note:** Never commit `.env` files containing real production credentials. `.gitignore` is configured to prevent environment files from being tracked.

### Frontend (`frontend/.env`)
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL for API requests | `/api` (proxied by Vite to `http://localhost:5000`) |

---

## API Routes

### Health Check
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | No |

### Authentication (`/api/auth`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer Token) |

### Products (`/api/products`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/products` | Paginated product listing with search/filter/sort | No |
| `GET` | `/api/products/categories` | Distinct categories with product counts | No |
| `GET` | `/api/products/:slug` | Full product details including all variants | No |

### Cart (`/api/cart`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/cart` | Get user's cart with live prices and stale flags | Yes (Bearer Token) |
| `POST` | `/api/cart/items` | Add item/variant to cart or increment quantity | Yes (Bearer Token) |
| `PATCH` | `/api/cart/items/:itemId` | Update quantity of a cart item | Yes (Bearer Token) |
| `DELETE` | `/api/cart/items/:itemId` | Remove item from user's cart | Yes (Bearer Token) |

### Orders (`/api/orders`)
| Method | Route | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/orders` | Create order from cart with atomic stock decrement | Yes (Bearer Token) |
| `GET` | `/api/orders` | Retrieve authenticated user's order history | Yes (Bearer Token) |
| `GET` | `/api/orders/:orderId` | Retrieve single order details (ownership protected) | Yes (Bearer Token) |

---

## Stock & Concurrency Handling

Order creation (`POST /api/orders`) validates stock on the server and executes all database updates inside a **MongoDB ACID Transaction**:

1. **Server-Authoritative Price & Stock**: Never trusts client-side totals. The server resolves current live variant prices and stocks directly from MongoDB.
2. **Atomic Stock Decrement Guard**: Stock is decremented using an atomic query with a conditional guard:
   ```javascript
   await Product.findOneAndUpdate(
     {
       _id: item.product,
       variants: {
         $elemMatch: {
           sku: item.variantSku,
           stock: { $gte: item.quantity } // Atomically ensures stock >= requested quantity
         }
       }
     },
     { $inc: { "variants.$.stock": -item.quantity } },
     { session }
   );
   ```
3. **Race Condition Prevention**: If two concurrent checkouts race for a variant with `stock = 1`, only the first transaction decrements stock to `0`. The second fails the `$gte: 1` check, triggers a rollback, returns HTTP `409 Conflict`, and prevents overselling or negative inventory.
4. **Cart Clearing on Success Only**: The user's cart is emptied inside the transaction only after all stock decrements and the `Order` document creation succeed.

---

## Stale Cart Handling

The application accounts for scenarios where inventory or pricing changes between when a product was added and when checkout occurs:

1. **Live Recalculation**: On every `GET /api/cart`, the server dynamically cross-references cart items with live MongoDB product documents.
2. **No Silent Changes**: Stale items (depleted stock, insufficient stock, deleted variants) are **not** silently removed or modified. They remain visible in the cart with clear visual status tags (`Out of stock`, `Only X available`).
3. **Cart Stale Banner**: When `hasStaleItems` is true, an alert banner informs the user to review quantities before proceeding.
4. **Safe Checkout Rejection**: Clicking Checkout with insufficient stock triggers server validation that rejects the request with HTTP `409 Conflict`. The UI catches this, displays a friendly explanation, refreshes the live cart, and preserves the items for user resolution.

---

## Figma / Design Note

Product Detail and Cart layouts were not explicitly provided as dedicated Figma frames. These screens follow the existing storefront visual language (Inter typography, `#008ECC` primary brand color, `#F3F9FB` page background, pill buttons, and subtle border radius) while implementing the required assignment functionality.

---

## Testing

The project includes an automated test suite verifying core business rules, authentication, cart isolation, and concurrent checkout safety using Node.js built-in test runner:

```bash
cd backend
npm test
```

### Verified Test Suites (40 Passing Tests):
- **Auth Module (10 tests)**: User registration, duplicate email rejection (409), password length validation (400), login authentication, invalid credentials rejection (401), and `/api/auth/me` token guard.
- **Cart Module (9 tests)**: Initial empty cart structure, unauthenticated access guard (401), adding items, duplicate item quantity incrementation, stock limit rejection (400), quantity updates, cross-user cart isolation, and item removal.
- **Order Module (9 tests)**: Empty cart order rejection (400), successful atomic checkout and stock decrement, insufficient stock rejection (409), multi-item transaction rollback, concurrent checkout race condition testing (`Promise.all` with stock = 1), and user order isolation.
- **Product Module (12 tests)**: Server-side pagination, category filtering, min/max price range filtering, partial keyword search, price sorting (`asc`/`desc`), category counts, slug retrieval, and 404 handling.

---

## Future Improvements

Potential enhancements for future iterations:
- **Payment Gateway Integration**: Integration with Stripe or Razorpay for payment authorization and webhooks.
- **Checkout Address & Shipping Form**: Multi-step checkout with delivery address selection and shipping fee calculators.
- **Order History & Tracking UI**: Dedicated customer portal to view past order receipts, tracking numbers, and delivery status.
- **Admin Inventory Dashboard**: Back-office interface to manage products, adjust variant stock levels, and monitor orders in real time.
- **Automated End-to-End Testing**: Playwright or Cypress regression test pipelines integrated into CI/CD.
