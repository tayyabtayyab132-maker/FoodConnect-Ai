# FoodConnect — Smart Food Waste Management System

FoodConnect is an AI-powered food donation and waste management platform that connects **food donors** with **organizations** that need food for distribution.

The platform helps reduce food waste by allowing donors to publish available food donations while organizations can discover suitable donations, request quantities, manage collections, and complete the donation lifecycle.

The system combines:

* React frontend
* FastAPI backend
* JSON-based persistence
* JWT authentication
* Role-based authorization
* CrewAI AI agents
* Groq LLM
* Deterministic business logic
* Responsive light/dark UI
* In-app notifications
* Admin management
* Donation and request lifecycle management

The project is designed as a hackathon-friendly MVP with a simple architecture and without a traditional database or distributed infrastructure.

---

# 1. Project Goals

The main goals of FoodConnect are:

1. Reduce food waste.
2. Help donors distribute surplus food.
3. Help organizations find relevant food donations.
4. Provide AI-assisted food analysis and matching explanations.
5. Provide logistics and workflow assistance.
6. Maintain strict control over donation quantities and statuses.
7. Prevent AI from changing critical business rules.
8. Provide administrators with platform-management capabilities.
9. Keep the application simple enough for local development and hackathon deployment.
10. Maintain clear separation between frontend, backend, AI, and business logic.

---

# 2. Core Concept

The basic workflow is:

```text
Donor
  │
  ▼
Create Donation
  │
  ▼
Food Inventory AI Analysis
  │
  ▼
Donation Available
  │
  ▼
Organization discovers donation
  │
  ▼
Matching Logic + AI Match Explanation
  │
  ▼
Organization creates Request
  │
  ▼
Donor accepts Request
  │
  ▼
Donation Quantity Reserved
  │
  ▼
Logistics AI Suggestion
  │
  ▼
Coordinator AI Workflow Summary
  │
  ▼
Collection Confirmed
  │
  ▼
Request Completed
```

The backend remains responsible for all critical workflow decisions.

AI is used for:

* Analysis
* Explanation
* Suggestions
* Summaries
* Natural-language reasoning

AI is NOT responsible for:

* Changing statuses
* Reserving food
* Changing quantities
* Confirming collection
* Completing requests
* Authenticating users
* Authorizing users
* Certifying food safety

---

# 3. Main Features

## 3.1 Authentication

FoodConnect provides secure authentication for:

* Donors
* Organizations
* Administrators

Features include:

* Signup
* Login
* Logout
* JWT authentication
* Password hashing
* Account status checking
* Role-based authorization
* Protected frontend routes
* Protected backend endpoints

Passwords are never stored as plaintext.

Passwords are hashed using bcrypt.

---

# 4. User Roles

FoodConnect has three main roles.

## 4.1 Donor

Donors can:

* Create donations
* View their donations
* View donation details
* View donation requests
* Accept requests
* Reject requests
* Manage donation lifecycle
* View profile
* Use AI food analysis
* Track reserved quantities
* Track remaining food

---

## 4.2 Organization

Organizations can:

* View available donations
* Search/filter donations
* View donation details
* Request food
* Specify requested quantity
* View their requests
* View request details
* Confirm collection
* View completed collections
* Manage organization profile
* Configure accepted food categories
* Configure dietary requirements
* Configure minimum quantity
* Configure location coordinates
* Use AI match explanations
* Use AI logistics suggestions
* Use AI workflow summaries

---

## 4.3 Administrator

Administrators can:

* View dashboard statistics
* View users
* Search users
* Filter users
* Suspend users
* Restore users
* Deactivate users
* View all donations
* Cancel donations
* View all requests
* Cancel requests
* View audit logs
* Monitor platform activity

The default seeded administrator is:

```text
Email:
admin@example.com

Password:
admin123
```

Change these credentials before production deployment.

---

# 5. Donation Management

Donors can create food donations containing information such as:

