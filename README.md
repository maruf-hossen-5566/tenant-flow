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

> The **backend** contains the main architecture and business logic of this project.

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```
git clone <my-repo-url>
cd <project-name>
```

---

### 2. Setup environment

Create a `.env` file:

```
DATABASE_URL=postgresql://<user>:<password>@localhost:<port>/<db_name>
SECRET_KEY=your_secret_key
```

---

### 3. Run the backend

```
uvicorn app.main:app --reload
```

---

## 🔑 Authentication

After login, include the token in requests:

```
Authorization: Bearer <access_token>
```

---

## 🧪 Running Tests

```
pytest
```
> Add `--disable-warnings` to disable warnings

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
