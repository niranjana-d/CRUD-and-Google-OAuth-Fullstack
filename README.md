# Full-Stack Post Management System

> A production-quality full-stack CRUD web application integrating **JSONPlaceholder** as the external REST API, backed by **PostgreSQL** and **Prisma ORM**, with **Email/Password & Google Sign-In (OAuth 2.0 / OpenID Connect)**, **Role-Based Access Control (RBAC)**, and **Granular Post Ownership Authorization**.

> 📖 **Deep Dive Documentation**: For an exhaustive, component-by-component architectural analysis of every single library, framework, security mechanism, and design pattern used in this system, see [TECHNICAL_DOCUMENTATION.md](file:///d:/Niranjana/fullstack/TECHNICAL_DOCUMENTATION.md).

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture & System Flow](#architecture--system-flow)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
7. [JSONPlaceholder Integration & Important Constraints](#jsonplaceholder-integration--important-constraints)
8. [API Endpoints & Swagger Documentation](#api-endpoints--swagger-documentation)
9. [Installation & Local Setup](#installation--local-setup)
10. [Google OAuth 2.0 Setup Guide](#google-oauth-20-setup-guide)
11. [Running Tests](#running-tests)
12. [Deployment Guidelines](#deployment-guidelines)
13. [Security Architecture](#security-architecture)
14. [Known Limitations](#known-limitations)

---

## Overview

The **Full-Stack Post Management System** demonstrates an enterprise-grade architectural pattern where an Express.js backend acts as a **controlled intermediary API layer** between a client-side React single-page application and an external REST service (**JSONPlaceholder**).

While JSONPlaceholder provides generic mock post entities, it lacks user persistence, role management, and authentication. This application solves that challenge by maintaining an authoritative **PostgreSQL** database via **Prisma ORM** to manage user identities, credentials, role-based access privileges, and post-ownership mappings.

---

## Key Features

- **Dual Authentication**:
  - Email & password registration/login with **Bcrypt** password hashing (12 salt rounds).
  - One-click **Google Sign-In** via Google OAuth 2.0 / OpenID Connect (`passport-google-oauth20`).
- **Secure Session Management**:
  - JWT tokens delivered via **HTTP-only, SameSite cookies** with fallback Bearer token support.
- **Role-Based Access Control (RBAC)**:
  - Enforced at both frontend route level and backend middleware layer.
  - Roles: `ADMIN` and `USER`.
- **Ownership Authorization**:
  - Normal `USER` accounts can view all posts, create new posts, and only update/delete posts they created.
  - `ADMIN` accounts can manage, edit, and delete any post across the platform and administer users.
- **Complete CRUD Operations**:
  - Create, Read (List & Detail), Update, and Delete operations with live loading and deletion confirmation dialogs.
- **Swagger / OpenAPI Documentation**:
  - Interactive API documentation accessible at `/api-docs` with full OpenAPI 3.0 specification.
- **Robust Security & Protection**:
  - Helmet for security headers, strict CORS policy with credential support, express-rate-limit to protect against brute-force attacks, and Zod input validation.
- **Modern Responsive UI**:
  - React 19 + Vite + Tailwind CSS featuring glassmorphism styling, dark gradients, accessible modal dialogs, and instant UI feedback.

---

## Architecture & System Flow

```text
+-------------------------------------------------------------------------+
|                              REACT FRONTEND                             |
|           (Vite + React Router + Tailwind CSS + Axios + AuthContext)    |
+-------------------------------------------------------------------------+
                                     |
                                     | HTTP / JSON / Credentials
                                     v
+-------------------------------------------------------------------------+
|                           EXPRESS.JS BACKEND                            |
|                                                                         |
|  [Security Layer]                                                       |
|    Helmet • CORS • Rate Limiting • Cookie Parser • Zod Validators       |
|                                                                         |
|  [Middleware Pipeline]                                                  |
|    authenticateUser() ---------> 401 Unauthorized (if missing/invalid)  |
|    requireRole('ADMIN') -------> 403 Forbidden (if unauthorized)        |
|                                                                         |
|  [Services Layer]                                                       |
|    AuthService • PostService • UserService • JsonPlaceholderService     |
+-------------------------------------------------------------------------+
         |                                                 |
         | Prisma ORM                                      | REST / Axios
         v                                                 v
+-----------------------+              +----------------------------------+
|      POSTGRESQL       |              |         JSONPLACEHOLDER          |
|                       |              |     (External Fake REST API)     |
|  • Users              |              |                                  |
|  • Passwords (bcrypt) |              |  • GET    /posts                 |
|  • Google Identities  |              |  • GET    /posts/:id             |
|  • Roles (USER/ADMIN) |              |  • POST   /posts                 |
|  • Post Ownerships    |              |  • PUT    /posts/:id             |
+-----------------------+              |  • DELETE /posts/:id             |
                                       +----------------------------------+
```

### Authentication Flow (Email / Password)
1. User enters registration/login details on React client.
2. Zod validates payload format both client-side and server-side.
3. Backend checks uniqueness, compares Bcrypt hash or creates user.
4. Server generates signed JWT token and transmits it as an `HTTP-only` cookie and JSON payload.
5. Frontend updates centralized `AuthContext` and grants access to protected routes.

### Google OAuth Flow
1. User clicks **"Continue with Google"**.
2. Frontend redirects to `GET /api/auth/google`.
3. Passport initiates Google OAuth 2.0 flow requesting `['profile', 'email']`.
4. User authenticates on Google's consent screen.
5. Google returns authorization code to `GET /api/auth/google/callback`.
6. Server exchanges code for user profile, finds or creates local User record in PostgreSQL, and generates JWT.
7. Server sets cookie and redirects browser to `/auth/callback?token=<JWT>`.
8. Frontend captures token, verifies profile via `/api/auth/me`, and redirects to `/dashboard`.

---

## Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Tooling & Bundler**: Vite 6
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 + Glassmorphism Custom Utilities
- **HTTP Client**: Axios (configured with interceptors & credentials)
- **Icons**: React Icons (Feather Icons & Flat Color Icons)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4 (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma Client v6
- **Authentication**: Passport.js (`passport-google-oauth20`), JsonWebToken (JWT), Bcrypt.js
- **Validation**: Zod
- **Security**: Helmet, CORS, Express-Rate-Limit, Cookie-Parser
- **Logging**: Morgan HTTP logger + structured custom logger
- **Testing**: Vitest v2

---

## Database Schema

```prisma
enum Role {
  USER
  ADMIN
}

enum AuthProvider {
  LOCAL
  GOOGLE
}

model User {
  id           String          @id @default(cuid())
  name         String
  email        String          @unique
  passwordHash String?         // Null for Google-only sign-ins
  role         Role            @default(USER)
  provider     AuthProvider    @default(LOCAL)
  googleId     String?         @unique
  avatarUrl    String?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  postOwnerships PostOwnership[]

  @@index([email])
  @@index([googleId])
}

model PostOwnership {
  id                    String   @id @default(cuid())
  jsonPlaceholderPostId Int
  userId                String
  title                 String
  body                  String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([jsonPlaceholderPostId, userId])
  @@index([userId])
  @@index([jsonPlaceholderPostId])
}
```

---

## Role-Based Access Control (RBAC)

| Capability | Anonymous | Authenticated USER | ADMIN |
|---|:---:|:---:|:---:|
| View Public Landing Page | ✓ | ✓ | ✓ |
| View Posts (`GET /api/posts`) | ✓ | ✓ | ✓ |
| View Single Post (`GET /api/posts/:id`) | ✓ | ✓ | ✓ |
| Create Post (`POST /api/posts`) | ✗ | ✓ | ✓ |
| Edit Own Post (`PUT /api/posts/:id`) | ✗ | ✓ (Owner only) | ✓ (Any post) |
| Delete Own Post (`DELETE /api/posts/:id`) | ✗ | ✓ (Owner only) | ✓ (Any post) |
| Access Dashboard (`/dashboard`) | ✗ | ✓ | ✓ |
| View User Profile (`/profile`) | ✗ | ✓ | ✓ |
| View User Directory (`GET /api/users`) | ✗ | ✗ (403) | ✓ |
| Update User Role (`PATCH /api/users/:id/role`) | ✗ | ✗ (403) | ✓ (Excludes self) |
| Delete User (`DELETE /api/users/:id`) | ✗ | ✗ (403) | ✓ (Excludes self) |

---

## JSONPlaceholder Integration & Important Constraints

> **CRITICAL NOTE ON PERSISTENCE:**  
> JSONPlaceholder is a **mock REST API**. HTTP `POST`, `PUT`, `PATCH`, and `DELETE` requests sent to JSONPlaceholder are **simulated** by design. The JSONPlaceholder server responds with mock status codes and synthesized IDs (e.g., `id: 101`), but **does not permanently persist changes** to its remote servers.

### How this application solves the limitation:
1. **Separation of Concerns**:
   - Application authentication, user records, and post ownership are permanently stored in **PostgreSQL**.
   - Posts metadata and initial catalog are sourced from **JSONPlaceholder**.
2. **Local Ownership Mapping**:
   - When an authenticated user creates a post, the backend forwards the request to JSONPlaceholder and records the newly generated post ID alongside the user's ID in the PostgreSQL `PostOwnership` table.
3. **Transparent UI Feedback**:
   - The user interface explicitly informs the user that deletions, updates, and creations are simulated on the external mock service while permissions and ownership rules remain strictly enforced by the backend.

---

## API Endpoints & Swagger Documentation

Interactive Swagger documentation is available at:
```text
http://localhost:5000/api-docs
```
Raw OpenAPI specification JSON is available at:
```text
http://localhost:5000/api/docs/openapi.json
```

### Endpoints Summary

#### Health & Docs
- `GET /api/health`: Health status of server and database
- `GET /api-docs`: Interactive Swagger UI

#### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register with name, email, password
- `POST /api/auth/login`: Authenticate with email and password
- `POST /api/auth/logout`: Invalidate session and clear auth cookie
- `GET /api/auth/me`: Get current authenticated user profile
- `GET /api/auth/google`: Initiate Google OAuth 2.0 flow
- `GET /api/auth/google/callback`: Handle Google OAuth redirection

#### Posts (`/api/posts`)
- `GET /api/posts`: List all posts (enriched with local ownership status)
- `GET /api/posts/:id`: Get single post by ID
- `POST /api/posts`: Create post (Authenticated users only)
- `PUT /api/posts/:id`: Update post (Owner or Admin only)
- `DELETE /api/posts/:id`: Delete post (Owner or Admin only)

#### Users (`/api/users`) — Admin Only
- `GET /api/users`: List all registered users (Excludes password hashes)
- `GET /api/users/:id`: Get user details by ID
- `PATCH /api/users/:id/role`: Update user role (`USER` <-> `ADMIN`)
- `DELETE /api/users/:id`: Remove user account

---

## Installation & Local Setup

### 1. Prerequisites
- **Node.js** (v18.x, v20.x, or newer)
- **npm** (v9+ or v10+)
- **PostgreSQL** instance running locally or via cloud (e.g. Supabase, Neon, Render)

### 2. Clone the Repository
```bash
git clone <repository-url>
cd fullstack-post-management
```

### 3. Install Dependencies
```bash
# Install root, client, and server dependencies in one command
npm run install:all
```
Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 4. Configure Environment Variables

#### Backend (`server/.env`)
Copy the example environment file:
```bash
cp server/.env.example server/.env
```
Fill in the parameters in `server/.env`:
```env
PORT=5000
NODE_ENV=development

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/post_management?schema=public"

# Google OAuth (Optional for local testing if testing email auth first)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

JWT_SECRET=super-secret-jwt-key-replace-in-production
JWT_EXPIRES_IN=7d
SESSION_SECRET=super-secret-session-key

FRONTEND_URL=http://localhost:5173
JSONPLACEHOLDER_BASE_URL=https://jsonplaceholder.typicode.com

# Initial Admin credentials for db:seed
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=AdminPassword123!
SEED_ADMIN_NAME=System Administrator
```

#### Frontend (`client/.env`)
```bash
cp client/.env.example client/.env
```
Contents:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 5. Initialize Database & Run Seed
```bash
# Generate Prisma Client
cd server
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Seed initial admin and test user
npm run db:seed
```

This creates:
- **Admin account**: `admin@example.com` / `AdminPassword123!` (Role: `ADMIN`)
- **Test User**: `user@example.com` / `UserPassword123!` (Role: `USER`)

### 6. Start Development Servers
From the root directory:
```bash
npm run dev
```
Or start individually:
```bash
# Terminal 1: Backend (Port 5000)
cd server && npm run dev

# Terminal 2: Frontend (Port 5173)
cd client && npm run dev
```

Visit `http://localhost:5173` to access the application.

---

## Google OAuth 2.0 Setup Guide

To enable the **"Continue with Google"** feature:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `PostFlow App`).
3. Navigate to **APIs & Services > OAuth consent screen**.
   - Choose **External** user type.
   - Fill in App name, User support email, and Developer contact information.
   - Add the scopes: `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
4. Navigate to **Credentials > Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Name: `PostFlow Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `http://localhost:5000`
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback`
5. Copy the generated **Client ID** and **Client Secret**.
6. Paste them into `server/.env`:
   ```env
   GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
   ```
7. Restart the backend server. The Google login button will now authenticate seamlessly!

---

## Running Tests

All unit, integration, and security tests are written using **Vitest**.

```bash
cd server
npm test
```

Test coverage includes:
- **Authentication**: Local registration, password hashing verification, password matching, invalid credentials handling, Google profile provisioning, JWT issuance & verification.
- **RBAC**: Unauthenticated requests returning 401, unauthorized user roles returning 403, admin access granting.
- **CRUD Operations**: Listing, retrieving, creating, updating, and deleting posts.
- **Ownership Rules**: Verification that regular users cannot alter or delete posts belonging to others, while administrators retain full modification privileges.
- **JSONPlaceholder Service**: Unit verification of simulated external REST operations.

---

## Deployment Guidelines

### 1. Frontend (Vercel)
1. Push your repository to GitHub.
2. Link the repository in [Vercel](https://vercel.com).
3. Set the Root Directory to `client`.
4. Configure environment variables in Vercel:
   ```env
   VITE_API_URL=https://your-backend-domain.com/api
   ```
5. Deploy.

### 2. Backend (Render / Railway)
1. In [Render](https://render.com), create a new **Web Service** pointing to the repository.
2. Set Root Directory to `server`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Add production Environment Variables:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://<user>:<password>@<db-host>/<db-name>?sslmode=require
   JWT_SECRET=<long-random-string>
   SESSION_SECRET=<long-random-string>
   FRONTEND_URL=https://your-vercel-domain.vercel.app
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback
   ```

---

## Security Architecture

- **No Plaintext Passwords**: Uses salted `bcrypt` with 12 rounds.
- **Defense in Depth**: Authorization checks run on every controller request; the UI hides unauthorized buttons, but backend RBAC middleware strictly guards the API.
- **Credential Hygiene**: Password hashes and OAuth secrets are completely stripped from API responses.
- **Brute-Force Rate Limiting**: Authentication endpoints are rate-limited to 20 requests per 15-minute window; general endpoints to 200 requests.
- **Helmet Headers**: Configures Content-Security-Policy, HSTS, X-Content-Type-Options, and Frameguard.
- **Zero Secrets Committed**: `.env` is strictly ignored by `.gitignore`.

---

## Known Limitations

1. **JSONPlaceholder Mock Nature**:
   - Any updates or deletions sent to JSONPlaceholder return simulated HTTP 200/201 responses, but the mock service will not retain changes when revisited.
2. **Third-Party Google OAuth Credentials**:
   - Full Google Sign-In requires active Google Cloud Console credentials configured in `server/.env`. If omitted, the server safely warns and continues serving local email authentication.
