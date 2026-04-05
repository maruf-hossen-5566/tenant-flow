# 🚀 Multi-Tenant Project Management App

A full-stack application demonstrating a **multi-tenant backend architecture** with a modern frontend.

> ⚡ Backend is the primary focus of this project (architecture, RBAC, multi-tenancy).

---

## 📦 Project Overview

This repository contains:

* `backend/` → FastAPI multi-tenant API (main focus)
* `frontend/` → React-based client (Axios + Zustand)

The primary focus of this project is backend architecture and system design.

---

## 📌 Features

### 🔐 Authentication

* User registration & login
* JWT-based authentication
* Secure password hashing

### 🏢 Multi-Tenancy

* Multiple tenants (workspaces / organizations)
* Tenant-based data isolation
* Context-based access per request

### 👥 Role-Based Access Control

* Roles: `ADMIN`, `MEMBER`
* Permission enforcement per tenant
* Admin-restricted operations

### 📁 Projects & Tasks

* CRUD operations for projects
* Task management within projects
* All data scoped per tenant

### 🧪 Testing

* Test suite using **pytest**
* Covers:

  * Authentication
  * Tenant isolation
  * Role permissions
  * Core CRUD flows

---

## 🏗️ Tech Stack

### Backend

* **FastAPI**
* **PostgreSQL** *(running via Docker)*
* **SQLAlchemy**
* **JWT Auth** (python-jose, passlib)
* **Pytest**
* **Docker** (for database and optional backend containerization)
* **pip** (dependency management inside Docker)

### Frontend

* **React**
* **Axios** (API communication)
* **Zustand** (state management)

---

## 📂 Project Structure

```
├── frontend/                # React application (UI layer)
│   └── ...                  # Components, state, API integration
│
├── backend/                 # FastAPI backend (core focus)
│   ├── app/                 # Application source code
│   ├── tests/               # Test suite (pytest)
│   └── ...                  # Config, migrations, etc.
│
└── README.md                # Project documentation
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <project-name>
```

---

### 2. Setup environment

Create a `.env` file:

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:<port>/<db_name>
SECRET_KEY=your_secret_key
```

---

### 3. Run PostgreSQL (Docker)

Make sure Docker is running, then start the database:

```bash
docker compose up -d db
```

---

### 4. Install backend dependencies (pip)

```bash
cd backend
pip install -r requirements.txt
```

---

### 5. Run the backend

```bash
uvicorn app.main:app --reload
```

---

## 🔑 Authentication

After login, include the token in requests:

```http
Authorization: Bearer <access_token>
```

---

## 🧪 Running Tests

```bash
pytest
```

---

## 🧠 Key Concepts Demonstrated

### Multi-Tenant Isolation

All data is scoped to a tenant. Users cannot access data outside their workspace.

### Role-Based Authorization

Permissions are enforced at the backend level (e.g., only admins can manage members).

### Clean Architecture

* Separation of concerns (routes, services, schemas)
* Dependency injection
* Testable design

---

## 🚨 Notes

* PostgreSQL runs via Docker
* Backend uses **pip** for dependency management (inside Docker or locally)
* Email/invite flows are not implemented; tests seed data directly
* Focus is on backend logic and architecture

---