* Food name
* Food category
* Quantity
* Unit
* Description
* Pickup address
* Expiry/safe-consumption information
* Dietary tags
* Additional food information

Example:

```text
Food Name:
Vegetable Rice

Category:
Prepared Meals

Quantity:
30

Unit:
Meals

Dietary Tags:
Vegetarian

Pickup Address:
12 Main Boulevard, Gulberg III, Lahore
```

---

# 6. Donation Status Lifecycle

Donations support the following statuses:

```text
AVAILABLE
PARTIALLY_RESERVED
RESERVED
COMPLETED
CANCELLED
EXPIRED
```

Typical lifecycle:

```text
AVAILABLE
    │
    ├── Request Accepted
    ▼
PARTIALLY_RESERVED
    │
    ├── More quantity reserved
    ▼
RESERVED
    │
    └── Collection completed
    ▼
COMPLETED
```

A donation can also become:

```text
CANCELLED
```

or:

```text
EXPIRED
```

depending on the workflow and business rules.

---

# 7. Request Management

Organizations can create requests for donations.

A request contains information such as:

* Organization
* Donation
* Requested quantity
* Message
* Status
* Collection time
* Creation timestamp

Request statuses are:

```text
PENDING
ACCEPTED
REJECTED
CANCELLED
COLLECTION_CONFIRMED
COMPLETED
```

Normal successful workflow:

```text
PENDING
   ↓
ACCEPTED
   ↓
COLLECTION_CONFIRMED
   ↓
COMPLETED
```

---

# 8. Quantity Protection

Food quantity is controlled by deterministic backend logic.

For example:

```text
Donation quantity = 30 meals

Organization requests = 20 meals

Reserved quantity = 20 meals

Remaining quantity = 10 meals
```

The AI does not calculate or modify these business-critical values.

Python services are responsible for:

* Requested quantity validation
* Reserved quantity
* Remaining quantity
* Availability
* Reservation
* Quantity protection

This prevents AI-generated text from accidentally changing business data.

---

# 9. Organization Profiles

Organizations can configure:

* Accepted food categories
* Dietary requirements
* Minimum quantity
* Latitude
* Longitude

Example:

```json
{
  "accepted_food_categories": [
    "Prepared Meals",
    "Bakery"
  ],
  "dietary_requirements": [
    "Vegetarian"
  ],
  "minimum_quantity": 10,
  "latitude": 31.5204,
  "longitude": 74.3587
}
```

This information is used by deterministic matching and logistics logic.

---

# 10. AI System

FoodConnect uses four specialized AI agents.

The AI layer is built using:

* CrewAI
* Groq
* Custom CrewAI LLM integration
* Python services

The configured Groq model is controlled through the `.env` file.

Example:

```env
GROQ_MODEL=openai/gpt-oss-120b
```

---

# 11. AI Agent 1 — Food Inventory Agent

The Food Inventory Agent analyzes information entered when a donor creates a donation.

Frontend workflow:

```text
Donor
  ↓
Create Donation
  ↓
Food Inventory AI
```

Backend endpoint:

```text
POST /api/ai/food-analysis
```

The agent can analyze:

* Food category
* Food information
* Dietary tags
* Important information
* Missing information

Example output:

```json
{
  "summary": "Freshly prepared vegetarian meals.",
  "food_category": "Prepared Meals",
  "important_information": [
    "Food is freshly prepared."
  ],
  "missing_information": [],
  "dietary_tags": [
    "Vegetarian"
  ]
}
```

The agent must never invent user information.

---

# 12. AI Agent 2 — Matching Agent

The Matching Agent explains why a donation matches an organization.

Frontend workflow:

```text
Organization
  ↓
Available Donations
  ↓
Donation Details
  ↓
Explain Match
```

Backend endpoint:

```text
POST /api/ai/match-explanation
```

The actual matching logic is deterministic.

The backend evaluates information such as:

* Food category
* Accepted categories
* Dietary requirements
* Minimum quantity
* Availability
* Verified organization information

