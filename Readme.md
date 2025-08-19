# Smart Device Management Platform

A Typescript + Node.js + Express + MongoDB application to manage **Users**, **Device** and their **DevicesLogs**.  
Each user is assigned a unique `userId` (`u1`, `u2`, …) and each device a unique `deviceId` (`d1`, `d2`, …) using auto-incrementing IDs.

## 🚀 Features

- User registration and login with JWT authentication
- Secure password hashing
- Middlewares
- Device registration linked to users
- Auto-generated `userId`,`deviceId` and `logId`
- ZOD Validation
- Background Cron Job
- Type Safety
- Secured Routes with JWT
- Unit Tests (using Jest)
- RESTful API with JSON responses

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

The API will be available at 👉 `http://localhost:3000`

### API Documentation

- Import the included Postman collection (Curvvtech-Backend.postman_collection.json)
  to test all endpoints with sample requests.

## Assumptions Made

- Each user has a unique userId (u1, u2, …) generated automatically.
- Each device has a unique deviceId (d1, d2, …).
- Each device logs has a unique logId (l1, l2 ...).
- Devices are always linked to users via owner_id and deviceId linked to device logs.
- Authentication uses JWT (sent via cookies).
