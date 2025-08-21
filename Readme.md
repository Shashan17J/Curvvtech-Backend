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

The Smart Device Management Platform backend is built with Node.js and Express, using MongoDB for data storage. Users, devices, and logs have incremental IDs (userId, deviceId, logId), with devices linked to their owners and logs linked to devices. The backend follows a clean architecture with separate controllers, services, and models, while Zod is used for strict input validation on all endpoints. JWT-based authentication secures API access, with short-lived access tokens, long-lived refresh tokens, and a blacklist mechanism for revoked tokens.

Device management supports real-time updates via Server-Sent Events (SSE), broadcasting heartbeat and status changes to connected clients. Redis caching improves performance for device listings and analytics queries, with cache invalidation on updates. Background jobs automatically deactivate inactive devices, and endpoints have custom rate limits to prevent abuse. Asynchronous export and log aggregation enable efficient handling of large datasets. Overall, this architecture provides a secure, high-performance, and maintainable backend for managing smart devices and delivering real-time updates.

## Features

[feature documentation](./docs/features.md)

## Flow and Chart

[feature documentation](./docs/flow.md)

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
