# Backend Development Fundamentals — Lab 3: RESTful Books API

> **Live Deployment:** [https://bdf-lab-03-dsxp.onrender.com](https://bdf-lab-03-dsxp.onrender.com)  
> **API Books Endpoint:** [https://bdf-lab-03-dsxp.onrender.com/books](https://bdf-lab-03-dsxp.onrender.com/books)

## Student Information
- **Student Name:** TANINKI GOVINDA SAI KIRAN 
- **Registration Number:** 252U1R8092 
- **Course:** Backend Development Fundamentals (BDF)
- **Institution:** Aurora Deemed to be University

## Objective

Build a RESTful Books API using **Node.js, Express.js, and SQLite** supporting full CRUD operations, parameterized SQL queries, query parameters (search, sorting, pagination, price-range filtering), robust request validation, correct HTTP status codes, and consistent JSON responses.

---

## Technologies Used

- **Runtime Environment:** Node.js (CommonJS)
- **Web Framework:** Express.js (`^4.19.2`)
- **Database Engine:** SQLite3 (`^5.1.7`)
- **Database Driver:** `sqlite` (`^5.1.1` - Promise-based async/await wrapper for sqlite3)
- **API Testing:** Postman / cURL / REST Client

---

## Project Structure

```text
Lab3/
├── package.json          # Project metadata, scripts, and dependencies
├── server.js             # Express app setup, error handling, server bootstrap
├── database.js           # SQLite connection, table schema creation, data seeding
├── routes/
│   └── books.js          # RESTful routes, validation, parameterized queries
├── database/
│   └── books.db          # SQLite database file (created automatically)
├── screenshots/          # Folder for Postman test evidence screenshots
├── Lab3_Books_API.postman_collection.json # Ready-to-import Postman Collection
├── test-api.js           # Automated test suite covering all 18 Postman test cases
├── .gitignore            # Git exclusion rules (node_modules, .env, etc.)
└── README.md             # Project documentation and API guide
```

---

## Database Information

- **Database File:** `database/books.db`
- **Table Name:** `books`
- **Schema:**
  - `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
  - `title`: `TEXT NOT NULL`
  - `author`: `TEXT NOT NULL`
  - `price`: `REAL NOT NULL`
- **Automatic Initialization:**
  When the server boots up, `initializeDatabase()` in `database.js` automatically creates the `books` table if it does not already exist. It also seeds a diverse initial set of 8 sample books if the table is empty, ensuring the database is not re-seeded or duplicated on server restarts.

---

## Installation & Setup

1. **Navigate to the Lab3 directory:**
   ```bash
   cd Lab3
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   - Standard start:
     ```bash
     npm start
     ```
   - Development mode with auto-reload:
     ```bash
     npm run dev
     ```

The server starts by default at `http://localhost:3000`.

---

## REST API Endpoints Overview

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/` | API Health & Route discovery | `200 OK` |
| `GET` | `/books` | Retrieve books with optional filters | `200 OK`, `400 Bad Request` |
| `GET` | `/books/:id` | Retrieve single book by ID | `200 OK`, `404 Not Found` |
| `POST` | `/books` | Create a new book | `201 Created`, `400 Bad Request` |
| `PUT` | `/books/:id` | Update an existing book | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/books/:id` | Delete an existing book | `200 OK`, `404 Not Found` |

---

## Query Parameters for `GET /books`

The `GET /books` endpoint supports flexible querying. All conditions are dynamically appended using parameterized SQL queries to guarantee security against SQL injection.

### 1. Partial Title Search (`search_q`)
Filters books whose titles contain the query string (case-insensitive substring match using SQL `LIKE ?`).
```text
GET /books?search_q=python
```

### 2. Sorting (`order_by` & `order`)
- `order_by`: Whitelisted column to sort by (`id`, `title`, `author`, `price`). Defaults to `id`.
- `order`: Sort direction (`ASC` or `DESC`). Defaults to `ASC`.
```text
GET /books?order_by=price&order=DESC
GET /books?order_by=title&order=ASC
```

### 3. Pagination (`limit` & `offset`)
- `limit`: Maximum number of records to return (Default: `10`).
- `offset`: Number of records to skip (Default: `0`).
```text
GET /books?limit=5&offset=0
GET /books?limit=5&offset=5
```

### 4. Price Range Filtering (`min_price` & `max_price`)
- `min_price`: Books with `price >= min_price`.
- `max_price`: Books with `price <= max_price`.
- Both: Books with `price BETWEEN min_price AND max_price`.
```text
GET /books?min_price=100
GET /books?max_price=500
GET /books?min_price=100&max_price=500
```

### 5. Combined Filters Example
```text
GET /books?search_q=code&min_price=200&max_price=600&order_by=price&order=ASC&limit=5&offset=0
```

---

## Request Bodies & Validation

### Creating a Book (`POST /books`)

**Headers:**
```text
Content-Type: application/json
```

**Valid Request Body:**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "price": 450
}
```

**Success Response (`201 Created`):**
```json
{
  "message": "Book created successfully",
  "id": 9,
  "book": {
    "id": 9,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 450
  }
}
```

**Validation Rules & Error Responses (`400 Bad Request`):**
- Missing title:
  ```json
  { "message": "Title is required" }
  ```
- Missing author:
  ```json
  { "message": "Author is required" }
  ```
- Missing price:
  ```json
  { "message": "Price is required" }
  ```
- Non-numeric price:
  ```json
  { "message": "Price must be numeric" }
  ```

---

### Updating a Book (`PUT /books/:id`)

**Headers:**
```text
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Clean Code (2nd Edition)",
  "author": "Robert C. Martin",
  "price": 500
}
```

**Success Response (`200 OK`):**
```json
{
  "message": "Book updated successfully",
  "book": {
    "id": 1,
    "title": "Clean Code (2nd Edition)",
    "author": "Robert C. Martin",
    "price": 500
  }
}
```

**Non-existent ID Response (`404 Not Found`):**
```json
{
  "message": "Book not found"
}
```

---

### Deleting a Book (`DELETE /books/:id`)

**Success Response (`200 OK`):**
```json
{
  "message": "Book deleted successfully"
}
```

**Non-existent ID Response (`404 Not Found`):**
```json
{
  "message": "Book not found"
}
```

---

## Common Debugging Guide

1. **`EADDRINUSE` (Port already in use):**
   - The server catches this error automatically and logs helpful instructions.
   - Run on a different port:
     ```bash
     PORT=3001 npm start
     ```
   - On Windows PowerShell, find and terminate the blocking process:
     ```powershell
     netstat -ano | findstr :3000
     taskkill /PID <PID> /F
     ```

2. **Wrong Import Paths:**
   - `server.js` imports `./database` and `./routes/books`.
   - `routes/books.js` imports `../database`.

3. **`no such table: books`:**
   - `initializeDatabase()` in `database.js` executes `CREATE TABLE IF NOT EXISTS books ...` before the Express HTTP listener begins accepting incoming requests.

4. **Missing `await` in Database Operations:**
   - Every SQLite operation (`open`, `exec`, `get`, `all`, `run`) returns a Promise and is properly `await`ed within `async` functions.

---

## Postman Test Checklist & Evidence

> **Tip:** You can directly import `Lab3_Books_API.postman_collection.json` into Postman (`File` -> `Import`) to instantly have all 18 pre-configured requests ready to execute.

Use the following checklist to run your Postman collection and save screenshots into `Lab3/screenshots/`:

### Success Tests
- [ ] **01_get_books.png** — `GET http://localhost:3000/books` → `200 OK`
<img width="1917" height="1022" alt="image" src="https://github.com/user-attachments/assets/f4b01955-12c9-45b5-b92b-f4bbbe2a4d1c" />

