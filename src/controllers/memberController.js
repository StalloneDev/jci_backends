const { memberService } = require('../services');

class MemberController {
  async createMember(req, res) {
    try {
      const memberData = req.body;
      const member = await memberService.createMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMemberById(req, res) {
    try {
      const { id } = req.params;
      const member = await memberService.getMemberById(id);
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMember(req, res) {
    try {
      const { id } = req.params;
      const memberData = req.body;
      const member = await memberService.updateMember(id, memberData);
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteMember(req, res) {
    try {
      const { id } = req.params;
      await memberService.deleteMember(id);
      res.json({ message: 'Member deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchMembers(req, res) {
    try {
      const filters = req.query;
      const members = await memberService.searchMembers(filters);
      res.json(members);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMemberCommissions(req, res) {
    try {
      const { id } = req.params;
      const commissions = await memberService.getMemberCommissions(id);
      res.json(commissions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMemberTrainings(req, res) {
    try {
      const { id } = req.params;
      const trainings = await memberService.getMemberTrainings(id);
      res.json(trainings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new MemberController();
