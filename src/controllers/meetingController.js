const { meetingService } = require('../services');

class MeetingController {
  async createMeeting(req, res) {
    try {
      const meetingData = req.body;
      const meeting = await meetingService.createMeeting(meetingData);
      res.status(201).json(meeting);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMeetingById(req, res) {
    try {
      const { id } = req.params;
      const meeting = await meetingService.getMeetingById(id);
      if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
      }
      res.json(meeting);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMeeting(req, res) {
    try {
      const { id } = req.params;
      const meetingData = req.body;
      const meeting = await meetingService.updateMeeting(id, meetingData);
      res.json(meeting);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteMeeting(req, res) {
    try {
      const { id } = req.params;
      await meetingService.deleteMeeting(id);
      res.json({ message: 'Meeting deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllMeetings(req, res) {
    try {
      const filters = req.query;
      const meetings = await meetingService.getAllMeetings(filters);
      res.json(meetings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addReport(req, res) {
    try {
      const { id } = req.params;
      const reportData = req.body;
      const report = await meetingService.addReport(id, reportData);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateReport(req, res) {
    try {
      const { id, reportId } = req.params;
      const reportData = req.body;
      const report = await meetingService.updateReport(reportId, reportData);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteReport(req, res) {
    try {
      const { id, reportId } = req.params;
      await meetingService.deleteReport(reportId);
      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addAttachment(req, res) {
    try {
      const { id, reportId } = req.params;
      const attachmentData = {
        ...req.body,
        file: req.file, // Assuming you're using multer for file uploads
      };
      const attachment = await meetingService.addAttachment(reportId, attachmentData);
      res.status(201).json(attachment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeAttachment(req, res) {
    try {
      const { id, reportId, attachmentId } = req.params;
      await meetingService.removeAttachment(attachmentId);
      res.json({ message: 'Attachment removed successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMeetingStatistics(req, res) {
    try {
      const filters = req.query;
      const statistics = await meetingService.getMeetingStatistics(filters);
      res.json(statistics);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new MeetingController();