The AI converts the verified matching result into a human-readable explanation.

The AI does not directly reserve food or accept requests.

---

# 13. AI Agent 3 — Logistics Agent

The Logistics Agent provides collection-related suggestions.

Frontend workflow:

```text
Organization
  ↓
My Requests
  ↓
Request Details
  ↓
AI Collection Suggestion
```

Backend endpoint:

```text
POST /api/ai/collection-suggestion
```

The backend supplies verified information such as:

* Donation quantity
* Requested quantity
* Remaining quantity
* Pickup address
* Collection time
* Distance
* Donation status
* Request status
* Safe-consumption deadline

The AI generates:

* Summary
* Collection considerations
* Timing considerations
* Practical notes

The Logistics Agent does not:

* Schedule collections
* Change statuses
* Change quantities
* Confirm collections
* Certify food safety

---

# 14. AI Agent 4 — Coordinator Agent

The Coordinator Agent summarizes the current donation workflow.

Frontend workflow:

```text
Organization
  ↓
Request Details
  ↓
AI Workflow Summary
```

Backend endpoint:

```text
POST /api/ai/coordinate
```

The agent provides:

* Title
* Summary
* Current status
* Next action
* Important information

Example:

```text
Current Status:
ACCEPTED

Next Action:
Arrange and confirm collection.

Important Information:
20 meals are reserved.
10 meals remain available.
```

The Coordinator Agent cannot change the workflow.

---

# 15. AI Safety Architecture

A core architectural principle is:

> AI assists with reasoning, but deterministic backend logic controls business-critical operations.

AI cannot directly:

* Approve users
* Suspend users
* Accept requests
* Reject requests
* Reserve quantities
* Modify quantities
* Complete collections
* Change donation statuses
* Change request statuses
* Certify food safety

This protects the application from unreliable AI decisions.

---

# 16. Food Safety Disclaimer

FoodConnect does not use AI to certify food safety.

AI may:

* Summarize supplied information
* Identify missing information
* Highlight inconsistencies
* Provide general considerations

AI must not claim that food is definitely safe for consumption.

Food safety remains the responsibility of the relevant users and organizations.

---

# 17. Backend Architecture

The backend uses:

* Python
* FastAPI
* Pydantic
* JWT
* Passlib
* bcrypt
* Groq
* CrewAI
* python-dotenv

Backend architecture:

```text
Frontend
   │
   │ HTTP / REST API
   ▼
FastAPI
   │
   ├── Routes
   │
   ├── Services
   │
   ├── Models
   │
   ├── Schemas
   │
   ├── Security
   │
   ├── AI Agents
   │
   ├── Utilities
   │
   └── JSON Persistence
```

---

# 18. Backend Folder Structure

```text
backend/
│
├── app/
│   ├── main.py
│   ├── config.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── donation.py
│   │   ├── request.py
│   │   └── organization.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── donation.py
│   │   ├── request.py
│   │   └── ai.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── donations.py
│   │   ├── organizations.py
│   │   ├── requests.py
│   │   ├── admin.py
│   │   └── ai.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── donation_service.py
│   │   ├── matching_service.py
│   │   ├── logistics_service.py
│   │   ├── admin_service.py
│   │   ├── request_service.py
│   │   ├── ai_service.py
│   │   ├── groq_service.py
│   │   └── organization_service.py
│   │
│   ├── agents/
│   │   ├── food_inventory_agent.py
│   │   ├── matching_agent.py
│   │   ├── logistics_agent.py
│   │   ├── coordinator_agent.py
│   │   └── crew.py
│   │
│   ├── data/
│   │   └── store.py
│   │
│   ├── utils/
│   │   ├── distance.py
│   │   └── helpers.py
│   │
│   ├── security.py
│   │
│   └── seed/
│       └── demo_data.py
│
├── data/
│   ├── users.json
│   ├── donations.json
│   ├── requests.json
│   ├── notifications.json
│   ├── audit_logs.json
│   └── organization_profiles.json
│
├── .env
├── .env.example
├── requirements.txt
└── README.md
```

