const express = require('express');
const router = express.Router();
const celanderController = require('./celander.controller');

// Schedule routes
router.get('/', celanderController.getAllCelanders.bind(celanderController));
router.get('/:doctorId/schedule', celanderController.getCelanderByDoctor.bind(celanderController));
router.get('/:doctorId/schedule/:date', celanderController.getCelanderByDate.bind(celanderController));
router.post('/schedule', celanderController.createCelander.bind(celanderController));
router.put('/schedule/:id', celanderController.updateCelander.bind(celanderController));
router.delete('/schedule/:id', celanderController.deleteCelander.bind(celanderController));

// Holiday routes
router.post('/:doctorId/holiday/:date', celanderController.markHoliday.bind(celanderController));
router.delete('/:doctorId/holiday/:date', celanderController.unmarkHoliday.bind(celanderController));

module.exports = router;
