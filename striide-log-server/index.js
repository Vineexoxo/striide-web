
const express = require('express');
const cors = require('cors');
const fs = require('fs');  // Import fs to write logs to a file
const path = require('path');  // To handle file paths safely
const app = express();
const port = 4001;

// Use CORS to allow requests from the frontend on localhost:3000
app.use(cors({
    // origin: 'http://localhost:3000',  // Allow only requests from this origin
    methods: ['GET', 'POST'],  // Allow GET and POST methods
    allowedHeaders: ['Content-Type'],  // Allow only specific headers
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Define log file path
const logFilePath = '/logs/logfile.log';

// Function to write log to file
const writeLogToFile = (logMessage,level,timestamp) => {
    const formattedMessage = logMessage.replace(/\n/g, ' ').replace(/\r/g, ' ');
    // const logEntry = `[${timestamp}] ${logMessage}\n`;  // Format log entry
    const logEntry = `[${timestamp}] [${level}] ${formattedMessage}\n`;


    // Append the log entry to the log file
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
          } else {
            console.log('Log entry written successfully.');
          }
    });
};


// Endpoint to handle log data
app.post('/api/log', (req, res) => {
    const { level, message, timestamp } = req.body;

    if (!level || !message || !timestamp) {
        return res.status(400).send('Missing required fields');
    }
    // Write log to the file
    writeLogToFile(message,level,timestamp);
    // writeLogToFile(message, level, timestamp);

    res.status(200).send('Log received');
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Log server listening at http://localhost:${port}`);
    });
}
module.exports = app;