---

# 19. Backend Libraries

The backend requires the following main packages:

```text
fastapi
uvicorn[standard]
pydantic
python-dotenv
PyJWT
passlib
bcrypt==4.0.1
groq
crewai
```

Recommended Python version:

```text
Python 3.12.7
```

---

# 20. Backend Setup

## Step 1 — Open the backend directory

```bash
cd backend
```

## Step 2 — Create a virtual environment

Windows:

```bash
python -m venv .venv
```

Linux/macOS:

```bash
python3 -m venv .venv
```

## Step 3 — Activate the environment

Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Windows CMD:

```cmd
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

## Step 4 — Install dependencies

```bash
pip install -r requirements.txt
```

---

# 21. Backend Environment Variables

Create:

```text
backend/.env
```

Example:

```env
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=change_this_for_local_development
GROQ_MODEL=openai/gpt-oss-120b
```

Never commit the real `.env` file to Git.

The API key must remain server-side.

---

# 22. Start the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The backend should be available at:

```text
http://127.0.0.1:8000
```

FastAPI Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

Alternative ReDoc documentation:

```text
http://127.0.0.1:8000/redoc
```

---

# 23. JSON Persistence

FoodConnect intentionally does not use a traditional database.

The source of truth is JSON.

Data is stored in:

```text
backend/data/
```

Files include:

```text
users.json
donations.json
requests.json
notifications.json
audit_logs.json
organization_profiles.json
```

The storage service handles:

* Loading JSON
* Converting JSON data into Pydantic models
* Saving updated data
* Maintaining persistence between backend restarts

This makes the MVP simple and easy to understand.

---

# 24. Why JSON Instead of a Database?

For the MVP, JSON provides:

* Simple setup
* No database server
* Easy local development
* Easy debugging
* Easy demo preparation
* Minimal infrastructure
* Simple deployment

A traditional database can be introduced in a future production version if required.

---

# 25. Authentication Architecture

The authentication flow is:

```text
Frontend Login
      │
      ▼
POST /api/auth/login
      │
      ▼
FastAPI
      │
      ▼
Validate credentials
      │
      ▼
Verify password hash
      │
      ▼
Create JWT
      │
      ▼
Frontend stores token
```

JWT payload contains:

```json
{
  "user_id": "user-id",
  "role": "donor"
}
```

The frontend sends the token with protected requests:

```text
Authorization: Bearer <token>
```

Axios automatically attaches the token using an interceptor.

---

# 26. Frontend Architecture

The frontend uses:

* React
* Vite
* React Router
* Axios
* Tailwind CSS
* lucide-react

Frontend architecture:

```text
React Application
       │
       ├── Context
       │    ├── AuthContext
       │    └── ThemeContext
       │
       ├── Components
       │
       ├── Pages
       │
       ├── Services
       │
       ├── Utilities
       │
       └── API
              │
              ▼
          FastAPI
