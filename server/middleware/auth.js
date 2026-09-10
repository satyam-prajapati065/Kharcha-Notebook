// Auth is completely bypassed for local-first personal expense tracker
const mongoose = require('mongoose');

const DEFAULT_USER_ID = new mongoose.Types.ObjectId('650000000000000000000001');

const protect = async (req, res, next) => {
  req.user = {
    _id: DEFAULT_USER_ID,
    id: DEFAULT_USER_ID.toString(),
    name: 'Satyam Prajapati',
    email: 'local@kharcha.notebook',
  };
  next();
};

module.exports = { protect };
