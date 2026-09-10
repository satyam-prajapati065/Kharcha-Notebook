package com.example.data

import kotlinx.coroutines.flow.Flow
import java.util.Calendar

class KharchaRepository(
    private val transactionDao: TransactionDao,
    private val budgetDao: BudgetDao
) {
    fun getAllTransactions(): Flow<List<TransactionEntity>> = transactionDao.getAllTransactions()

    fun getTransactionsByMonth(monthYear: String): Flow<List<TransactionEntity>> =
        transactionDao.getTransactionsByMonth(monthYear)

    suspend fun insertTransaction(transaction: TransactionEntity) =
        transactionDao.insertTransaction(transaction)

    suspend fun updateTransaction(transaction: TransactionEntity) =
        transactionDao.updateTransaction(transaction)

    suspend fun deleteTransactionById(id: Long) =
        transactionDao.deleteById(id)

    fun getBudgetsForMonth(monthYear: String): Flow<List<BudgetEntity>> =
        budgetDao.getBudgetsForMonth(monthYear)

    suspend fun getBudgetByCategoryAndMonth(category: String, monthYear: String): BudgetEntity? =
        budgetDao.getBudgetByCategoryAndMonth(category, monthYear)

    suspend fun insertBudget(budget: BudgetEntity) {
        val existing = budgetDao.getBudgetByCategoryAndMonth(budget.category, budget.monthYear)
        if (existing != null) {
            budgetDao.insertBudget(existing.copy(monthlyLimit = budget.monthlyLimit))
        } else {
            budgetDao.insertBudget(budget)
        }
        cleanupDuplicateBudgets()
    }

    suspend fun cleanupDuplicateBudgets() {
        try {
            budgetDao.deleteDuplicateBudgets()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun deleteBudgetById(id: Long) =
        budgetDao.deleteBudgetById(id)

    suspend fun seedInitialDataIfEmpty(currentMonthYear: String) {
        // No-op: Do not seed initial dummy data for a fresh installation.
    }
}