```

---

# 27. Frontend Folder Structure

```text
frontend/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   ├── DonationCard.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── Loading.jsx
│   │   └── EmptyState.jsx
│   │
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   │
│   ├── organization/
│   │   ├── Dashboard.jsx
│   │   ├── Donations.jsx
│   │   ├── DonationDetails.jsx
│   │   ├── Requests.jsx
│   │   ├── RequestDetails.jsx
│   │   ├── Completed.jsx
│   │   └── Profile.jsx
│   │
│   ├── donor/
│   │   ├── Dashboard.jsx
│   │   ├── Donations.jsx
│   │   ├── CreateDonation.jsx
│   │   ├── DonationDetails.jsx
│   │   ├── Organizations.jsx
│   │   ├── Requests.jsx
│   │   ├── RequestDetails.jsx
│   │   └── Profile.jsx
│   │
│   ├── admin/
│   │   ├── Dashboard.jsx
│   │   ├── Users.jsx
│   │   ├── Donations.jsx
│   │   ├── Requests.jsx
│   │   └── AuditLogs.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── utils/
│   │   └── helpers.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── vite.config.js
└── README.md
```

---

# 28. Frontend Libraries

Main frontend dependencies:

```text
react
react-dom
react-router-dom
axios
lucide-react
tailwindcss
vite
```

React Router is responsible for navigation and protected routes.

Axios is responsible for communication with the FastAPI backend.

lucide-react provides icons.

Tailwind CSS provides responsive styling.

Vite provides the frontend development server and build system.

---

# 29. Frontend Setup

## Step 1 — Open the frontend directory

```bash
cd frontend
```

## Step 2 — Install dependencies

```bash
npm install
```

## Step 3 — Start the development server

```bash
npm run dev
```

Vite will normally provide a URL similar to:

```text
http://localhost:5173
```

Open that URL in your browser.

---

# 30. Frontend API Configuration

The frontend API service uses:

```text
VITE_API_BASE_URL
```

If no environment variable is provided, it uses:

```text
http://127.0.0.1:8000/api
```

For example, an optional frontend `.env` can contain:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Do not put the Groq API key in the frontend.

The Groq API key belongs only in the backend `.env`.

---

# 31. Frontend Authentication

The frontend uses `AuthContext` to manage:

* Current user
* Authentication state
* Login
* Logout
* User role
* Protected navigation

The JWT access token is stored in browser local storage.

Axios automatically reads the token and sends it with API requests.

---

# 32. Role-Based Routing

The application uses protected routes.

Example roles:

```text
donor
organization
admin
```

Users cannot access pages belonging to another role.

Examples:

```text
/organization/dashboard
/organization/donations
/organization/requests

/donor/dashboard
/donor/donations
/donor/requests

/admin/dashboard
/admin/users
/admin/donations
/admin/requests
```

The backend also performs authorization checks.

Frontend route protection is therefore not the only security mechanism.

---

# 33. Frontend Navigation

### Organization

```text
Dashboard
Available Donations
My Requests
Completed
Profile
Logout
```

### Donor

```text
Dashboard
My Donations
Create Donation
Organizations
Requests
Profile
Logout
```

### Admin

```text
Dashboard
Users
Donations
Requests
Audit Logs
Logout
```

---

# 34. Responsive Design

The frontend is designed to work on:

* Desktop
* Laptop
* Tablet
* Mobile

The organization, donor, and admin dashboards use responsive layouts.

The desktop application uses a sidebar while mobile layouts provide a mobile navigation experience.

---

# 35. Light and Dark Mode

FoodConnect supports:

```text
Light Mode
Dark Mode
```

The UI uses semantic CSS variables such as:

```text
--background
--surface
--surface-muted
--surface-hover
--border
--text-primary
--text-secondary
--text-muted
--primary
--primary-soft
--success
--success-soft
--danger-text
--danger-soft
--danger-border
```

This allows shared components to work consistently in both themes.

---

# 36. Reusable Frontend Components

Important reusable components include:

## Sidebar

Provides role-specific navigation.

## StatCard

Displays dashboard statistics.

## DonationCard

Displays donation information consistently.

## StatusBadge

Displays statuses such as:

```text
AVAILABLE
PARTIALLY_RESERVED
RESERVED
PENDING
ACCEPTED
COMPLETED
CANCELLED
EXPIRED
```

## Loading

Provides consistent loading states.

## EmptyState

Provides consistent empty-data screens.

---

# 37. API Structure

Main backend API groups include:

```text
/api/auth
/api/donations
/api/organizations
/api/requests
/api/admin
/api/ai
```

Examples:

```text
POST /api/auth/signup
POST /api/auth/login

GET /api/donations
POST /api/donations

GET /api/requests
POST /api/requests

GET /api/organizations/me/profile
PUT /api/organizations/me/profile

