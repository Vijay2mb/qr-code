# QR Code-Based Visitor Management System

## Run the project
1. Extract the ZIP file.
2. Open `index.html` in a modern browser. An internet connection is needed for Google Fonts and the QR-code library CDN.
3. Sign in with the demo credentials:
   - Username: `admin`
   - Password: `admin123`

## Included features
- Login page and logout
- Dashboard summary cards
- Visitor registration with name, phone, purpose, and host
- QR pass generation and print layout
- Visitor log search and status filter
- Simulated entrance scan to toggle entry/exit status and timestamp
- Admin records table and CSV export
- Browser `localStorage` persistence
- Responsive layout for desktop and mobile

## Important
This is a front-end prototype for learning/demo use. Login credentials are hard-coded and are NOT secure authentication. Visitor data is stored only in the current browser. Before real deployment, build a backend (for example Python Flask), hash passwords, use server-side sessions and validation, protect personal data, and connect a real database and QR scanner/camera integration.
