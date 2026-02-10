# Cloud Collection Manager (Pro Edition)
**Course:** CPSC 3750 | **Project:** Solo Project 3
**Developer:** [Your Name]

## 🚀 Live Deployment
* **Production App (Custom Domain):** [https://www.your-custom-domain.xyz](https://www.your-custom-domain.xyz)
* **Backend API (Render):** [https://sneaker-api.onrender.com/sneakers](https://sneaker-api.onrender.com/sneakers)

## 📋 Project Overview
This is a full-stack, production-grade web application for managing a sneaker inventory. Unlike previous iterations, this version is deployed on a distributed cloud architecture using a SQL database, supports image handling, and features advanced data controls like server-side sorting, filtering, and configurable pagination.

## 🏗️ Architecture & Tech Stack
This project uses a decoupled **Client-Server** architecture:

| Component | Technology | Hosting Provider | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript | **Netlify** | Static asset hosting with custom domain DNS. |
| **Backend** | Python 3.10, Flask | **Render** | REST API handling business logic and SQL connections. |
| **Database** | PostgreSQL | **Neon** | Serverless SQL database for persistent storage. |
| **Domain** | DNS / CNAME Record | **GoDaddy** | Custom domain routing to Netlify. |

## 🔋 Features
### 1. Advanced Data Management (CRUD + SQL)
* **Create:** Add new sneakers with Brand, Model, Size, Value, and Image URL.
* **Read:** View inventory in a responsive grid layout.
* **Update:** Edit any record details instantly.
* **Delete:** Remove records with a safety confirmation dialog.
* **Persistence:** All data is stored in a **PostgreSQL** database, ensuring data survives server restarts and is consistent across devices.

### 2. Professional UI/UX
* **Image Handling:** Displays product images for every record. Includes automatic fallback placeholders for broken or missing image links.
* **Responsive Grid:** CSS Grid layout adapts to mobile, tablet, and desktop screens.
* **Visual Feedback:** Loading states, empty state messages ("No sneakers found"), and confirmation alerts.

### 3. Server-Side Controls
* **Pagination:** Users can configure page size (5, 10, 20, 50).
* **Cookie Memory:** The application remembers your preferred page size setting using browser cookies.
* **Search:** Real-time filtering by Brand or Model name.
* **Sorting:** Sort data by:
    * Newest (ID Descending)
    * Price (Low to High)
    * Price (High to Low)
    * Brand Name (A-Z)

## ⚙️ Configuration & Secrets
Sensitive data (Database Credentials) is **not** stored in the source code. This project uses **Environment Variables** for security.

* **Local Development:** Variables are managed via a `.env` file (excluded from Git).
* **Production (Render):** Variables are set in the Render Dashboard.
    * `DATABASE_URL`: The connection string for the Neon PostgreSQL database.

## 🛠️ Local Setup Instructions
If you wish to run this project locally for grading or development:

**1. Backend Setup**
```bash
cd backend
pip install -r requirements.txt
# Set your DATABASE_URL environment variable here
python flask_app.py
