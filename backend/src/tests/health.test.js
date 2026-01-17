import request from 'supertest';
import app from '../app.js';

describe('Health Check Endpoint', () => {
    it('should return 200 and status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('time');
    });

    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/unknown-route-123');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('error', 'Not found');
    });
});
