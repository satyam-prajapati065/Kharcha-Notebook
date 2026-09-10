const Transaction = require('../models/Transaction');

// @desc    Create a new transaction (Cash In or Cash Out)
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, date, paymentMethod, description, note } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Type, amount, and category are required fields',
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero',
      });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount: Number(amount),
      category,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'Cash',
      description: description || '',
      note: note || '',
    });

    res.status(201).json({
      success: true,
      message: `${type === 'income' ? 'Cash In' : 'Cash Out'} recorded successfully`,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transactions with filtering, searching, and sorting
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      paymentMethod,
      month,
      year,
      startDate,
      endDate,
      search,
      sortBy = 'newest',
      limit = 100,
      page = 1,
    } = req.query;

    const query = { userId: req.user.id };

    // Filter by type
    if (type && (type === 'income' || type === 'expense')) {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by payment method
    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    // Filter by Month and Year
    if (month && year) {
      const m = parseInt(month, 10) - 1; // 0-indexed month
      const y = parseInt(year, 10);
      const startOfMonth = new Date(Date.UTC(y, m, 1, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Search by description or category
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { description: searchRegex },
        { category: searchRegex },
        { note: searchRegex },
      ];
    }

    // Sorting
    let sortOptions = { date: -1, createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOptions = { date: 1, createdAt: 1 };
    } else if (sortBy === 'amount_high') {
      sortOptions = { amount: -1 };
    } else if (sortBy === 'amount_low') {
      sortOptions = { amount: 1 };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit, 10));

    const totalCount = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      totalCount,
      page: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / parseInt(limit, 10)),
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, date, paymentMethod, description, note } = req.body;

    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    const updates = {};
    if (type) updates.type = type;
    if (amount !== undefined) updates.amount = Number(amount);
    if (category) updates.category = category;
    if (date) updates.date = new Date(date);
    if (paymentMethod) updates.paymentMethod = paymentMethod;
    if (description !== undefined) updates.description = description;
    if (note !== undefined) updates.note = note;

    transaction = await Transaction.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
