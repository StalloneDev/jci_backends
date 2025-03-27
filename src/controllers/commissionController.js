const { commissionService } = require('../services');

class CommissionController {
  async createCommission(req, res) {
    try {
      const commissionData = req.body;
      const commission = await commissionService.createCommission(commissionData);
      res.status(201).json(commission);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCommissionById(req, res) {
    try {
      const { id } = req.params;
      const commission = await commissionService.getCommissionById(id);
      if (!commission) {
        return res.status(404).json({ error: 'Commission not found' });
      }
      res.json(commission);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCommission(req, res) {
    try {
      const { id } = req.params;
      const commissionData = req.body;
      const commission = await commissionService.updateCommission(id, commissionData);
      res.json(commission);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCommission(req, res) {
    try {
      const { id } = req.params;
      await commissionService.deleteCommission(id);
      res.json({ message: 'Commission deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllCommissions(req, res) {
    try {
      const filters = req.query;
      const commissions = await commissionService.getAllCommissions(filters);
      res.json(commissions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addMemberToCommission(req, res) {
    try {
      const { id } = req.params;
      const { memberId, role } = req.body;
      const result = await commissionService.addMemberToCommission(id, memberId, role);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeMemberFromCommission(req, res) {
    try {
      const { id, memberId } = req.params;
      await commissionService.removeMemberFromCommission(id, memberId);
      res.json({ message: 'Member removed from commission successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCommissionMembers(req, res) {
    try {
      const { id } = req.params;
      const members = await commissionService.getCommissionMembers(id);
      res.json(members);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCommissionMeetings(req, res) {
    try {
      const { id } = req.params;
      const filters = req.query;
      const meetings = await commissionService.getCommissionMeetings(id, filters);
      res.json(meetings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new CommissionController();