POST /api/ai/food-analysis
POST /api/ai/match-explanation
POST /api/ai/collection-suggestion
POST /api/ai/coordinate
```

Admin APIs include:

```text
GET /api/admin/dashboard
GET /api/admin/users
PATCH /api/admin/users/{user_id}/suspend
PATCH /api/admin/users/{user_id}/restore
PATCH /api/admin/users/{user_id}/deactivate

GET /api/admin/donations
PATCH /api/admin/donations/{donation_id}/cancel

GET /api/admin/requests
PATCH /api/admin/requests/{request_id}/cancel

GET /api/admin/audit-logs
```

---

# 38. Admin Donation Cancellation

Administrators can cancel donations.

The cancellation process requires a reason.

Example:

```text
Admin
  ↓
Donations
  ↓
Cancel Donation
  ↓
Enter Reason
  ↓
Confirm
  ↓
Backend validates request
  ↓
Donation becomes CANCELLED
```

The cancellation reason is also useful for auditability.

---

# 39. User Suspension

Administrators can suspend users.

The workflow is:

```text
Admin
  ↓
Users
  ↓
Suspend Account
  ↓
Enter Reason
  ↓
Confirm
```

Suspended users cannot successfully log in.

Administrators can later restore the account.

---

# 40. Audit Logging

Administrative actions can be recorded in:

```text
backend/data/audit_logs.json
```

This provides a record of administrative activity such as:

* User suspension
* User restoration
* User deactivation
* Donation cancellation
* Request cancellation

---

# 41. Notifications

The application supports in-app notifications.

Notifications are persisted in:

```text
backend/data/notifications.json
```

They can be used to inform users about important workflow events such as:

* New requests
* Accepted requests
* Rejected requests
* Cancellation
* Collection events
* Other platform events

---

# 42. Distance and Logistics

Distance calculations are handled deterministically in Python.

The system can use:

```text
Donation latitude
Donation longitude
Organization latitude
Organization longitude
```

to calculate distance.

The AI receives the verified result and explains logistics around it.

The AI does not independently calculate or invent distance information.

---

# 43. Security Principles

Important security practices include:

* Password hashing
* JWT authentication
* Role-based authorization
* Backend protected routes
* User data isolation
* Server-side Groq API key
* No plaintext passwords
* Validation of quantities
* Validation of status transitions
* Administrative authorization
* Audit logging

---

# 44. User Data Isolation

Each user's data must remain isolated.

Examples:

```text
Donor A
  └── Donations belonging to Donor A

Donor B
  └── Donations belonging to Donor B
```

An authenticated user must not be able to access another user's private information simply by changing an ID in a frontend request.

Authorization and ownership checks are therefore performed by backend services.

---

# 45. No Traditional Database

The MVP intentionally excludes:

```text
MongoDB
PostgreSQL
MySQL
Firebase
Supabase
Redis
```

The application uses JSON files as the source of truth.

This keeps the project lightweight and easy to run locally.

---

# 46. Technologies Explicitly Not Used

The project intentionally avoids:

```text
Microservices
Docker
Redis
Celery
Kafka
RabbitMQ
WebSockets
PostgreSQL
MongoDB
MySQL
Firebase
Supabase
LangChain
LangGraph
Local LLMs
```

The AI system uses:

```text
CrewAI + Groq
```

---

# 47. Complete Local Development Setup

You need two terminals.

## Terminal 1 — Backend

```bash
cd backend

python -m venv .venv
```

Activate the environment.

Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install packages:

```bash
pip install -r requirements.txt
```

Create `.env`:

```env
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=change_this_for_local_development
GROQ_MODEL=openai/gpt-oss-120b
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

---

## Terminal 2 — Frontend

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start Vite:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 48. Recommended Testing Order

Test the application in this order.

## Authentication

```text
Signup
↓
Login
↓
Logout
↓
Login again
```

## Donor

```text
Dashboard
↓
Create Donation
↓
Food Inventory AI
↓
My Donations
↓
Donation Details
↓
Requests
↓
Profile
```

## Organization

