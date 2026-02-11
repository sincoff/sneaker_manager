# Sneaker Vault Pro — Collection Manager
**Course:** CPSC 3750 | **Project:** Solo Project 3
**Developer:** Ian Sincoff

---

> **NOTE:** The backend is hosted on Render's free tier, which spins down after periods of inactivity. **The first request may take up to 1 minute** while the server cold-starts. After that initial load, all subsequent requests will be fast. Please allow time for the data to appear on first visit.

## Live Deployment
* **Production App (Custom Domain):** [https://sneaker-manager.xyz](https://sneaker-manager.xyz)
* **Backend API (Render):** [https://sneaker-manager.onrender.com/sneakers](https://sneaker-manager.onrender.com/sneakers)

---

## Project Overview
A full-stack, production-grade web application for managing a sneaker inventory. The app supports full CRUD functionality with data stored in a PostgreSQL database, deployed on a distributed cloud architecture, and accessible through a custom domain with HTTPS.

---

## Architecture & Tech Stack

| Component | Technology | Hosting Provider | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript | **Netlify** | Static asset hosting with custom domain DNS. |
| **Backend** | Python 3.10, Flask | **Render** | REST API handling business logic and SQL connections. |
| **Database** | PostgreSQL | **Neon** | Serverless SQL database for persistent storage. |
| **Domain** | DNS / CNAME Record | **GoDaddy** | Custom domain `sneaker-manager.xyz` routing to Netlify. |

---

## Features

### 1. Full CRUD (Create, Read, Update, Delete)
* **Create:** Add new sneakers with Brand, Model, Size, Value, and Image URL.
* **Read:** View inventory in a responsive card/grid layout with images.
* **Update:** Edit any record — form auto-populates with existing data.
* **Delete:** Remove records with a confirmation dialog before deletion.
* **Persistence:** All data stored in **PostgreSQL** on Neon — survives restarts and is consistent across devices.

### 2. Search, Sort & Pagination
* **Search:** Real-time filtering by Brand or Model name.
* **Sorting:** Sort by Newest, Price (Low→High / High→Low), or Brand (A–Z).
* **Pagination:** Configurable page size (5, 10, 20, 50).
* **Cookie Memory:** Page size preference saved in a browser cookie and restored on reload.
* Paging works correctly with search and sorting combined.

### 3. Images
* Each record includes an image displayed in the List View.
* Users can provide an Image URL when adding/editing a record.
* If no image is provided, a default sneaker image is used.
* If an image fails to load, a fallback placeholder is displayed (no broken UI).

### 4. Stats View
* **Total Pairs:** Count of all records in the database.
* **Total Value:** Sum of all sneaker values (domain-specific statistic).
* **Page Size:** Currently selected page size displayed.

### 5. UI/UX
* Production-quality design with consistent spacing and layout.
* Responsive CSS Grid adapts to mobile, tablet, and desktop.
* Success toast notifications after add, update, and delete operations.
* Error messages on failures; empty state messaging when no records found.
* Delete confirmation dialog before removing any record.

---

## Database Schema

The application uses a single `sneaker` table in PostgreSQL:

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY`, auto-increment | Unique record identifier |
| `brand` | `VARCHAR(50)` | `NOT NULL` | Sneaker brand (e.g., Nike, Adidas) |
| `model` | `VARCHAR(100)` | `NOT NULL` | Sneaker model name |
| `size` | `FLOAT` | `NOT NULL` | Shoe size (e.g., 10.5) |
| `value` | `FLOAT` | `NOT NULL` | Dollar value of the sneaker |
| `image_url` | `VARCHAR(500)` | `NULLABLE` | URL to a product image |

The table is auto-created on first startup via SQLAlchemy's `db.create_all()`. If fewer than 30 records exist, the app seeds 30 default sneaker entries.

---

## Configuration & Secrets
Sensitive data is **never** committed to source code. This project uses **Environment Variables**.

* **Local Development:** Variables managed via a `.env` file (excluded from Git via `.gitignore`).
* **Production (Render):** Variables set in the Render Dashboard under Environment settings.
  * `DATABASE_URL` — Connection string for the Neon PostgreSQL database.

---

## Deployment Guide

### Frontend (Netlify) — Manual Deploy
1. In the Netlify Dashboard, go to **Deploys → Drag and drop**.
2. Drag the project folder (containing `index.html`, `app.js`, `style.css`, and the `images/` folder) into the deploy zone.
3. Netlify processes and publishes the site within seconds.
4. Custom domain `sneaker-manager.xyz` is configured in Netlify → Domain Management with DNS handled by GoDaddy (CNAME `www` → Netlify subdomain).
5. HTTPS is automatically provisioned by Netlify (Let's Encrypt).

### Backend (Render)
1. Render is connected to the GitHub repository and auto-deploys from the `main` branch.
2. Build command: `pip install -r requirements.txt`
3. Start command: `gunicorn flask_app:app` (or `python flask_app.py`)
4. Environment variable `DATABASE_URL` is set in the Render Dashboard.
5. The backend runs at `https://sneaker-manager.onrender.com`.

### Database (Neon)
* PostgreSQL hosted on [Neon](https://neon.tech).
* Tables are auto-created on first backend startup via SQLAlchemy `db.create_all()`.
* Seed data (30 records) is automatically inserted if fewer than 30 records exist.
* Connection string provided to Render via the `DATABASE_URL` environment variable.

### How to Update the App
1. Make code changes locally.
2. **Frontend:** Drag and drop the updated project folder into Netlify's deploy area (Deploys → Drag and drop).
3. **Backend:** `git add . && git commit -m "description" && git push` — Render auto-redeploys from `main`.

---

## Local Setup Instructions

### 1. Backend
```bash
cd backend_code
pip install -r requirements.txt
# Set your DATABASE_URL environment variable:
# Windows PowerShell: $env:DATABASE_URL="your_neon_connection_string"
# Mac/Linux: export DATABASE_URL="your_neon_connection_string"
python flask_app.py
```
The API will start at `http://localhost:5000`.

### 2. Frontend
Open `index.html` in a browser, or serve via XAMPP/Live Server at `http://localhost/sneaker_manager/`.

> **Note:** For local development, update `API_URL` in `app.js` to point to `http://localhost:5000/sneakers`.

---

## Submission Checklist
- [x] Live custom domain URL: https://sneaker-manager.xyz
- [x] HTTPS enabled (Netlify auto-provisions SSL)
- [x] SQL database: PostgreSQL on Neon
- [x] 30+ seeded records on first launch
- [x] Full CRUD operations persist to PostgreSQL
- [x] Delete confirmation implemented
- [x] Each record displays an image in the List View
- [x] Broken/missing images handled with fallback placeholder
- [x] Search/filtering by brand or model
- [x] Sorting by newest, price, brand
- [x] Configurable page size (5, 10, 20, 50)
- [x] Page size preference persisted via cookie
- [x] Stats view: total records, page size, total value
- [x] GitHub repository submitted
- [x] Documentation (this README) covers all required fields
