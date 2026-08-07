# AuraCraft E-Commerce System Architecture & Workflow Diagrams

This document outlines the end-to-end system architecture, data models, and user workflow diagrams for the **AuraCraft E-Commerce Application**.

---

## 1. 🏗️ High-Level System Architecture

```mermaid
graph TD
    Client[("🖥️ Web Browser / Client<br/>(HTML5, CSS3, Vanilla JS)")]
    
    subgraph Frontend Modules
        App[app.js - Product Catalog]
        Detail[product-detail.js - Details & Reviews]
        Cart[cart.js - Cart & Drawer UI]
        Checkout[checkout.js - Checkout & Payment]
        Orders[orders.js - Order History]
        Admin[admin.js - Analytics & Management]
        Currency[currency.js - USD/INR Conversion]
    end

    subgraph Express Backend REST API
        AuthRoutes["/api/auth (Auth Controller)"]
        ProductRoutes["/api/products (Product Controller)"]
        OrderRoutes["/api/orders (Order Controller)"]
    end

    subgraph Database Layer
        DB[("SQLite3 Database<br/>ecommerce.db")]
        UsersTable[users Table]
        ProductsTable[products Table]
        ReviewsTable[reviews Table]
        OrdersTable[orders Table]
        ItemsTable[order_items Table]
    end

    Client --> Frontend Modules
    Frontend Modules -->|Fetch / REST API| Express Backend REST API
    Express Backend REST API --> DB
    DB --> UsersTable
    DB --> ProductsTable
    DB --> ReviewsTable
    DB --> OrdersTable
    DB --> ItemsTable
```

---

## 2. 🔄 End-to-End User Purchase & Order Processing Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Storefront as Storefront Catalog (index.html)
    participant DetailPage as Product Detail (product.html)
    participant CartDrawer as Cart Drawer / localStorage
    participant CheckoutPage as Checkout Form (checkout.html)
    participant ExpressAPI as Express REST Server (server.js)
    participant SQLiteDB as SQLite Database (ecommerce.db)

    Customer->>Storefront: Browse products & filter by category/currency
    Customer->>DetailPage: Click product to view details & reviews
    Customer->>DetailPage: Select quantity & click "Add to Cart"
    DetailPage->>CartDrawer: Save item to local storage & update badge counter
    Customer->>CheckoutPage: Click "Proceed to Checkout"
    CheckoutPage->>Customer: Render pre-filled shipping form (Ramesh K, Bengaluru)
    Customer->>CheckoutPage: Select Payment Method & click "Complete Order"
    CheckoutPage->>ExpressAPI: POST /api/orders (items, shippingAddress, paymentMethod)
    
    ExpressAPI->>SQLiteDB: SELECT stock FROM products WHERE id = X
    SQLiteDB-->>ExpressAPI: Verify stock availability
    ExpressAPI->>SQLiteDB: INSERT INTO orders (user_id, order_number, total_amount, shipping_address...)
    ExpressAPI->>SQLiteDB: INSERT INTO order_items (...)
    ExpressAPI->>SQLiteDB: UPDATE products SET stock = stock - quantity
    
    SQLiteDB-->>ExpressAPI: Order saved & ID returned
    ExpressAPI-->>CheckoutPage: 201 Created (Order Number ORD-YYYYMMDD-XXXX)
    CheckoutPage->>CartDrawer: Clear cart storage
    CheckoutPage->>Customer: Display Order Confirmed Modal
    Customer->>CheckoutPage: Click "View My Orders"
```

---

## 3. 🔑 User Authentication Flow (Register & Login)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Auth Modal UI
    participant AuthJS as auth.js (Client)
    participant Express as Express Auth Route (/api/auth)
    participant Bcrypt as Bcrypt Password Hasher
    participant JWT as JWT Signer
    participant DB as SQLite Users Table

    User->>UI: Enter Email & Password
    UI->>AuthJS: Submit Login / Sign Up Form
    
    alt Login Flow
        AuthJS->>Express: POST /api/auth/login
        Express->>DB: SELECT * FROM users WHERE email = ?
        DB-->>Express: Return user record
        Express->>Bcrypt: Compare plain password with stored hash
        alt Password Valid
            Express->>JWT: Sign Token (user_id, email, role)
            JWT-->>Express: Return JWT Bearer Token
            Express-->>AuthJS: 200 OK (Token & User Object)
            AuthJS->>AuthJS: Store token & user in localStorage
            AuthJS->>UI: Close Modal & update Header UI to Logged-In Account
        else Password Invalid
            Express-->>AuthJS: 401 Unauthorized (Invalid Credentials)
            AuthJS->>User: Display Toast Error
        end
    else Register Flow
        AuthJS->>Express: POST /api/auth/register (name, email, password)
        Express->>Bcrypt: Hash password (10 salt rounds)
        Express->>DB: INSERT INTO users (name, email, password, role)
        DB-->>Express: User created (ID)
        Express->>JWT: Sign Token
        Express-->>AuthJS: 201 Created (Token & User Object)
        AuthJS->>UI: Show Welcome Toast & update UI
    end
```

---

## 4. 🗄️ Relational Database ER Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email
        string password
        string role
        datetime created_at
    }

    PRODUCTS {
        int id PK
        string title
        string description
        string category
        float price
        float original_price
        float rating
        int reviews_count
        string image
        text gallery
        int stock
        text features
        datetime created_at
    }

    REVIEWS {
        int id PK
        int product_id FK
        string user_name
        int rating
        string comment
        datetime date
    }

    ORDERS {
        int id PK
        int user_id FK
        string order_number
        float total_amount
        text shipping_address
        string payment_method
        string payment_status
        string status
        datetime created_at
    }

    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        string title
        float price
        int quantity
        string image
    }

    USERS ||--o{ ORDERS : "places"
    PRODUCTS ||--o{ REVIEWS : "receives"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "referenced in"
```

---

## 5. ⚙️ Admin Dashboard & Order Status Management Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant AdminDashboard as Admin Dashboard (admin.html)
    participant AdminJS as admin.js Controller
    participant ExpressAPI as Express REST Server
    participant DB as SQLite DB

    Admin->>AdminDashboard: Open http://localhost:3030/admin.html
    AdminDashboard->>AdminJS: Trigger DOMContentLoaded
    AdminJS->>ExpressAPI: GET /api/orders/admin/metrics
    ExpressAPI->>DB: SELECT SUM(total_amount), COUNT(*)...
    DB-->>ExpressAPI: Metrics payload
    ExpressAPI-->>AdminJS: 200 OK (total_revenue, orders, stock, recentOrders)
    AdminJS->>AdminDashboard: Render KPI Cards, SVG Sales Chart & Recent Orders
    
    Admin->>AdminDashboard: Change Order Status dropdown (e.g. Processing -> Shipped)
    AdminDashboard->>AdminJS: On change event
    AdminJS->>ExpressAPI: PATCH /api/orders/:id/status (status: "Shipped")
    ExpressAPI->>DB: UPDATE orders SET status = "Shipped" WHERE id = :id
    ExpressAPI-->>AdminJS: 200 OK (Status Updated)
    AdminJS->>AdminDashboard: Display Success Toast Notification
```
