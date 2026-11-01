/**
 * BDF Lab 02 - SQLite Database and CRUD Routes
 * Student Name: TANINKI GOVINDA SAI KIRAN (and reference Latchipatruni Charan Teja)
 * Course: Backend Development Fundamentals
 * Institution: Aurora Deemed to be University
 */

const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.resolve(__dirname, 'database/books.db');

let db = null;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Database connection before starting the server
const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Ensure book table exists and has seed data if empty
        await db.exec(`
            CREATE TABLE IF NOT EXISTS book (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                price INTEGER NOT NULL,
                pages INTEGER NOT NULL
            );
        `);

        const countRow = await db.get('SELECT COUNT(*) AS count FROM book');
        if (countRow.count === 0) {
            const sampleBooks = [
                { title: 'The Alchemist', author: 'Paulo Coelho', price: 350, pages: 208 },
                { title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', price: 299, pages: 180 },
                { title: 'Atomic Habits', author: 'James Clear', price: 499, pages: 320 },
                { title: 'The Hobbit', author: 'J. R. R. Tolkien', price: 399, pages: 310 },
                { title: '1984', author: 'George Orwell', price: 250, pages: 328 },
                { title: 'Pride and Prejudice', author: 'Jane Austen', price: 275, pages: 432 },
                { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 220, pages: 180 },
                { title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 325, pages: 281 },
                { title: 'The Book Thief', author: 'Markus Zusak', price: 450, pages: 584 },
                { title: 'Ikigai', author: 'Héctor García and Francesc Miralles', price: 299, pages: 208 }
            ];

            for (const b of sampleBooks) {
                await db.run(
                    'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)',
                    [b.title, b.author, b.price, b.pages]
                );
            }
            console.log('Seeded 10 sample books.');
        }

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}/`);
        });
    } catch (e) {
        console.error(`DB Error: ${e.message}`);
        process.exit(1);
    }
};

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to BDF Lab 02 - SQLite Database & CRUD Routes API',
        endpoints: {
            getAllBooks: 'GET /books/',
            getBookById: 'GET /books/:bookId/',
            addBook: 'POST /books/',
            updateBook: 'PUT /books/:bookId/',
            deleteBook: 'DELETE /books/:bookId/'
        }
    });
});

// 1. GET /books/ - Retrieve all books
app.get('/books/', async (req, res) => {
    try {
        const getBooksQuery = `SELECT * FROM book ORDER BY id ASC;`;
        const booksArray = await db.all(getBooksQuery);
        res.status(200).json(booksArray);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET /books/:bookId/ - Retrieve a book by its ID
app.get('/books/:bookId/', async (req, res) => {
    try {
        const { bookId } = req.params;
        const getBookQuery = `SELECT * FROM book WHERE id = ?;`;
        const book = await db.get(getBookQuery, [bookId]);

        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. POST /books/ - Add a new book
app.post('/books/', async (req, res) => {
    try {
        const { title, author, price, pages } = req.body;

        if (!title || !author || price === undefined || pages === undefined) {
            return res.status(400).json({ error: 'Missing required book fields: title, author, price, pages' });
        }

        const addBookQuery = `
            INSERT INTO book (title, author, price, pages)
            VALUES (?, ?, ?, ?);
        `;
        const result = await db.run(addBookQuery, [title, author, price, pages]);
        res.status(201).json({
            message: 'Book Added Successfully',
            bookId: result.lastID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. PUT /books/:bookId/ - Update a book by its ID
app.put('/books/:bookId/', async (req, res) => {
    try {
        const { bookId } = req.params;
        const { title, author, price, pages } = req.body;

        const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
        const existingBook = await db.get(checkBookQuery, [bookId]);

        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const updatedTitle = title !== undefined ? title : existingBook.title;
        const updatedAuthor = author !== undefined ? author : existingBook.author;
        const updatedPrice = price !== undefined ? price : existingBook.price;
        const updatedPages = pages !== undefined ? pages : existingBook.pages;

        const updateBookQuery = `
            UPDATE book
            SET
                title = ?,
                author = ?,
                price = ?,
                pages = ?
            WHERE
                id = ?;
        `;
        await db.run(updateBookQuery, [updatedTitle, updatedAuthor, updatedPrice, updatedPages, bookId]);
        res.status(200).json({
            message: 'Book Updated Successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. DELETE /books/:bookId/ - Delete a book by its ID
app.delete('/books/:bookId/', async (req, res) => {
    try {
        const { bookId } = req.params;

        const checkBookQuery = `SELECT * FROM book WHERE id = ?;`;
        const existingBook = await db.get(checkBookQuery, [bookId]);

        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const deleteBookQuery = `DELETE FROM book WHERE id = ?;`;
        await db.run(deleteBookQuery, [bookId]);
        res.status(200).json({
            message: 'Book Deleted Successfully'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 404 Handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: 'The requested endpoint does not exist.'
    });
});

initializeDBAndServer();
