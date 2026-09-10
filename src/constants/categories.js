export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salary', icon: '💼', color: '#10B981' },
  { id: 'freelancing', name: 'Freelancing', icon: '💻', color: '#06B6D4' },
  { id: 'business', name: 'Business', icon: '🏢', color: '#3B82F6' },
  { id: 'bonus', name: 'Bonus', icon: '🎁', color: '#F59E0B' },
  { id: 'investment', name: 'Investment', icon: '📈', color: '#8B5CF6' },
  { id: 'gift', name: 'Gift', icon: '🎉', color: '#EC4899' },
  { id: 'refund', name: 'Refund', icon: '🔄', color: '#14B8A6' },
  { id: 'other_in', name: 'Other', icon: '💰', color: '#6B7280' },
];

export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food', icon: '🍔', color: '#EF4444' },
  { id: 'rent', name: 'Rent', icon: '🏠', color: '#F97316' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#06B6D4' },
  { id: 'bills', name: 'Bills', icon: '🧾', color: '#8B5CF6' },
  { id: 'electricity', name: 'Electricity', icon: '⚡', color: '#EAB308' },
  { id: 'water', name: 'Water', icon: '💧', color: '#3B82F6' },
  { id: 'internet', name: 'Internet', icon: '🌐', color: '#6366F1' },
  { id: 'mobile', name: 'Mobile Recharge', icon: '📱', color: '#14B8A6' },
  { id: 'education', name: 'Education', icon: '📚', color: '#84CC16' },
  { id: 'medical', name: 'Medical', icon: '🏥', color: '#F43F5E' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#A855F7' },
  { id: 'emi', name: 'EMI', icon: '💳', color: '#D97706' },
  { id: 'grocery', name: 'Grocery', icon: '🛒', color: '#10B981' },
  { id: 'fuel', name: 'Fuel', icon: '⛽', color: '#FB923C' },
  { id: 'other_out', name: 'Other', icon: '💸', color: '#9CA3AF' },
];

export const PAYMENT_METHODS = [
  { id: 'Cash', name: 'Cash', icon: '💵' },
  { id: 'Bank', name: 'Bank Transfer', icon: '🏦' },
  { id: 'UPI', name: 'UPI', icon: '⚡' },
  { id: 'Card', name: 'Credit/Debit Card', icon: '💳' },
  { id: 'Other', name: 'Other', icon: '📌' },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const formatINR = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};
