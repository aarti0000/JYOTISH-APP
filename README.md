# 🌟 Jyotish App — Online Astrology Consultation Platform

A full-stack MERN application for booking and consulting with Jyotish (Vedic astrology) experts online.

## Features
- User & Astrologer registration/login (JWT auth)
- Browse astrologers by specialization, language, price
- Book appointments (date/time slot selection)
- Real-time chat via Socket.io
- Video consultation via WebRTC (simple-peer)
- Kundali (birth chart) generation & display
- Payments via Razorpay
- Email notifications (Nodemailer)
- Review & rating system
- Admin dashboard

---

## Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

## Quick Start

### 1. Clone / open the project
```bash
cd jyotish-app
```

### 2. Install all dependencies
```bash
npm run install-all
```

### 3. Set up environment variables

**Server** — create `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/jyotishapp
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Cloudinary (for profile images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:3000
```

**Client** — create `client/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 4. Run the app
```bash
npm run dev
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Folder Structure
```
jyotish-app/
├── server/                   # Node.js + Express backend
│   ├── config/               # DB & cloudinary config
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express API routes
│   ├── controllers/          # Route handlers / business logic
│   ├── middleware/            # Auth, error handling, upload
│   ├── services/             # Kundali engine, email, payment
│   ├── socket/               # Socket.io chat & signalling
│   └── server.js             # App entry point
│
└── client/                   # React frontend
    └── src/
        ├── components/       # Reusable UI components
        ├── pages/            # Page-level components
        ├── context/          # React Context (auth, socket)
        ├── hooks/            # Custom hooks
        └── utils/            # API helpers, formatters
```

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, Socket.io-client |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Video | WebRTC via simple-peer |
| Payments | Razorpay |
| Images | Cloudinary + Multer |
| Email | Nodemailer |
| Astro Engine | Swiss Ephemeris (swisseph) |
