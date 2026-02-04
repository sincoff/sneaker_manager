# Cloud Collection Manager - Sneaker Vault
**Course:** CPSC 3750 | **Project:** Solo Project 2

## 🔗 Live Links
* **Frontend (App):** [https://teal-faloodeh-e21a83.netlify.app/](https://teal-faloodeh-e21a83.netlify.app/)
* **Backend (API):** [https://sincoff.pythonanywhere.com/sneakers](https://sincoff.pythonanywhere.com/sneakers)

## 📋 Project Overview
This is a full-stack client/server application. The frontend is hosted on Netlify and communicates via REST API with a Flask backend hosted on PythonAnywhere.

## 🛠️ Technology Stack
* **Frontend:** HTML, CSS, Vanilla JavaScript (Fetch API)
* **Backend:** Python 3.10, Flask
* **Persistence:** Server-side JSON file (`sneakers.json`)

## 💾 JSON Persistence Strategy
Unlike Project 1 (which used LocalStorage), this version persists data on the server.
1.  The Flask backend reads/writes to a file named `sneakers.json`.
2.  When a user performs a CRUD operation (POST, PUT, DELETE), the server updates the JSON file immediately.
3.  This ensures data survives server restarts and is shared across different devices/browsers.

## ✅ Rubric Checklist
* [x] **Hosted on Netlify:** Accessible publicly.
* [x] **Incognito Mode:** Works without local browser storage.
* [x] **Backend:** Written in Python (Flask).
* [x] **Data Storage:** Uses JSON files (No SQL).
* [x] **30 Records:** Auto-generates starter data if JSON is empty.
* [x] **Paging:** Limits view to 10 records per page.
* [x] **Delete Confirmation:** "Are you sure?" dialog implemented.
* [x] **Stats View:** Calculates total pairs and value dynamically.

## 🚀 How to Run Locally (For Grading)
1.  **Backend:**
    * Navigate to `backend_code/`
    * Run `pip install -r requirements.txt`
    * Run `python flask_app.py`
2.  **Frontend:**
    * Open `index.html` in a browser.
    * *Note: You may need to update the API_URL in app.js to `http://127.0.0.1:5000/sneakers` for local testing.*
