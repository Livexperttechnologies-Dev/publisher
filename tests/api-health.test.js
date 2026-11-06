const http = require('http');
const app = require('../backend/dist/app').default;

describe('API Health & Base Endpoints', () => {
  let server;
  const PORT = 5099;

  beforeAll((done) => {
    server = app.listen(PORT, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('GET /api/v1/health should return 200 OK with online status', (done) => {
    http.get(`http://localhost:${PORT}/api/v1/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        expect(res.statusCode).toBe(200);
        const parsed = JSON.parse(data);
        expect(parsed.success).toBe(true);
        expect(parsed.data.status).toBe('ONLINE');
        expect(parsed.data.module).toBe('Core Accounting & Bookseller Suite');
        done();
      });
    });
  });

  it('GET /api/docs should serve Swagger documentation UI', (done) => {
    http.get(`http://localhost:${PORT}/api/docs/`, (res) => {
      expect(res.statusCode).toBe(200);
      done();
    });
  });
});
