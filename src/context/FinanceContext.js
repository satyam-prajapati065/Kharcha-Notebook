import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { AuthContext } from './AuthContext';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [dashboardData, setDashboardData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    savings: 0,
    savingsRate: 0,
    incomeByCategory: [],
    expenseByCategory: [],
    recentTransactions: [],
    insights: [],
  });

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fetch data when authentication, month or year changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, selectedMonth, selectedYear]);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Monthly Dashboard
      const dashRes = await api.getMonthlyDashboard(selectedMonth, selectedYear);
      if (dashRes.data && dashRes.data.success) {
        setDashboardData(dashRes.data);
        await AsyncStorage.setItem(
          `@cached_dash_${selectedYear}_${selectedMonth}`,
          JSON.stringify(dashRes.data)
        );
      }

      // 2. Fetch Month Transactions
      const txRes = await api.getTransactions({
        month: selectedMonth,
        year: selectedYear,
        limit: 100,
      });
      if (txRes.data && txRes.data.success) {
        setTransactions(txRes.data.transactions);
      }

      // 3. Fetch Budgets
      const bRes = await api.getBudgets(selectedMonth, selectedYear);
      if (bRes.data && bRes.data.success) {
        setBudgets(bRes.data.budgets);
      }
    } catch (err) {
      console.warn('Network fetch error, loading from local cache:', err.message);
      setError(err.message);
      // Try loading cached dashboard data if offline
      const cached = await AsyncStorage.getItem(`@cached_dash_${selectedYear}_${selectedMonth}`);
      if (cached) {
        setDashboardData(JSON.parse(cached));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const addTransaction = async (txData) => {
    const res = await api.createTransaction(txData);
    await fetchAllData();
    return res.data;
  };

  const updateTransaction = async (id, txData) => {
    const res = await api.updateTransaction(id, txData);
    await fetchAllData();
    return res.data;
  };

  const deleteTransaction = async (id) => {
    const res = await api.deleteTransaction(id);
    await fetchAllData();
    return res.data;
  };

  const saveBudget = async (category, amount) => {
    const res = await api.setBudget({
      category,
      amount: Number(amount),
      month: selectedMonth,
      year: selectedYear,
    });
    await fetchAllData();
    return res.data;
  };

  const deleteBudget = async (id) => {
    const res = await api.deleteBudget(id);
    await fetchAllData();
    return res.data;
  };

  return (
    <FinanceContext.Provider
      value={{
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        nextMonth,
        prevMonth,
        dashboardData,
        transactions,
        budgets,
        isLoading,
        error,
        refresh: fetchAllData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        saveBudget,
        deleteBudget,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};
