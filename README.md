# ⚡ AuraCraft - Modern Full-Stack E-Commerce Platform

> Built for CodeAlpha Project ([www.codealpha.tech](https://www.codealpha.tech))

AuraCraft is a full-stack e-commerce web application featuring a modern glassmorphic frontend UI, Express.js (Node.js) REST API backend, relational SQLite database, JWT authentication, dynamic currency switching (USD ↔ INR), and an Admin Analytics Dashboard.

---

## 🌟 Key Features

- **🏬 Product Catalog & Filtering**: Grid listing of products with instant category filter chips (*Audio, Wearables, Accessories, Electronics, Home & Living*), live search bar, and sorting (*Price Low-High / High-Low, Highest Rated, Newest*).
- **💱 Real-time USD to INR Currency Switching**: Dynamic currency selector in the header toggling all catalog prices, cart totals, checkout summary, and order tracking between **USD ($)** and **INR (₹)** at 1 USD = ₹83.50 INR.
- **🛒 Interactive Shopping Cart**: Slide-over drawer cart with quantity adjustments, item removal, local storage persistence, and promo discount application (`CODEALPHA10` - 10% OFF, `WELCOME20` - 20% OFF).
- **📦 Order Processing & Checkout**: Pre-filled checkout shipping form (*Ramesh K, Bengaluru, India*), tax calculation, payment methods (Credit/Debit Card, PayPal, UPI), and order placement API with automatic stock deduction.
- **📜 Order History Dashboard (`orders.html`)**: Customer order tracking screen displaying order numbers (e.g. `ORD-20260807-1317`), status badges (*Processing, Shipped, Delivered*), item breakdowns, shipping address, and payment method details.
- **📊 Admin Analytics Dashboard (`admin.html`)**: Gross revenue metrics KPI cards, SVG sales performance trend chart, category sales progress bars, order status management, and full product CRUD operations.
- **🔐 User Authentication**: Registration and Login modal dialogs powered by password hashing (`bcryptjs`) and JSON Web Tokens (`JWT`).

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism Design System, CSS Variables, Flexbox/Grid, Micro-Animations), Vanilla JavaScript (ES6 Modules).
- **Backend API**: Node.js, Express.js REST API.
- **Database**: SQLite3 (`database/ecommerce.db`).
- **Auth**: JWT (JSON Web Tokens), `bcryptjs`.
- **Documentation**: Markdown, Mermaid Diagrams.

---

## 📸 Screenshots & Documentation

- **[Technical Documentation](docs/README.md)**
- **[System Architecture & Workflow Diagrams](docs/workflow_diagrams.md)**

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16+ recommended)
- npm

### 1. Clone & Install Dependencies
```bash
cd /Users/chinnesh/.gemini/antigravity-ide/scratch/ecommerce-app
npm install
```

### 2. Initialize Database (Optional)
The database comes pre-seeded with sample products, initial reviews, and test accounts:
```bash
node database/seed.js
```

### 3. Start the Express Server
```bash
node server.js
```

### 4. Open in Web Browser
Open your browser at:
**[http://localhost:3030](http://localhost:3030)**

---

## 🔑 Test Credentials

- **Customer**: `jane@example.com` / `user123`
- **Admin**: `admin@codealpha.tech` / `admin123`

---

## 📁 Directory Structure

```
ecommerce-app/
├── README.md               # Project overview & documentation
├── server.js               # Express.js REST API server (Port 3030)
├── package.json
├── docs/                   # Documentation & Workflow Diagrams
│   ├── README.md
│   └── workflow_diagrams.md
├── database/
│   ├── db.js               # SQLite connection helper
│   ├── seed.js             # Database schema & initial seed script
│   ├── update-prices.js    # Price adjustment script
│   └── ecommerce.db        # SQLite relational database file
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   └── orderController.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   └── orderRoutes.js
├── middleware/
│   └── authMiddleware.js   # JWT authentication middleware
└── public/
    ├── index.html          # Main storefront catalog
    ├── product.html        # Product details & gallery
    ├── checkout.html       # Checkout & payment form
    ├── orders.html         # User order tracking dashboard
    ├── admin.html          # Admin analytics & inventory manager
    ├── css/
    │   └── styles.css      # Design system & keyframe micro-animations
    ├── js/
    │   ├── currency.js     # USD / INR currency conversion module
    │   ├── api.js          # API fetch wrapper
    │   ├── auth.js         # Auth state & modal controller
    │   ├── cart.js         # Cart state & drawer UI controller
    │   ├── app.js          # Catalog controller
    │   ├── product-detail.js
    │   ├── checkout.js
    │   ├── orders.js
    │   └── admin.js        # Admin metrics & CRUD controller
    └── images/
        └── hero-bg.png     # Futuristic hero banner background
```

---

## 📜 License & Credits

Designed & developed for CodeAlpha Internship Project ([www.codealpha.tech](https://www.codealpha.tech)).
