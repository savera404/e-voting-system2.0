# Installation Manual: E-Voting System

This document outlines the steps required to set up and run the e-voting system on your local machine.

## Prerequisites
- **Python 3.8+** (for the backend)
- **Node.js 18+** & **npm** (for the frontend)
- **PostgreSQL Database** (e.g., local Postgres or Supabase)

## Project Structure
- `e-voting_system_backend`: FastAPI backend using PostgreSQL.
- `frontend`: Next.js frontend built with React 19 and Tailwind CSS.

---

## 1. Backend Setup (FastAPI)

1. **Navigate to the backend directory:**
   ```bash
   cd e-voting_system_backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - **Windows:**
     ```powershell
     .\venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up Environment Variables:**
   Create a `.env` file in the `e-voting_system_backend` directory (if not already present) and populate it with your database and security configurations:
   ```env
   DATABASE_URL=postgresql://<username>:<password>@<db-host>:<port>/<db-name>
   SECRET_KEY=your_secure_random_secret_key
   ```
   *(Replace the placeholders with your actual database credentials. If you are already provided with a `.env` file containing Supabase credentials, you can use those directly.)*

6. **Run the Backend Server:**
   Ensure your virtual environment is activated, then run the FastAPI application:
   ```bash
   uvicorn app.main:app --reload
   ```
   *(Note: The exact command depends on where the FastAPI `app` instance is located. If you have a specific script to run the server, use that instead).*
   The backend should now be running at `http://localhost:8000`.

---

## 2. Frontend Setup (Next.js)

1. **Open a new terminal window/tab and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the `frontend` directory (if not already present) and add the backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   The frontend should now be running at `http://localhost:3000`.

---

## 3. Verifying the Installation

- Open your browser and navigate to `http://localhost:3000`. You should see the frontend interface of the E-Voting System.
- The frontend will communicate with the backend at `http://localhost:8000`.
- You can access the auto-generated backend API documentation (Swagger UI) at `http://localhost:8000/docs`.
