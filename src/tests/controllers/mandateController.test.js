const request = require('supertest');
const app = require('../../app');
const { Member, RoleMandate } = require('../../models');
const { generateToken } = require('../../utils/auth');

describe('Mandate Controller', () => {
  let testMember;
  let adminToken;
  let memberToken;

  beforeAll(async () => {
    // Créer un membre de test
    testMember = await Member.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'MEMBER',
    });

    // Générer les tokens
    adminToken = generateToken({ id: 1, role: 'ADMIN' });
    memberToken = generateToken({ id: testMember.id, role: 'MEMBER' });
  });

  afterAll(async () => {
    await Member.destroy({ where: {} });
    await RoleMandate.destroy({ where: {} });
  });

  describe('GET /api/members/:id/mandates', () => {
    beforeEach(async () => {
      await RoleMandate.destroy({ where: {} });
      await RoleMandate.bulkCreate([
        {
          memberId: testMember.id,
          role: 'PRESIDENT',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true,
        },
        {
          memberId: testMember.id,
          role: 'SECRETARY',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          isActive: false,
        },
      ]);
    });

    it('should return all mandates for a member', async () => {
      const response = await request(app)
        .get(`/api/members/${testMember.id}/mandates`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.mandates).toHaveLength(2);
      expect(response.body.mandates[0].role).toBe('PRESIDENT');
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(app)
        .get('/api/members/999/mandates')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/members/:id/mandates', () => {
    const newMandate = {
      role: 'TREASURER',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    };

    it('should create a new mandate', async () => {
      const response = await request(app)
        .post(`/api/members/${testMember.id}/mandates`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMandate);

      expect(response.status).toBe(201);
      expect(response.body.mandate.role).toBe('TREASURER');
    });

    it('should validate dates', async () => {
      const response = await request(app)
        .post(`/api/members/${testMember.id}/mandates`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...newMandate,
          startDate: '2024-12-31',
          endDate: '2024-01-01',
        });

      expect(response.status).toBe(400);
    });

    it('should prevent overlapping active mandates', async () => {
      // Créer un mandat actif
      await RoleMandate.create({
        memberId: testMember.id,
        role: 'TREASURER',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
      });

      const response = await request(app)
        .post(`/api/members/${testMember.id}/mandates`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMandate);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/members/:id/mandates/:mandateId', () => {
    let testMandate;

    beforeEach(async () => {
      testMandate = await RoleMandate.create({
        memberId: testMember.id,
        role: 'PRESIDENT',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
      });
    });

    it('should update mandate status', async () => {
      const response = await request(app)
        .put(`/api/members/${testMember.id}/mandates/${testMandate.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.mandate.isActive).toBe(false);
    });

    it('should update end date', async () => {
      const response = await request(app)
        .put(`/api/members/${testMember.id}/mandates/${testMandate.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ endDate: '2024-06-30' });

      expect(response.status).toBe(200);
      expect(response.body.mandate.endDate).toBe('2024-06-30T00:00:00.000Z');
    });
  });

  describe('DELETE /api/members/:id/mandates/:mandateId', () => {
    let testMandate;

    beforeEach(async () => {
      testMandate = await RoleMandate.create({
        memberId: testMember.id,
        role: 'PRESIDENT',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
      });
    });

    it('should delete mandate', async () => {
      const response = await request(app)
        .delete(`/api/members/${testMember.id}/mandates/${testMandate.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      const deletedMandate = await RoleMandate.findByPk(testMandate.id);
      expect(deletedMandate).toBeNull();
    });

    it('should return 404 for non-existent mandate', async () => {
      const response = await request(app)
        .delete(`/api/members/${testMember.id}/mandates/999`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
