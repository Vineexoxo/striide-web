const request = require('supertest');
const fs = require('fs');
const path = require('path');


const app = require('../index');

describe('Log Server Tests', () => {
    const logFilePath = path.join(__dirname, '../logs/logfile.log');

    test('should handle missing required fields', async () => {
        const logData = {
            level: 'ERROR',
        };

        const response = await request(app)
            .post('/api/log')
            .send(logData)
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400); // Assuming your server sends 400 for invalid input
    });

});
