# Smart Device Management Platform

**Tech Stack**

- Node.js + Express
- TypeScript
- MongoDB
- Redis (caching)
- Zod (validation)
- JWT (authentication)
- Server-Sent Events (SSE) for real-time updates
- Docker & Docker Compose

**Architecture Overview**

[feature documentation](./docs/systemArchitecture.md)

## Features

[feature documentation](./docs/features.md)

## Auth Flow

[feature documentation](./docs/authFlow.md)

## Performance

[feature documentation](./docs/performance.md)

## Metrics

[feature documentation](./docs/metrics.md)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Shashan17J/Curvvtech-Backend.git
cd Curvvtech-Backend

```

### 2. Install dependencies

```bash
npm install

```

### 3. Environment setup

```bash
 .env available inside the project

```

### 4. Run locally

```bash
npm run dev

```

### 4. Run tests

```bash
npm test
```

---

## 🐳 Run with Docker

### Build the Docker image

```bash
docker build -t curvvtech-backend .
```

### Run Contanier

```bash
docker-compose up -d
```

### Stop Container

```bash
docker-compose down
```

The API will be available at `http://localhost:3000`

### API Documentation

- Import the included Postman collection (Curvtech.postman_collection.json)
  to test all endpoints with sample requests.

## Assumptions Made

- Each user has a unique userId (u1, u2, …) generated automatically.
- Each device has a unique deviceId (d1, d2, …).
- Each device logs has a unique logId (l1, l2 ...).
- Devices are always linked to users via owner_id and deviceId linked to device logs.
- Authentication uses JWT (sent via cookies).
