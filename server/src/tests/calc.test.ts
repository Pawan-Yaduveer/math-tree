import request from 'supertest';
import app from '../app';

const createRegisteredUser = async () => {
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ username: `user_${Date.now()}`, password: 'secret123' });

  const token = registerRes.body.token as string;
  const upgradeRes = await request(app)
    .post('/api/auth/upgrade')
    .set('Authorization', `Bearer ${token}`)
    .send();

  return upgradeRes.body.token as string;
};

describe('Calculation Routes', () => {
  test('requires authentication to start a chain', async () => {
    const response = await request(app).post('/api/calc/start').send({ value: 5 });
    expect(response.status).toBe(401);
  });

  test('starts a new chain and replies', async () => {
    const token = await createRegisteredUser();

    const startRes = await request(app)
      .post('/api/calc/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ value: 10 });

    expect(startRes.status).toBe(200);
    expect(startRes.body.value).toBe(10);

    const replyRes = await request(app)
      .post('/api/calc/reply')
      .set('Authorization', `Bearer ${token}`)
      .send({ parentId: startRes.body._id, operation: 'add', inputNumber: 5 });

    expect(replyRes.status).toBe(200);
    expect(replyRes.body.value).toBe(15);

    const treeRes = await request(app).get('/api/calc');
    expect(treeRes.status).toBe(200);
    expect(treeRes.body.summary.totalNodes).toBe(2);
    expect(treeRes.body.tree[0].children[0].value).toBe(15);
  });
});
