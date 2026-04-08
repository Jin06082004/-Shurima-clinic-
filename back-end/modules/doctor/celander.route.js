const express = require('express');
const router = express.Router();
const celanderController = require('./celander.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { requireRoles } = require('../../middleware/role.middleware');

const CAN_EDIT_SCHEDULE = ['admin', 'staff', 'doctor'];

router.get('/', authMiddleware, celanderController.getAllCelanders.bind(celanderController));
router.get('/:doctorId/schedule', authMiddleware, celanderController.getCelanderByDoctor.bind(celanderController));
router.get('/:doctorId/schedule/:date', authMiddleware, celanderController.getCelanderByDate.bind(celanderController));

router.post(
  '/schedule',
  authMiddleware,
  requireRoles(...CAN_EDIT_SCHEDULE),
  celanderController.createCelander.bind(celanderController)
);
router.put(
  '/schedule/:id',
  authMiddleware,
  requireRoles(...CAN_EDIT_SCHEDULE),
  celanderController.updateCelander.bind(celanderController)
);
router.delete(
  '/schedule/:id',
  authMiddleware,
  requireRoles(...CAN_EDIT_SCHEDULE),
  celanderController.deleteCelander.bind(celanderController)
);

router.post(
  '/:doctorId/holiday/:date',
  authMiddleware,
  requireRoles(...CAN_EDIT_SCHEDULE),
  celanderController.markHoliday.bind(celanderController)
);
router.delete(
  '/:doctorId/holiday/:date',
  authMiddleware,
  requireRoles(...CAN_EDIT_SCHEDULE),
  celanderController.unmarkHoliday.bind(celanderController)
);

module.exports = router;
