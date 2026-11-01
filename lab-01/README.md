# Lab 1: Node.js and Express server

- **Student Name:** TANINKI GOVINDA SAI KIRAN
- **Registration Number:** 252U1R8092
- **Section:** CSE-QE-2B
- **Course:** Backend Development Fundamentals (BDF)
- **Institution:** Aurora Deemed to be University

---

## Live Link
- **Deployed URL:** [https://bdf-lab-01-tv0i.onrender.com](https://bdf-lab-01-tv0i.onrender.com)
- **Deployment Platform:** Render (Web Service - Node.js)
- **GitHub Repository:** [https://github.com/GovindaSaiKiran/Backend_Development_Labs](https://github.com/GovindaSaiKiran/Backend_Development_Labs)

---

## How to Run

### 1. Prerequisites
Verify that Node.js (v18+) and npm (v9+) are installed:
```bash
node -v
npm -v
```

### 2. Installation
Navigate into the `lab-01` directory and install project dependencies:
```bash
cd lab-01
npm install
```

### 3. Environment Variables
- `PORT`: (Optional) Network port number. Defaults to `3000` for local execution. On Render cloud hosting, it is dynamically assigned via `process.env.PORT`.

### 4. Start Commands

#### A. Run Express Server (Primary Production Server)
```bash
npm start
```
*Listens at: `http://localhost:3000`*

#### B. Run Plain Node.js HTTP Server
```bash
npm run start:http
```
*Listens at: `http://localhost:3000`*

#### C. Development Mode (Auto-restart on code edit)
```bash
npm run dev
```

---

## Endpoints / Scripts Table

### Available npm Scripts
| Script | Command | Purpose |
|---|---|---|
| `start` | `node server.js` | Starts the Express server |
| `dev` | `node --watch server.js` | Starts Express in watch mode (auto reload) |
| `start:http` | `node http-server.js` | Starts the low-level built-in HTTP server |

### Express API Endpoints
| HTTP Method | Endpoint Path | Description | Expected Status | Response Format |
|---|---|---|:---:|---|
| **GET** | `/` | Home route returning welcome message | `200 OK` | `text/plain` |
| **GET** | `/about` | Returns student details (name, regNo, section) | `200 OK` | `application/json` |
| **GET** | `/time` | Returns dynamic current server timestamp | `200 OK` | `application/json` |
| **GET** | `/unknown` (any undefined route) | Catch-all 404 error handler | `404 Not Found` | `application/json` |

---

## Screenshots

### 1. Plain Node.js HTTP Server (`http-server.js` listening on port 3000)
![HTTP Server](screenshots/http-server.png)

### 2. Express Server — Home Route (`GET /`)
![Home Route](screenshots/home.png)

### 3. Express Server — About Route (`GET /about`)
![About Route](screenshots/about.png)

### 4. Express Server — Dynamic Time Route (`GET /time`)
![Time Route](screenshots/time.png)

### 5. Express Server — 404 Route Not Found (`GET /unknown`)
![404 Response](screenshots/not-found.png)

---

## Notes: Problems Faced and How You Solved Them

1. **Port Binding & Sandbox Execution Restrictions:**
   - *Problem:* Running a local development server inside an isolated container sandbox prevented loopback network requests (`localhost:3000`) from connecting.
   - *Solution:* Executed process verification using loopback TCP socket bindings and automated graceful process shutdown in PowerShell.

2. **Ensuring Dynamic Date & Time on Every Request:**
   - *Problem:* If `new Date()` is declared globally outside the route callback, the timestamp is cached at server startup and remains static across requests.
   - *Solution:* Instantiated `new Date().toISOString()` directly inside the `app.get('/time', ...)` route handler function so that a fresh, accurate timestamp is generated dynamically on each client request.

3. **404 Middleware Interception Order:**
   - *Problem:* In Express, middleware functions execute sequentially in the exact order they are registered. Placing a catch-all handler above existing routes causes all valid endpoints to return 404 prematurely.
   - *Solution:* Placed `app.use((req, res) => { ... })` at the very end of the file, strictly below all declared route handlers (`/`, `/about`, `/time`).

4. **Multi-Lab Subdirectory Deployment on Render:**
   - *Problem:* The GitHub repository hosts multiple lab directories (`lab-01`, etc.). By default, cloud platforms attempt to build and run the repository root, where there is no `server.js` or `package.json`.
   - *Solution:* Configured Render's `rootDir` parameter to `lab-01` via the Render API, ensuring that `npm install` and `npm start` execute directly inside the `lab-01` folder.

---

## Project Structure
```text
Backend_Development_Labs/
├── .gitignore
├── README.md
└── lab-01/
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── http-server.js
    ├── server.js
    ├── README.md
    └── screenshots/
        ├── http-server.png
        ├── home.png
        ├── about.png
        ├── time.png
        └── not-found.png
```

---

## Package.json Breakdown

| Field | Value / Explanation |
|---|---|
| `name` | `bdf-lab-01` — Project identifier |
| `version` | `1.0.0` — Initial version |
| `description` | BDF Lab 01 - Node.js and Express Server by TANINKI GOVINDA SAI KIRAN (252U1R8092) |
| `main` | `server.js` — Primary entry point |
| `scripts` | `start`, `dev`, `start:http` — Execution commands |
| `author` | `TANINKI GOVINDA SAI KIRAN (252U1R8092)` |
| `license` | `ISC` |
| `dependencies` | `express: ^5.3.0` |

---

## Detailed Code Explanations

### 1. Plain Node.js HTTP Server (`http-server.js`)
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```
- `require('http')`: Loads the core Node.js HTTP module.
- `http.createServer()`: Instantiates the HTTP server.
- `res.writeHead(200, headers)`: Sets the status code to 200 and specifies `Content-Type: text/plain`.
- `res.end('Hello')`: Sends the response body and terminates the HTTP connection.
- `server.listen(3000)`: Binds the server to port 3000 to accept connections.

### 2. Express Server (`server.js`)
```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send('Welcome to my Node.js and Express server!');
});

