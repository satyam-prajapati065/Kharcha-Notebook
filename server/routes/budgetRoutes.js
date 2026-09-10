const express = require('express');
const router = express.Router();
const {
  createOrUpdateBudget,
  getBudgets,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createOrUpdateBudget)
  .get(getBudgets);

router.route('/:id')
  .delete(deleteBudget);

module.exports = router;