- [ ] **02_get_book_by_id.png** — `GET http://localhost:3000/books/1` → `200 OK`
<img width="1917" height="1015" alt="image" src="https://github.com/user-attachments/assets/d5e79c77-5f99-40a7-8e11-ffc77a292261" />

- [ ] **03_post_success.png** — `POST http://localhost:3000/books` (valid body) → `201 Created`
      <img width="1910" height="1012" alt="image" src="https://github.com/user-attachments/assets/6e42ea3f-ef22-4a02-80cd-5519025dae59" />

- [ ] **05_search.png** — `GET http://localhost:3000/books?search_q=python` → `200 OK`
<img width="1917" height="1016" alt="image" src="https://github.com/user-attachments/assets/7c972814-3b5b-4229-af8a-c2c6a598ebba" />

- [ ] **06_sort.png** — `GET http://localhost:3000/books?order_by=price&order=DESC` → `200 OK`
<img width="1917" height="1022" alt="image" src="https://github.com/user-attachments/assets/2fe58a5f-4224-4c6c-9cd7-65e6ded34fe8" />

- [ ] **07_pagination.png** — `GET http://localhost:3000/books?limit=3&offset=0` → `200 OK`
<img width="1917" height="1022" alt="image" src="https://github.com/user-attachments/assets/b2d73e08-b213-4967-b9d5-7d8f422c494d" />

- [ ] **08_price_filter.png** — `GET http://localhost:3000/books?min_price=300&max_price=500` → `200 OK`
<img width="1917" height="1015" alt="image" src="https://github.com/user-attachments/assets/529fc90f-57dc-47d7-b53d-14562fdc978a" />

- [ ] **10_put_success.png** — `PUT http://localhost:3000/books/1` → `200 OK`
<img width="1917" height="1012" alt="image" src="https://github.com/user-attachments/assets/50290fe0-5515-429f-a612-90841b45d39b" />

- [ ] **11_delete_success.png** — `DELETE http://localhost:3000/books/1` → `200 OK`
<img width="1917" height="1021" alt="image" src="https://github.com/user-attachments/assets/73cb7e4c-1428-4ec4-a121-208d7c60a0eb" />


### Failure & Validation Tests
- [ ] **04_post_validation_400.png** — `POST http://localhost:3000/books` (missing/non-numeric price) → `400 Bad Request`

- [ ] **09_not_found_404.png** — `GET http://localhost:3000/books/999` → `404 Not Found`
<img width="1917" height="1010" alt="image" src="https://github.com/user-attachments/assets/84e194e1-3e90-425b-8eb0-d5706891df3f" />

- [ ] `PUT /books/999` → `404 Not Found`
<img width="1917" height="1017" alt="image" src="https://github.com/user-attachments/assets/70e714d5-d3b1-4065-bb23-0aca6edec9cb" />

- [ ] `DELETE /books/999` → `404 Not Found`
<img width="1917" height="1012" alt="image" src="https://github.com/user-attachments/assets/c9d5be41-b605-43ae-ba2e-ab1da6de762d" />