app.get('/about', (req, res) => {
    res.status(200).json({
        name: 'TANINKI GOVINDA SAI KIRAN',
        registrationNumber: '252U1R8092',
        section: 'CSE-QE-2B'
    });
});

app.get('/time', (req, res) => {
    res.status(200).json({
        message: 'Current server date and time',
        currentDateTime: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: 'The requested endpoint does not exist.'
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
```
- `const app = express()`: Initializes the Express application.
- `process.env.PORT || 3000`: Enables both cloud hosting (dynamic port) and local testing (3000).
- `app.get()`: Defines routing for HTTP GET requests.
- `res.status().json()`: Serializes response objects directly into JSON with the proper `Content-Type` header.
- `app.use()`: Catches all unmatched paths and responds with a 404 status.

---

## Live Cloud Verification Results

Actual HTTP tests conducted on the live Render deployment (`https://bdf-lab-01-tv0i.onrender.com`):

| Method | Endpoint | Tested HTTP Status | Actual Response Body Verified | Result |
|:---:|---|:---:|---|:---:|
| **GET** | `/` | `200 OK` | `Welcome to my Node.js and Express server!` | **VERIFIED LIVE** |
| **GET** | `/about` | `200 OK` | `{"name":"TANINKI GOVINDA SAI KIRAN","registrationNumber":"252U1R8092","section":"CSE-QE-2B"}` | **VERIFIED LIVE** |
| **GET** | `/time` | `200 OK` | `{"message":"Current server date and time","currentDateTime":"2026-11-01T13:37:03.886Z"}` | **VERIFIED LIVE** |
| **GET** | `/unknown` | `404 Not Found` | `{"error":"Route not found","message":"The requested endpoint does not exist."}` | **VERIFIED LIVE** |

---

## Viva Preparation Guide (Questions & Answers)

### 1. What is Node.js?
Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser, powered by Chrome's V8 engine and the `libuv` asynchronous I/O library.

### 2. What is npm?
npm is the default package manager for Node.js, providing an online repository of open-source packages and a CLI tool to manage dependencies, versions, and scripts.

### 3. What is Express.js?
Express.js is a minimalist, flexible web application framework for Node.js designed for building web applications and RESTful APIs with concise routing and middleware handling.

### 4. What is package.json?
It is the manifest file of a Node.js project containing project metadata (name, version, author), run scripts, and lists of required dependencies.

### 5. What is package-lock.json?
An automatically generated lockfile that records the exact versions of dependencies and sub-dependencies installed, guaranteeing reproducible builds across different systems.

### 6. What is the node_modules folder?
The local directory where npm installs all downloaded packages. It is ignored in Git via `.gitignore` because it can be rebuilt anytime with `npm install`.

### 7. What is the built-in HTTP module?
The core Node.js `http` module provides native capabilities to transfer data and create web servers using the HTTP protocol without third-party libraries.

### 8. What does http.createServer() do?
It creates a native HTTP server instance and binds a request handler callback that receives `req` and `res` objects for every incoming HTTP connection.

### 9. What are the req and res objects?
- `req`: An instance of `http.IncomingMessage`, representing the incoming client request (headers, URL, method, body).
- `res`: An instance of `http.ServerResponse`, representing the server's outgoing response to the client.

### 10. What does res.writeHead() do?
Sends the HTTP status code and response headers directly to the client before sending the body.

### 11. What does res.end() do?
Flushes the response data and signals to the server that all headers and body have been sent, completing the request-response cycle.

### 12. What is an HTTP request?
A formatted message sent by a client (browser, curl) requesting a resource or action from a server (e.g. `GET`, `POST`).

### 13. What is an HTTP response?
The formatted reply sent by the server to the client containing an HTTP status code, headers, and an optional body.

### 14. What is a route?
A URI (or path) combined with an HTTP request method (GET, POST, etc.) that directs how an application handles a specific client request.

### 15. What does app.get() do?
Registers a route handler specifically for incoming HTTP GET requests at a given path.

### 16. What does express() do?
Initializes and returns an Express application instance that acts as the routing and middleware pipeline.

### 17. What does app.listen() do?
Binds the application to a specified TCP port number and starts listening for incoming client network requests.

### 18. What is middleware?
Functions in Express that have access to the `req`, `res`, and `next` objects, allowing them to execute code, transform requests, or terminate the response.

### 19. What is a 404 status code?
A standard HTTP status code signifying "Not Found", meaning the client connected to the server but the requested resource/route does not exist.

### 20. What is the difference between 200 and 404?
- `200 OK`: Request succeeded and the server returned the requested resource.
- `404 Not Found`: Request reached the server, but the requested endpoint is undefined.

### 21. Why is process.env.PORT used?
Cloud platforms like Render assign random available ports at container runtime via the `PORT` environment variable. `process.env.PORT || 3000` allows the server to bind to the cloud port dynamically while defaulting to 3000 locally.

### 22. What is the difference between Node.js HTTP and Express?
The built-in HTTP module requires manual URL parsing, stream handling, and header management. Express provides high-level routing, built-in JSON helpers, and modular middleware.

### 23. What is deployment?
The process of packaging, configuring, and publishing an application onto a remote server or cloud infrastructure so it is publicly accessible over the internet.

### 24. What is Render?
Render is a cloud hosting platform providing automated deployments directly from GitHub with built-in SSL certificates, custom domains, and support for Node.js web services.

### 25. What is the purpose of Git and GitHub?
Git is a local distributed version control system that tracks file modifications over time. GitHub is a cloud hosting service for Git repositories that enables collaboration, history backup, and CI/CD automated deployments.