```text
Dashboard
↓
Available Donations
↓
Donation Details
↓
Explain Match
↓
Create Request
↓
My Requests
↓
Request Details
↓
AI Workflow Summary
↓
AI Collection Suggestion
↓
Confirm Collection
↓
Completed
```

## Admin

```text
Dashboard
↓
Users
↓
Suspend User
↓
Verify Login Block
↓
Restore User
↓
Verify Login
↓
Donations
↓
Cancel Donation
↓
Requests
↓
Audit Logs
```

---

# 49. Complete End-to-End Test

The recommended final test is:

```text
1. Donor creates donation
        ↓
2. Food Inventory Agent analyzes donation
        ↓
3. Organization sees donation
        ↓
4. Matching logic evaluates compatibility
        ↓
5. Matching Agent explains match
        ↓
6. Organization creates request
        ↓
7. Donor accepts request
        ↓
8. Backend reserves quantity
        ↓
9. Logistics Agent provides collection suggestion
        ↓
10. Coordinator Agent summarizes workflow
        ↓
11. Organization confirms collection
        ↓
12. Request becomes COMPLETED
        ↓
13. Donation quantity/status is updated
```

---

# 50. AI Agent Testing Status

The four AI agents have been tested:

```text
Food Inventory Agent
PASS

Matching Agent
PASS

Logistics Agent
PASS

Coordinator Agent
PASS
```

The AI layer is therefore integrated into the major donation workflow.

---

# 51. Development Principles

The project follows these principles:

## Separation of Concerns

Frontend, backend, services, AI, persistence, and UI components remain separated.

## Deterministic Business Logic

Critical calculations and state changes are handled by Python.

## AI as an Assistant

AI explains and assists rather than controlling the platform.

## No Fabricated User Information

AI must never invent:

* Skills
* Quantities
* Food information
* Organizations
* Users
* Addresses
* Dates
* Certifications
* Experience
* Metrics
* Other unsupported facts

## Reusable Components

Common UI elements should be implemented as reusable components.

## Responsive Design

Pages should remain usable across desktop and mobile devices.

## Theme Compatibility

Components should work in both light and dark modes.

---

# 52. Project Architecture Overview

```text
                         ┌──────────────────────┐
                         │      React UI        │
                         │  Vite + Tailwind     │
                         └──────────┬───────────┘
                                    │
                                  Axios
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      FastAPI         │
                         │      REST API        │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
          │  Services   │    │    Auth     │    │ AI Services │
          └──────┬──────┘    └─────────────┘    └──────┬──────┘
                 │                                      │
                 │                              ┌───────┴────────┐
                 │                              │                │
                 │                              ▼                ▼
                 │                       ┌────────────┐   ┌────────────┐
                 │                       │  CrewAI    │   │   Groq     │
                 │                       └────────────┘   └────────────┘
                 │
                 ▼
          ┌─────────────────┐
          │ JSON Persistence│
          │  backend/data   │
          └─────────────────┘
```

---

# 53. Project Structure

```text
smart-food-waste/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── agents/
│   │   ├── data/
│   │   ├── utils/
│   │   ├── security.py
│   │   └── seed/
│   │
│   ├── data/
│   │   ├── users.json
│   │   ├── donations.json
│   │   ├── requests.json
│   │   ├── notifications.json
│   │   ├── audit_logs.json
│   │   └── organization_profiles.json
│   │
│   ├── .env
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── organization/
│   │   ├── donor/
│   │   ├── admin/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
└── README.md
```

---

# 54. Production Considerations

The current project is an MVP intended for:

* Hackathons
* Demonstrations
* Prototypes
* Local development
* Early experimentation

Before production deployment, consider:

* PostgreSQL or another production database
* Strong production JWT secret
* HTTPS
* Secure cookies or a hardened token strategy
* Production-grade secret management
* Rate limiting
* Input sanitization
* Structured logging
* Monitoring
* Backup strategy
* Database transactions
* Concurrency protection
* Cloud object storage
* More robust notification infrastructure
* Production authentication policies

