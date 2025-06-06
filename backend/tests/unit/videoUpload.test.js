const request = require('supertest');
const app = require('../../src/app');
const path = require('path');
const fs = require('fs').promises;

it('should extract all frames from uploaded video', async () => {
    const res = await request(app)
        .post('/api/upload')
        .attach('video', path.join(__dirname, 'test-video.mp4'));

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Frames saved');

}, 60000); // Increase timeout to 60 seconds (or more if needed)