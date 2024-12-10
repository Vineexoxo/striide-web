// const express = require('express');
// const cors = require('cors');  // Import CORS
// const app = express();
// const port = 4001;

// // Use CORS to allow requests from the frontend on localhost:3000
// app.use(cors({
//     origin: 'http://localhost:3000',  // Allow only requests from this origin
//     methods: ['GET', 'POST'],  // Allow GET and POST methods
//     allowedHeaders: ['Content-Type'],  // Allow only specific headers
// }));

// app.post('/api/log', (req, res) => {
//     // Handle your logging logic here
//     console.log(req.body);
//     res.status(200).send('Log received');
// });

// app.listen(port, () => {
//     console.log(`Log server listening at http://localhost:${port}`);
// });
const express = require('express');
const cors = require('cors');
const fs = require('fs');  // Import fs to write logs to a file
const path = require('path');  // To handle file paths safely
const app = express();
const port = 4001;

// Use CORS to allow requests from the frontend on localhost:3000
app.use(cors({
    origin: 'http://localhost:3000',  // Allow only requests from this origin
    methods: ['GET', 'POST'],  // Allow GET and POST methods
    allowedHeaders: ['Content-Type'],  // Allow only specific headers
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Define log file path
const logFilePath = path.join(__dirname, 'logs', 'logfile.log');

// Function to write log to file
const writeLogToFile = (logMessage) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${logMessage}\n`;  // Format log entry

    // Append the log entry to the log file
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error("Error writing log to file:", err);
        }
    });
};

// Endpoint to handle log data
app.post('/api/log', (req, res) => {
    const { message, level } = req.body;

    // Write log to the file
    writeLogToFile(`[${level}] ${message}`);

    // Send response
    res.status(200).send('Log received');
});

app.listen(port, () => {
    console.log(`Log server listening at http://localhost:${port}`);
});

