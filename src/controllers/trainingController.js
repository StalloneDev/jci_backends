const { trainingService } = require('../services');

class TrainingController {
  async createTraining(req, res) {
    try {
      const trainingData = req.body;
      const training = await trainingService.createTraining(trainingData);
      res.status(201).json(training);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTrainingById(req, res) {
    try {
      const { id } = req.params;
      const training = await trainingService.getTrainingById(id);
      if (!training) {
        return res.status(404).json({ error: 'Training not found' });
      }
      res.json(training);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateTraining(req, res) {
    try {
      const { id } = req.params;
      const trainingData = req.body;
      const training = await trainingService.updateTraining(id, trainingData);
      res.json(training);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTraining(req, res) {
    try {
      const { id } = req.params;
      await trainingService.deleteTraining(id);
      res.json({ message: 'Training deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllTrainings(req, res) {
    try {
      const filters = req.query;
      const trainings = await trainingService.getAllTrainings(filters);
      res.json(trainings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTrainerStatistics(req, res) {
    try {
      const { id } = req.params;
      const statistics = await trainingService.getTrainerStatistics(id);
      res.json(statistics);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUpcomingTrainings(req, res) {
    try {
      const trainings = await trainingService.getUpcomingTrainings();
      res.json(trainings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchTrainers(req, res) {
    try {
      const { search } = req.query;
      const trainers = await trainingService.searchTrainers(search);
      res.json(trainers);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new TrainingController();
