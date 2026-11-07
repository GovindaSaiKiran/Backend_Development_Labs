/**
 * Backend Development Fundamentals — Lab 3
 * Books Router Module
 *
 * Implements RESTful CRUD operations for the /books endpoint using SQLite.
 * Features:
 * - Search by title (search_q) with SQL LIKE
 * - Sorting (order_by, order) with column whitelisting
 * - Pagination (limit, offset) with sensible defaults
 * - Price filtering (min_price, max_price, and BETWEEN)
 * - Strict request body validation with clear HTTP 400 responses
 * - Proper HTTP status codes (200, 201, 400, 404, 500)
 * - Safe parameterized SQL queries
 */

const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

/**
 * Helper to validate numeric price values.
 * Returns true if the value is a valid finite number.
 */
function isNumeric(value) {
    if (value === null || value === undefined || value === '') {
        return false;
    }
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
}

/**
 * GET /books
 * Supports query parameters:
 * - search_q: partial match on title using LIKE
 * - order_by: column to sort by (id, title, author, price)
 * - order: sort direction (ASC, DESC)
 * - limit: number of records to return (default: 10)
 * - offset: pagination offset (default: 0)
 * - min_price: filter books with price >= min_price
 * - max_price: filter books with price <= max_price
 */
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const {
            search_q,
            order_by = 'id',
            order = 'ASC',
            limit = '10',
            offset = '0',
            min_price,
            max_price
        } = req.query;

        // 1. Validate price range query parameters if provided
        if (min_price !== undefined && !isNumeric(min_price)) {
            return res.status(400).json({ message: 'Price filter must be numeric' });
        }
        if (max_price !== undefined && !isNumeric(max_price)) {
            return res.status(400).json({ message: 'Price filter must be numeric' });
        }

        // 2. Validate limit and offset
        const parsedLimit = parseInt(limit, 10);
        const parsedOffset = parseInt(offset, 10);
        if (isNaN(parsedLimit) || parsedLimit < 0 || isNaN(parsedOffset) || parsedOffset < 0) {
            return res.status(400).json({ message: 'Limit and offset must be non-negative integers' });
        }

        // 3. Build dynamic WHERE conditions with parameterized queries
        const conditions = [];
        const queryParams = [];

        // Partial title search using SQL LIKE
        if (search_q && search_q.trim() !== '') {
            conditions.push('title LIKE ?');
            queryParams.push(`%${search_q.trim()}%`);
        }

        // Price range filtering (support min_price, max_price, and BETWEEN)
        if (min_price !== undefined && max_price !== undefined) {
            conditions.push('price BETWEEN ? AND ?');
            queryParams.push(Number(min_price), Number(max_price));
        } else if (min_price !== undefined) {
            conditions.push('price >= ?');
            queryParams.push(Number(min_price));
        } else if (max_price !== undefined) {
            conditions.push('price <= ?');
            queryParams.push(Number(max_price));
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // 4. Whitelist order_by column and order direction to prevent SQL injection
        const allowedColumns = ['id', 'title', 'author', 'price'];
        const safeOrderBy = allowedColumns.includes(String(order_by).toLowerCase())
            ? String(order_by).toLowerCase()
            : 'id';

        const safeOrder = String(order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        // 5. Construct final query using parameters for conditions and pagination
        const sqlQuery = `
            SELECT * FROM books
            ${whereClause}
            ORDER BY ${safeOrderBy} ${safeOrder}
            LIMIT ? OFFSET ?;
        `;
        queryParams.push(parsedLimit, parsedOffset);

        const books = await db.all(sqlQuery, queryParams);
        return res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching books:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * GET /books/:id
 * Retrieve a single book by its ID.
 */
router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        // Use parameterized query to prevent SQL injection
        const sqlQuery = 'SELECT * FROM books WHERE id = ?;';
        const book = await db.get(sqlQuery, [id]);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        return res.status(200).json(book);
    } catch (error) {
        console.error('Error fetching book by ID:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * POST /books
 * Create a new book.
 * Validates that title, author, and price are present and price is numeric.
 */
router.post('/', async (req, res) => {
    try {
        const { title, author, price } = req.body;

        // Step 5: Input validation requirements
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({ message: 'Title is required' });
        }

        if (!author || typeof author !== 'string' || author.trim() === '') {
            return res.status(400).json({ message: 'Author is required' });
        }

        if (price === undefined || price === null || price === '') {
            return res.status(400).json({ message: 'Price is required' });
        }

        if (!isNumeric(price)) {
            return res.status(400).json({ message: 'Price must be numeric' });
        }

        const numericPrice = Number(price);
        if (numericPrice < 0) {
            return res.status(400).json({ message: 'Price must be a positive number' });
        }

        const db = getDB();
        const insertQuery = `
            INSERT INTO books (title, author, price)
            VALUES (?, ?, ?);
        `;
        const result = await db.run(insertQuery, [title.trim(), author.trim(), numericPrice]);

        return res.status(201).json({
            message: 'Book created successfully',
            id: result.lastID,
            book: {
                id: result.lastID,
                title: title.trim(),
                author: author.trim(),
                price: numericPrice
            }
        });
    } catch (error) {
        console.error('Error creating book:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * PUT /books/:id
 * Update an existing book.
 * Returns 404 if the book does not exist.
 */
router.put('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;
        const { title, author, price } = req.body;

        // Check if book exists first
        const existingBook = await db.get('SELECT * FROM books WHERE id = ?;', [id]);
        if (!existingBook) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Validate price if provided
        if (price !== undefined) {
            if (!isNumeric(price)) {
                return res.status(400).json({ message: 'Price must be numeric' });
            }
            if (Number(price) < 0) {
                return res.status(400).json({ message: 'Price must be a positive number' });
            }
        }

        // Merge updated fields with existing values
        const updatedTitle = (title !== undefined && typeof title === 'string' && title.trim() !== '')
            ? title.trim()
            : existingBook.title;

        const updatedAuthor = (author !== undefined && typeof author === 'string' && author.trim() !== '')
            ? author.trim()
            : existingBook.author;

        const updatedPrice = (price !== undefined) ? Number(price) : existingBook.price;

        const updateQuery = `
            UPDATE books
            SET title = ?, author = ?, price = ?
            WHERE id = ?;
        `;
        await db.run(updateQuery, [updatedTitle, updatedAuthor, updatedPrice, id]);

        return res.status(200).json({
            message: 'Book updated successfully',
            book: {
                id: Number(id),
                title: updatedTitle,
                author: updatedAuthor,
                price: updatedPrice
            }
        });
    } catch (error) {
        console.error('Error updating book:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * DELETE /books/:id
 * Delete an existing book.
 * Returns 404 if the book does not exist.
 */
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        // Check if book exists first
        const existingBook = await db.get('SELECT * FROM books WHERE id = ?;', [id]);
        if (!existingBook) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const deleteQuery = 'DELETE FROM books WHERE id = ?;';
        await db.run(deleteQuery, [id]);

        return res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

