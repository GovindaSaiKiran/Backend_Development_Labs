/**
 * BDF Lab 01 - Express Server
 * Student Name: TANINKI GOVINDA SAI KIRAN
 * Registration Number: 252U1R8092
 * Section: CSE-QE-2B
 * Institution: Aurora Deemed to be University
 */

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies (if needed)
app.use(express.json());

// Endpoint 1: GET /
// Purpose: Display a welcome message
app.get('/', (req, res) => {
    res.status(200).send('Welcome to my Node.js and Express server!');
});

// Endpoint 2: GET /about
// Purpose: Return actual student information in JSON format
app.get('/about', (req, res) => {
    res.status(200).json({
        name: 'TANINKI GOVINDA SAI KIRAN',
        registrationNumber: '252U1R8092',
        section: 'CSE-QE-2B'
    });
});

// Endpoint 3: GET /time
// Purpose: Return dynamic server date and time
app.get('/time', (req, res) => {
    res.status(200).json({
        message: 'Current server date and time',
        currentDateTime: new Date().toISOString()
    });
});

// 404 Handler for undefined routes (registered after all routes)
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: 'The requested endpoint does not exist.'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