The current JSON architecture is intentionally simple and should not be treated as a high-concurrency production persistence layer.

---

# 55. Future Improvements

Possible future improvements include:

## Database

Replace JSON persistence with PostgreSQL.

## Advanced Matching

Improve matching using:

* Dietary compatibility
* Distance
* Quantity
* Expiry urgency
* Organization priority
* Food category
* Historical preferences

## Improved Logistics

Add:

* Route optimization
* Estimated travel time
* Driver assignment
* Collection scheduling
* Real-time tracking

## Notifications

Add:

* Email notifications
* SMS notifications
* Push notifications

## Analytics

Add dashboards for:

* Total food donated
* Total food rescued
* Completed collections
* Organization activity
* Donor activity
* Food waste reduction
* Geographic distribution

## AI Improvements

Future AI capabilities could include:

* Better food categorization
* Improved matching explanations
* Donation prioritization
* Demand prediction
* Collection optimization
* Automated summaries
* Food waste forecasting

AI should still remain constrained by verified application data.

---

# 56. Troubleshooting

## Backend does not start

Check:

```bash
python --version
```

Recommended:

```text
Python 3.12.x
```

Verify the virtual environment is activated.

Then reinstall:

```bash
pip install -r requirements.txt
```

---

## Groq AI does not work

Check that:

```text
backend/.env
```

contains:

```env
GROQ_API_KEY=your_real_key
GROQ_MODEL=openai/gpt-oss-120b
```

Restart the backend after changing `.env`.

---

## Frontend cannot connect to backend

Verify FastAPI is running:

```text
http://127.0.0.1:8000/docs
```

Check frontend API configuration:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Restart Vite after changing environment variables.

---

## Authentication does not work

Check:

* Backend is running
* Correct email/password
* User exists in `users.json`
* Account is not suspended
* JWT secret exists
* Browser local storage contains the access token after login

---

## AI response is empty

Check:

1. Groq API key.
2. Groq model name.
3. Backend console.
4. AI endpoint in Swagger.
5. Request payload.
6. CrewAI configuration.

---

# 57. Demo Credentials

Default administrator:

```text
Email:
admin@example.com

Password:
admin123
```

For a demo environment, create separate donor and organization accounts through the signup page.

Do not use demo credentials in a real production environment.

---

# 58. Environment Summary

## Backend

```text
Python 3.12.7
FastAPI
Uvicorn
Pydantic
PyJWT
Passlib
bcrypt
Groq
CrewAI
python-dotenv
```

## Frontend

```text
React
Vite
React Router
Axios
Tailwind CSS
lucide-react
```

## Storage

```text
JSON files
```

## AI

```text
CrewAI
Groq
openai/gpt-oss-120b
```

---

# 59. Quick Start

For experienced developers, the complete startup process is:

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

Backend API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 60. Final Summary

FoodConnect is an AI-assisted food donation platform designed to connect donors with organizations while reducing food waste.

The platform provides:

* Secure authentication
* Donor management
* Organization management
* Admin management
* Donation management
* Request management
* Quantity protection
* Collection workflow
* Notifications
* Audit logs
* Responsive frontend
* Light/dark mode
* JSON persistence
* Four specialized AI agents
* Groq-powered AI
* CrewAI orchestration
* Deterministic business logic
* Role-based authorization

The four AI agents are:

```text
1. Food Inventory Agent
   → Analyzes donated food

2. Matching Agent
   → Explains donation/organization compatibility

3. Logistics Agent
   → Provides collection and logistics suggestions

4. Coordinator Agent
   → Summarizes workflow and next actions
```

The most important architectural principle is:

```text
AI assists.
Backend decides.
```

This keeps the system useful, explainable, and safer while allowing AI to improve the user experience throughout the food donation lifecycle.

---

# License

This project is currently intended as a hackathon/MVP project.

Add an appropriate open-source or proprietary license before public distribution.
