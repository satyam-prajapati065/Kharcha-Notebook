const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Create or set category budget
// @route   POST /api/budgets
// @access  Private
const createOrUpdateBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || amount === undefined || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Category, amount, month, and year are required',
      });
    }

    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const budgetAmount = Number(amount);

    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.user.id,
        category,
        month: m,
        year: y,
      },
      {
        amount: budgetAmount,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Budget saved successfully',
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budgets for specific month & year with spent calculations
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const m = month - 1;
    const startOfMonth = new Date(Date.UTC(year, m, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, m + 1, 0, 23, 59, 59, 999));

    // Get user's budgets for this month
    const budgets = await Budget.find({
      userId: req.user.id,
      month,
      year,
    });

    // Get expense transactions for this month to calculate spent per category
    const expenseTransactions = await Transaction.find({
      userId: req.user.id,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const categorySpentMap = {};
    expenseTransactions.forEach((tx) => {
      categorySpentMap[tx.category] = (categorySpentMap[tx.category] || 0) + tx.amount;
    });

    const enrichedBudgets = budgets.map((b) => {
      const spent = categorySpentMap[b.category] || 0;
      const remaining = b.amount - spent;
      const percentage = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
      const isExceeded = spent > b.amount;

      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        spent,
        remaining,
        percentage,
        isExceeded,
        month: b.month,
        year: b.year,
      };
    });

    res.status(200).json({
      success: true,
      month,
      year,
      budgets: enrichedBudgets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateBudget,
  getBudgets,
  deleteBudget,
};
