import request from 'supertest';
import app from '../app';

const credentials = { username: 'alex', password: 'secret123' };

describe('Auth Routes', () => {
  test('registers a new user', async () => {
    const response = await request(app).post('/api/auth/register').send(credentials);

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toMatchObject({ username: credentials.username, role: 'unregistered' });
  });

  test('prevents duplicate usernames', async () => {
    await request(app).post('/api/auth/register').send({ username: 'unique', password: 'password' });
    const response = await request(app).post('/api/auth/register').send({ username: 'unique', password: 'password' });

    expect(response.status).toBe(409);
  });

  test('logs in an existing user', async () => {
    await request(app).post('/api/auth/register').send({ username: 'loginuser', password: 'password' });
    const response = await request(app).post('/api/auth/login').send({ username: 'loginuser', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.role).toBe('unregistered');
  });
});
