# Cloud Collection Manager - Sneaker Vault
**Course:** CPSC 3750 | **Project:** Solo Project 2

## 🔗 Live Links
* **Frontend (App):** [https://teal-faloodeh-e21a83.netlify.app/](https://teal-faloodeh-e21a83.netlify.app/)
* **Backend (API):** [https://sincoff.pythonanywhere.com/sneakers](https://sincoff.pythonanywhere.com/sneakers)

## 📝 About
This is a Client/Server web app for tracking a sneaker collection.
* **Frontend:** HTML/JS hosted on **Netlify**.
* **Backend:** Python (Flask) hosted on **PythonAnywhere**.

* The Python backend reads and writes to a specific file (`sneakers.json`) on the server.
* This means data is permanent and stays visible even if you switch browsers or use Incognito mode.

## ✅ Rubric Checklist
* [x] **Hosted on Netlify** (Publicly accessible)
* [x] **Incognito Ready** (Works without local storage)
* [x] **Python Backend** (Flask API)
* [x] **No SQL** (Uses JSON file storage)
* [x] **Paging** (Exactly 10 items per page)
* [x] **Stats View** (Total pairs & value)
* [x] **Delete Confirmation** (Popup before deleting)

## ⚙️ Local Setup (For Code Review)
The backend code is included in the `backend_code/` folder.
1.  **Backend:** Run `pip install -r requirements.txt` then `python flask_app.py`.
2.  **Frontend:** Open `index.html`.
