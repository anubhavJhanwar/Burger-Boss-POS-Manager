# Burger Boss POS Manager

A full-stack Cafe POS + Inventory + Expense + Order Management web application built for restaurant operations.

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express + Firebase Firestore
- **Auth:** Email + PIN based authentication
- **Database:** Firebase Firestore

## Features

- Email + PIN based login & signup
- Menu management with Excel/CSV upload
- POS system with cart, add-ons, and inventory warnings
- Visual recipe builder with ingredient mapping
- Automatic inventory deduction on payment
- Pending orders workflow with payment processing (Cash / UPI / Card / Split)
- Expense tracking with category support
- Dashboard with real-time sales and expense metrics
- Order history
- Toast notifications and confirm modals (no browser alerts)

## Project Structure

```
├── backend/         # Node.js + Express API
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       └── utils/
├── frontend/        # React + Vite app
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── utils/
```

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/anubhavJhanwar/Burger-Boss-POS-Manager.git
cd Burger-Boss-POS-Manager
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your Firebase credentials in .env
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL to your backend URL
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email@project.iam.gserviceaccount.com
EMAIL_USER=your-email@gmail.com         # optional
EMAIL_PASSWORD=your-app-password        # optional
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5000/api
```

## Deployment

- **Backend:** Render (set environment variables in dashboard)
- **Frontend:** Vercel (set `VITE_API_URL` to your Render backend URL)

## Local URLs

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
