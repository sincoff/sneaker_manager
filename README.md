# Local Collection Manager - Sneaker Vault
**Course:** CPSC 3750  
**Project:** Solo Project 1

## Overview
A local web app for tracking a sneaker collection. It supports full CRUD operations (Create, Read, Update, Delete) and saves data to the browser's localStorage so changes persist after a refresh.

## Features
* **CRUD Operations:** Add, edit, and delete sneakers.
* **Persistence:** Uses localStorage to save data between sessions.
* **Stats View:** Auto-calculates total pairs and total portfolio value.
* **Safety:** Includes a confirmation prompt before deleting items.
* **Seed Data:** Auto-generates 30 starter records if the list is empty.

## How to Run (XAMPP)
1.  Make sure **Apache** is running in XAMPP.
2.  Navigate to your web root (`C:\xampp\htdocs`).
3.  Create a folder named `sneaker_manager`.
4.  Place `index.html`, `style.css`, and `app.js` inside.
5.  Go to `http://localhost/sneaker_manager/` in your browser.

## Tech Stack
* HTML/CSS
* JavaScript (ES6)
* LocalStorage API
