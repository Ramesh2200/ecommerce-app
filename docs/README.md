# AuraCraft E-Commerce Technical Documentation

This directory contains technical documentation, system specifications, database schemas, and visual workflow diagrams for the **AuraCraft E-Commerce Platform**.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [API Reference](#api-reference)
4. [Workflow Diagrams](workflow_diagrams.md)
5. [Frontend Design System](#frontend-design-system)

---

## 1. System Architecture

AuraCraft is built as a lightweight, high-performance full-stack web application:

- **Frontend Layer**: HTML5, Vanilla CSS3 (Custom Glassmorphism Design System, CSS variables, CSS grid/flex, micro-animations), Vanilla JavaScript (ES6 Modules). Zero heavy frontend frameworks required.
- **Backend REST API**: Node.js with Express.js server (`server.js`). Handles request routing, JSON middleware, JWT authentication, CORS, and SQL database queries.
- **Database Engine**: Relational SQLite3 database (`database/ecommerce.db`). Stored directly in the project directory for zero external database configuration.

---

## 2. Database Schema

The database consists of 5 relational tables:

- **`users`**: Customer and Admin credentials.
- **`products`**: Inventory catalog with category tags, ratings, prices, and stock counters.
- **`reviews`**: Product ratings and review text from buyers.
- **`orders`**: Completed checkout orders with JSON shipping address objects and payment statuses.
- **`order_items`**: Individual item line entries linked to orders.

---

## 3. API Reference

### Authentication Endpoints
- `POST /api/auth/register` - Create new user account.
- `POST /api/auth/login` - Authenticate user & return JWT token.
- `GET /api/auth/me` - Fetch profile details for logged-in user.

### Product Catalog Endpoints
- `GET /api/products` - List products with optional query filters (`category`, `search`, `minPrice`, `maxPrice`, `sort`).
- `GET /api/products/categories` - Distinct categories list with counts.
- `GET /api/products/:id` - Fetch single product with full gallery and customer reviews.
- `POST /api/products/:id/reviews` - Submit product review.
- `POST /api/products` - Admin: Add new product to catalog.
- `PUT /api/products/:id` - Admin: Update existing product details.
- `DELETE /api/products/:id` - Admin: Delete product from catalog.

### Order Processing Endpoints
- `POST /api/orders` - Submit new order, deduct product stock, return order confirmation.
- `GET /api/orders/my-orders` - Fetch logged-in user's order history.
- `GET /api/orders/admin/metrics` - Admin: Gross revenue, total orders, average order value metrics.
- `PATCH /api/orders/:id/status` - Admin: Update order fulfillment status (*Processing, Shipped, Delivered*).

---

## 4. Workflow Diagrams

For comprehensive sequence diagrams, user purchase flow, authentication flow, and ER diagrams, please see [workflow_diagrams.md](workflow_diagrams.md).
