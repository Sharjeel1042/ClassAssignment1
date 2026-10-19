# University Admissions Prototype

A small university admissions system built with plain Node.js (`node:http`), MongoDB, and a React + Vite frontend. Applicants can submit an application, track its status, have it admitted or rejected, and enroll in a course with limited seats.

## Features

- **Submit applications** with validated input (name, email, program, GPA 0–4) using Zod
- **Track applications** by ID and check eligibility against the program's minimum GPA
- **Admission decisions** (`ADMITTED` / `REJECTED`); only eligible applicants can be admitted, and a decision can be made only once
- **Course enrollment** inside a MongoDB transaction, with an atomic seat reservation so a course is never overbooked
- **Duplicate prevention** through unique indexes (one application per applicant per program, one enrollment per student per course)
- **Fault simulation** for the course allocation step (forced outage and timeout)
- Consistent JSON error responses with matching HTTP status codes (400, 404, 405, 409, 413, 422, 503)

## Tech Stack

| Layer    | Technology                                         |
| -------- | -------------------------------------------------- |
| Backend  | Node.js (ES modules, built-in `http`), custom router |
| Database | MongoDB (official `mongodb` driver)                |
| Validation | Zod                                              |
| Frontend | React 19, Vite                                     |
| Testing  | Vitest, Supertest                                  |

## Project Structure

```
.
├── src/
│   ├── server.js              # Entry point: connects to MongoDB and starts the server
│   ├── app.js                 # Builds the HTTP server and registers routes
│   ├── http/router.js         # Minimal router (path params, JSON body parsing)
│   ├── admissions/            # Application submission, tracking, eligibility, decisions
│   ├── enrollment/            # Transactional course enrollment
│   ├── allocation/            # Seat reservation with timeout and outage simulation
│   └── shared/                # Config, database connection/indexes, error handling
├── scripts/seed.js            # Seeds a demo program and course
├── tests/api.test.js          # API tests
└── frontend/                  # React + Vite client
```

## Prerequisites

- Node.js 20.6 or newer (uses the `--env-file` flag)
- A MongoDB deployment that supports transactions, such as a MongoDB Atlas cluster or a local replica set. A standalone `mongod` will not work for enrollment.

## Getting Started

### 1. Install dependencies

```bash
npm install
cd frontend && npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your connection string:

```bash
cp .env.example .env
```

| Variable                | Description                                              | Default      |
| ----------------------- | -------------------------------------------------------- | ------------ |
| `MONGO_URI`             | MongoDB connection string (required)                     | —            |
| `MONGO_DB`              | Database name                                            | `admissions` |
| `PORT`                  | Port for the backend server                              | `3000`       |
| `ALLOCATION_FAIL`       | Set to `1` to simulate the allocation service being down | `0`          |
| `ALLOCATION_TIMEOUT_MS` | Time limit for reserving a seat, in milliseconds         | `2000`       |

### 3. Seed demo data

```bash
npm run seed
```

This creates the program `CS` (BS Computer Science, minimum GPA 3.0) and the course `CS101` (Intro to Programming) with only **2 seats**, which makes it easy to demo a full course.

### 4. Run the backend

```bash
npm start
```

The API runs at `http://localhost:3000`.

### 5. Run the frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. The Vite dev server forwards `/api/*` requests to the backend, so no CORS setup is needed.

## API Reference

All requests and responses use JSON. Errors are returned as `{ "detail": "..." }` (validation errors return a list of messages).

| Method  | Endpoint                          | Description                                  |
| ------- | --------------------------------- | -------------------------------------------- |
| `POST`  | `/applications`                   | Submit a new application                     |
| `GET`   | `/applications/:id`               | Get an application by ID                     |
| `GET`   | `/applications/:id/eligibility`   | Check whether the applicant meets the minimum GPA |
| `PATCH` | `/applications/:id/decision`      | Admit or reject an application               |
| `POST`  | `/enrollments`                    | Enroll an admitted applicant in a course     |

### Examples

**Submit an application**

```http
POST /applications
Content-Type: application/json

{ "name": "Ali Khan", "email": "ali@example.com", "program_id": "CS", "gpa": 3.4 }
```

**Make a decision**

```http
PATCH /applications/<id>/decision
Content-Type: application/json

{ "decision": "ADMITTED" }
```

**Enroll in a course**

```http
POST /enrollments
Content-Type: application/json

{ "application_id": "<id>", "course_id": "CS101" }
```

### Common error responses

| Status | When                                                                |
| ------ | ------------------------------------------------------------------- |
| `404`  | Application, program, course, or route not found                    |
| `409`  | Duplicate application, decision already made, already enrolled, or no seats left |
| `422`  | Invalid input, applicant not eligible, not admitted, or course not in the applicant's program |
| `503`  | Database unavailable, or course allocation unavailable / timed out  |

## Running Tests

The tests clear and reseed collections, so they refuse to run unless the database name ends in `_test`:

```bash
# macOS / Linux
MONGO_DB=admissions_test npm test

# Windows PowerShell
$env:MONGO_DB="admissions_test"; npm test
```

The test suite covers input validation, duplicate applications, unknown IDs, enrolling a non-admitted applicant, duplicate and simultaneous enrollments, and the course seat limit.

## Author

Syed Muhammad Sharjeel Farsheed
