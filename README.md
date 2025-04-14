# 🃏 TSD Planning Poker

A **Planning Poker** application built as part of the **Technologies of Software Development** course.  
This full-stack project uses **Angular** on the frontend and **Node.js + Express** on the backend.

# 📁 Project Structure

```
TSD-PLANNING-POKER/
├── client/                    # Angular frontend application
│   ├── .angular/              # Angular CLI cache
│   ├── node_modules/          # Frontend dependencies
│   ├── public/                # Static assets (optional)
│   └── src/                   # Source code for frontend
│       ├── app/               # Core app module
│       │   ├── components/    # UI components
│       │   │   ├── game/      # Game interface components
│       │   │   └── login/     # Login/register components
│       │   ├── guards/        # Angular route guards
│       │   ├── models/        # TypeScript interfaces & types
│       │   └── services/      # Reusable services
│       └── assets/ (optional) # Static resources like images
├── server/                    # Node.js + Express backend
│   ├── node_modules/          # Backend dependencies
│   ├── src/                   # Source code for backend
│   │   ├── config/            # Config files (e.g., DB, env)
│   │   ├── controllers/       # Request handler functions
│   │   ├── gameLogic/         # Core game logic modules
│   │   ├── middlewares/       # Custom Express middlewares
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic layer
│   │   └── utils/             # Utility/helper functions
│   |
│   └── tests/                 # Backend tests
└── tests/                     # End-to-end tests (e.g., Selenium)
```

## 🌐 Technologies Used

| Layer       | Stack                        |
|------------|------------------------------|
| Frontend   | Angular, TypeScript, Tailwind, Jest |
| Backend    | Node.js, Express, MongoDB (via Mongoose) |
| Testing    | Jest (unit tests), Selenium (E2E) |

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js (v18+ recommended)
- Angular CLI (`npm install -g @angular/cli`)
- MongoDB Atlas

---

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Pashkiin/tsd-planning-poker.git
cd planning-poker-app
```

---

### 2. Backend Setup (Node.js + Express)

```bash
cd server
npm install
cp .env                        # Create environment config
npm run dev                    # Starts backend at http://localhost:3000
```

✅ The backend will listen on `http://localhost:3000` by default.

---

### 3. Frontend Setup (Angular)

```bash
cd ../client
npm install
ng serve                     # Starts frontend at http://localhost:4200
```

✅ Open [http://localhost:4200](http://localhost:4200) to use the app.

---

## ⚙️ Environment Variables

In `server/.env`:

```env
PORT=3000
MONGODB_URI=your connection string from mongoDB Atlas
```
