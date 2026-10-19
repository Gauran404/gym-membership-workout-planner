const request = require('supertest');
const app = require('../server');

describe('Module 2 End-to-End API Integration Suite', () => {
  let memberToken, trainerToken, testProgressId;

  // Set up tokens before running tests
  beforeAll(async () => {
    // Acquire active JWT tokens for test roles
    const memberLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'member@example.com', password: 'password123' });
    memberToken = memberLogin.body.token;

    const trainerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'trainer@example.com', password: 'password123' });
    trainerToken = trainerLogin.body.token;
  });

  // Test 1: Log Daily Progress (Member)
  it('POST /api/progress - Should allow Member to log daily progress', async () => {
    const res = await request(app)
      .post('/api/progress')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        weight: 72.5,
        workoutType: 'Leg Day & Cardio',
        durationMinutes: 45,
        caloriesBurned: 350
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    testProgressId = res.body.data._id;
  });

  // Test 2: Fetch Aggregate Stats (Member)
  it('GET /api/progress/stats - Should calculate correct stats for user', async () => {
    const res = await request(app)
      .get('/api/progress/stats')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('totalWorkouts');
  });

  // Test 3: Delete Progress Entry (Member)
  it('DELETE /api/progress/:id - Should allow owner to delete progress entry', async () => {
    const res = await request(app)
      .delete(`/api/progress/${testProgressId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('deleted');
  });
});