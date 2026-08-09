# AuraCraft - Premium E-Commerce Platform

> A full-stack, high-performance E-Commerce platform with dynamic product catalog, category filtering, cart management, checkout processing, order history, and admin dashboard.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live--Production-emerald?logo=vercel)](https://ecommerce-app-ruby-rho.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Ramesh2200%2Fecommerce--app-indigo?logo=github)](https://github.com/Ramesh2200/ecommerce-app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Key Features

- 🛒 **Dynamic Product Catalog**: High-resolution Unsplash product image galleries, price badges, stock counters, ratings, and feature lists.
- 🔍 **Search & Category Filtering**: Real-time multi-criteria filtering by category (Audio, Wearables, Electronics, Home & Living, Accessories), price range, and search query.
- 💳 **Seamless Checkout & Cart**: LocalStorage cart persistence, order summary calculations, address collection, and simulated payment processing.
- 📦 **Order Management**: Order history log, status tracking (Processing, Completed), and order detail view.
- 🔐 **Authentication & Roles**: Customer and Admin login/registration with demo credential support.

---

## 🔑 Demo Account Credentials

| Attribute | Value |
|---|---|
| **Demo Email** | `codealpha123@gmail.com` |
| **Demo Password** | `Code123` |
| **Live App URL** | [https://ecommerce-app-ruby-rho.vercel.app](https://ecommerce-app-ruby-rho.vercel.app) |
| **Live API Endpoint** | [https://ecommerce-app-ruby-rho.vercel.app/api/products](https://ecommerce-app-ruby-rho.vercel.app/api/products) |

---

## 📐 Architecture & Workflow Diagrams

### System Architecture Diagram

```mermaid
graph TD
    subgraph Storefront ["Frontend Storefront - HTML5 and CSS3"]
        Index["Homepage and Catalog"]
        Product["Product Details"]
        Checkout["Cart and Checkout"]
        Admin["Admin Dashboard"]
    end

    subgraph BackendAPI ["Backend API - Node.js and Express"]
        Server["Express Server"]
        AuthRouter["Auth Controller"]
        ProductRouter["Product Controller"]
        OrderRouter["Order Controller"]
    end

    subgraph Storage ["Data and Storage Layer"]
        DB["SQLite Serverless Memory Store"]
    end

    Index --> ProductRouter
    Product --> ProductRouter
    Checkout --> OrderRouter
    Admin --> OrderRouter
    
    AuthRouter --> DB
    ProductRouter --> DB
    OrderRouter --> DB
```

### E-Commerce Purchase & Order Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Shopper
    participant Storefront as AuraCraft Web App
    participant API as Express API Server
    participant DB as Product & Order DB

    Customer->>Storefront: Browse Catalog and Filter Category
    Storefront->>API: GET /api/products?category=Audio
    API->>DB: Query Products WHERE category = 'Audio'
    DB-->>API: Return Product Records
    API-->>Storefront: JSON Products Response

    Customer->>Storefront: Add Product to Cart and Click Checkout
    Storefront->>Customer: Display Cart Summary and Shipping Form
    
    Customer->>Storefront: Fill Address and Click Place Order
    Storefront->>API: POST /api/orders (cartItems, total, shippingAddress)
    API->>DB: INSERT INTO orders and order_items
    DB-->>API: Order Created
    API-->>Storefront: HTTP 201 Created
    
    Storefront-->>Customer: Render Order Confirmation Page
```

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+), FontAwesome / Lucide Icons
- **Backend**: Node.js, Express.js, CORS, Body-Parser
- **Database**: SQLite3 / Node-SQLite / Serverless In-Memory Fallback
- **Deployment**: Vercel Serverless Functions & Static Asset CDN

---

## 💻 Local Development Guide

### 1. Clone Repository
```bash
git clone https://github.com/Ramesh2200/ecommerce-app.git
cd ecommerce-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database & Start Server
```bash
npm run seed
npm start
```
- **Local Web Storefront**: `http://localhost:3030`
- **Health Check Endpoint**: `http://localhost:3030/api/health`
