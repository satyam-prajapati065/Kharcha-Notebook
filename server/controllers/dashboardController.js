const Transaction = require('../models/Transaction');

// @desc    Get monthly dashboard statistics
// @route   GET /api/dashboard/monthly
// @access  Private
const getMonthlyDashboard = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const m = month - 1;
    const startOfMonth = new Date(Date.UTC(year, m, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, m + 1, 0, 23, 59, 59, 999));

    // Previous month range for insight calculation
    const prevMonthDate = new Date(Date.UTC(year, m - 1, 1, 0, 0, 0));
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();
    const startOfPrevMonth = new Date(Date.UTC(prevYear, prevMonth, 1, 0, 0, 0));
    const endOfPrevMonth = new Date(Date.UTC(prevYear, prevMonth + 1, 0, 23, 59, 59, 999));

    // Get current month transactions
    const currentTransactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ date: -1, createdAt: -1 });

    // Previous month transactions for comparative insights
    const prevTransactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const incomeMap = {};
    const expenseMap = {};

    currentTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        incomeMap[tx.category] = (incomeMap[tx.category] || 0) + tx.amount;
      } else if (tx.type === 'expense') {
        totalExpense += tx.amount;
        expenseMap[tx.category] = (expenseMap[tx.category] || 0) + tx.amount;
      }
    });

    const balance = totalIncome - totalExpense;
    const savings = balance;
    const savingsRate = totalIncome > 0
      ? Math.max(0, parseFloat((((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)))
      : 0;

    // Convert category maps to arrays
    const incomeByCategory = Object.keys(incomeMap).map((cat) => ({
      category: cat,
      amount: incomeMap[cat],
      percentage: totalIncome > 0 ? parseFloat(((incomeMap[cat] / totalIncome) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.amount - a.amount);

    const expenseByCategory = Object.keys(expenseMap).map((cat) => ({
      category: cat,
      amount: expenseMap[cat],
      percentage: totalExpense > 0 ? parseFloat(((expenseMap[cat] / totalExpense) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.amount - a.amount);

    // Dynamic Financial Insights based on real data
    const insights = [];
    if (expenseByCategory.length > 0) {
      insights.push(`Your highest spending category is ${expenseByCategory[0].category} (₹${expenseByCategory[0].amount.toLocaleString('en-IN')}).`);
    }

    if (totalIncome > 0 && savings > 0) {
      insights.push(`You saved ${savingsRate}% of your total earnings this month.`);
    } else if (totalIncome > 0 && balance < 0) {
      insights.push(`Warning: Your expenses exceeded your cash flow by ₹${Math.abs(balance).toLocaleString('en-IN')}.`);
    }

    // Compare with previous month
    let prevTotalExpense = 0;
    const prevExpenseMap = {};
    prevTransactions.forEach((tx) => {
      if (tx.type === 'expense') {
        prevTotalExpense += tx.amount;
        prevExpenseMap[tx.category] = (prevExpenseMap[tx.category] || 0) + tx.amount;
      }
    });

    if (prevTotalExpense > 0 && totalExpense > 0) {
      const diff = totalExpense - prevTotalExpense;
      const pct = Math.abs(Math.round((diff / prevTotalExpense) * 100));
      if (diff > 0) {
        insights.push(`Overall spending is up ${pct}% compared to last month.`);
      } else if (diff < 0) {
        insights.push(`Great job! You cut spending by ${pct}% compared to last month.`);
      }
    }

    // Top category diff
    if (expenseByCategory.length > 0) {
      const topCat = expenseByCategory[0].category;
      const prevTopAmount = prevExpenseMap[topCat] || 0;
      const currTopAmount = expenseMap[topCat] || 0;
      if (prevTopAmount > 0 && currTopAmount !== prevTopAmount) {
        const catDiff = currTopAmount - prevTopAmount;
        if (catDiff > 0) {
          insights.push(`You spent ₹${catDiff.toLocaleString('en-IN')} more on ${topCat} than last month.`);
        } else {
          insights.push(`You saved ₹${Math.abs(catDiff).toLocaleString('en-IN')} on ${topCat} compared to last month.`);
        }
      }
    }

    if (insights.length === 0) {
      insights.push('Track all Cash In and Cash Out daily to see accurate financial trends.');
    }

    // Recent 5 transactions
    const recentTransactions = currentTransactions.slice(0, 5);

    res.status(200).json({
      success: true,
      month,
      year,
      totalIncome,
      totalExpense,
      balance,
      savings,
      savingsRate,
      incomeByCategory,
      expenseByCategory,
      recentTransactions,
      insights,
      transactionCount: currentTransactions.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get yearly financial summary
// @route   GET /api/dashboard/yearly
// @access  Private
const getYearlySummary = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startOfYear, $lte: endOfYear },
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i + 1,
      month: monthNames[i],
      income: 0,
      expense: 0,
      savings: 0,
    }));

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      const txMonth = new Date(tx.date).getUTCMonth();
      if (tx.type === 'income') {
        monthlyData[txMonth].income += tx.amount;
        totalIncome += tx.amount;
      } else if (tx.type === 'expense') {
        monthlyData[txMonth].expense += tx.amount;
        totalExpense += tx.amount;
      }
    });

    monthlyData.forEach((m) => {
      m.savings = m.income - m.expense;
    });

    const totalSavings = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      year,
      totalIncome,
      totalExpense,
      totalSavings,
      monthlyData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily summary for calendar view
// @route   GET /api/dashboard/calendar
// @access  Private
const getCalendarSummary = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const m = month - 1;
    const startOfMonth = new Date(Date.UTC(year, m, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, m + 1, 0, 23, 59, 59, 999));

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ date: 1 });

    const dailyMap = {};

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const dayKey = d.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = {
          date: dayKey,
          day: d.getUTCDate(),
          cashIn: 0,
          cashOut: 0,
          net: 0,
          transactions: [],
        };
      }

      if (tx.type === 'income') {
        dailyMap[dayKey].cashIn += tx.amount;
      } else {
        dailyMap[dayKey].cashOut += tx.amount;
      }
      dailyMap[dayKey].net = dailyMap[dayKey].cashIn - dailyMap[dayKey].cashOut;
      dailyMap[dayKey].transactions.push(tx);
    });

    res.status(200).json({
      success: true,
      month,
      year,
      dailySummary: Object.values(dailyMap),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyDashboard,
  getYearlySummary,
  getCalendarSummary,
};
