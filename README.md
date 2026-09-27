# StoreFlow

StoreFlow is a MERN-based e-commerce storefront slice designed with clean architecture, robust state management, and production-grade reliability.

## Current Technology Stack

- **Backend**: Node.js, Express.js, CORS, dotenv
- **Frontend**: React (JavaScript), Vite
- **Architecture**: Modular Express backend with clean layer separation (`config`, `controllers`, `middleware`, `models`, `routes`, `services`)

## Project Structure

```
bectree-store-flow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

## Local Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- npm

### 1. Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
npm install
```

Configure environment variables:
```bash
cp .env.example .env
```
*(Configure `PORT` if different from default 5000).*

Start the backend development server:
```bash
npm run dev
```
Or start in production mode:
```bash
npm start
```

#### Health-Check Endpoint

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/health`
- **Response**:
```json
{
  "success": true,
  "message": "StoreFlow API is running"
}
```

### 2. Frontend Setup

Navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will run locally on Vite's local development server (typically `http://localhost:5173`).

## Design & Implementation Notes

### Step 9: Product Detail Screen
Product Detail layout was not explicitly provided in the Figma reference. The page follows the existing storefront visual language and implements the required product image, variant selection, stock awareness, and Add to Cart flow.
