# Local Collection Manager - Sneaker Vault
**Course:** CPSC 3750  
**Project:** Solo Project 1

## Overview
This is a Single Page Application (SPA) that helps collectors track their sneaker inventory. It demonstrates CRUD functionality (Create, Read, Update, Delete) using vanilla JavaScript and persists data via the browser's LocalStorage.

## Features
* **Dashboard Stats:** Real-time calculation of total pairs and portfolio value.
* **Persistence:** Data is saved to LocalStorage, so it survives page refreshes.
* **Input Validation:** Prevents invalid data entry.
* **Safety:** Delete confirmation dialog prevents accidental removal.
* **Pre-loaded Data:** Application initializes with 30 starter records if the database is empty.

## Setup Instructions (How to Run)
This project is designed to run locally using XAMPP.

1.  Ensure **XAMPP** is installed and **Apache** is running.
2.  Locate your XAMPP web root (typically `C:\xampp\htdocs` on Windows or `/Applications/XAMPP/xamppfiles/htdocs` on macOS).
3.  Create a folder named `sneaker_manager` inside `htdocs`.
4.  Copy the following project files into that folder:
    * `index.html`
    * `style.css`
    * `app.js`
5.  Open your web browser and navigate to:
    `http://localhost/sneaker_manager/`

## Technology Stack
* HTML5
* CSS3
* JavaScript (ES6+)
* LocalStorage API