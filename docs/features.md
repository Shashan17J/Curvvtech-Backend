## Feature Documentation

## Features & Bonus Featrues(All r implemented)

1. **Authentication & Security**
   - Secure user authentication using JSON Web Tokens.
   - All user passwords are stored securely using strong hashing algorithms (e.g., bcrypt).
   - Sensitive routes are protected and accessible only with valid JWTs.

2. **Advanced Authentication & Security**
   - Implemented refresh token mechanism
   - Short-lived access jwt tokens (15 minutes)
   - Long-lived refresh jwt tokens (7 days)
   - Token rotation on refresh
   - Blacklist mechanism for revoked tokens

3. **Caching using Redis**
   - Cache device listings and user data with appropriate TTL (15-30 minutes)
   - Cache expensive analytics queries for 5 minutes
   - Implement cache invalidation on device updates

4. **Middlewares**
   - Authentication Middleware – Validates JWT tokens and authenticates users.
   - Incoming Request IP Logging – Logs the client’s IP address for each incoming request.
   - Database Query Monitoring – Tracks and logs database query performance.
   - API Response Time Logger – Measures and logs response times for API requests.

5. **Device Management**
   - Device Registration – Devices can be registered and linked to users.
   - Auto-generated Identifiers – userId, deviceId, and logId are automatically generated for consistency.

6. **Validation & Type Safety**
   - Zod Validation – All incoming requests are validated using Zod schemas.
   - Type Safety – Full TypeScript support ensures safer and more maintainable code.

7. **Background Jobs**
   - Cron Jobs – Automated background jobs update device/user statuses and perform scheduled tasks.
   - ProcessExportJob - Async job processing for large exports (returns job ID, check status) inside redis and sent email notification

8. **Testing**
   - Unit Tests – Comprehensive unit test coverage using Jest for reliability and correctness.

9. **Real-Time Updates (SSE)**
   - Server-Sent Events (SSE) – Real-time streaming updates to connected clients.
   - Device Status Updates – Device status changes are pushed instantly.
   - Heartbeat Events – Periodic events broadcasted to all organization users for monitoring.

10. **Logs Export Service**
    - Export Formats – Logs can be exported in CSV or JSON.
    - Asynchronous Processing – Large exports are handled in the background.
    - Job Management – A jobId is returned immediately to check the status later.
    - User Notifications – Users are notified via email when the export is ready.
    - Downloadable Link (only if it hits from browser not from postman) – A secure link is provided to download the exported logs.

11. **CORS configuration**

12. **Rate limiting per endpoint (different limits for enpoints)**

13. **Health Check Enpoint**
    - Checks Database and Redis Connection

14. **DB Indexing**
    - Mostly used is deviced
