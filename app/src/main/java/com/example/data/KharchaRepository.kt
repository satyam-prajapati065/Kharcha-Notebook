package com.example.data

import kotlinx.coroutines.flow.Flow
import java.util.Calendar

class KharchaRepository(
    private val transactionDao: TransactionDao,
    private val budgetDao: BudgetDao,
    private val categoryDao: CategoryDao
) {
    fun getAllTransactions(): Flow<List<TransactionEntity>> = transactionDao.getAllTransactions()

    suspend fun getAllTransactionsList(): List<TransactionEntity> = transactionDao.getAllTransactionsList()

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

    // Category methods
    fun getAllCategories(): Flow<List<CategoryEntity>> = categoryDao.getAllCategories()

    fun getCategoriesByType(type: String): Flow<List<CategoryEntity>> = categoryDao.getCategoriesByType(type)

    suspend fun getCategoriesByTypeList(type: String): List<CategoryEntity> = categoryDao.getCategoriesByTypeList(type)

    suspend fun insertCategory(category: CategoryEntity): Long = categoryDao.insertCategory(category)

    suspend fun deleteCustomCategoryById(id: Long) = categoryDao.deleteCustomCategoryById(id)

    suspend fun findCategoryByNameAndType(name: String, type: String): CategoryEntity? =
        categoryDao.findByNameAndType(name, type)

    suspend fun seedDefaultCategoriesIfEmpty() {
        if (categoryDao.getCount() == 0) {
            val defaults = listOf(
                // Default Expenses (isCustom = false)
                CategoryEntity(name = "Food & Dining", type = "EXPENSE", iconName = "Restaurant", colorHex = "#F97316", isCustom = false),
                CategoryEntity(name = "Groceries", type = "EXPENSE", iconName = "ShoppingBasket", colorHex = "#14B8A6", isCustom = false),
                CategoryEntity(name = "Rent", type = "EXPENSE", iconName = "Home", colorHex = "#8B5CF6", isCustom = false),
                CategoryEntity(name = "Bills & Utilities", type = "EXPENSE", iconName = "ReceiptLong", colorHex = "#EAB308", isCustom = false),
                CategoryEntity(name = "Shopping", type = "EXPENSE", iconName = "ShoppingCart", colorHex = "#EC4899", isCustom = false),
                CategoryEntity(name = "Transport", type = "EXPENSE", iconName = "DirectionsCar", colorHex = "#3B82F6", isCustom = false),
                CategoryEntity(name = "Health", type = "EXPENSE", iconName = "LocalHospital", colorHex = "#EF4444", isCustom = false),
                CategoryEntity(name = "Entertainment", type = "EXPENSE", iconName = "Theaters", colorHex = "#A855F7", isCustom = false),
                CategoryEntity(name = "Education", type = "EXPENSE", iconName = "School", colorHex = "#6366F1", isCustom = false),
                CategoryEntity(name = "Other Expense", type = "EXPENSE", iconName = "Category", colorHex = "#64748B", isCustom = false),

                // Default Income (isCustom = false)
                CategoryEntity(name = "Salary", type = "INCOME", iconName = "Work", colorHex = "#10B981", isCustom = false),
                CategoryEntity(name = "Freelance", type = "INCOME", iconName = "Laptop", colorHex = "#06B6D4", isCustom = false),
                CategoryEntity(name = "Business", type = "INCOME", iconName = "ShoppingBag", colorHex = "#3B82F6", isCustom = false),
                CategoryEntity(name = "Investments", type = "INCOME", iconName = "TrendingUp", colorHex = "#059669", isCustom = false),
                CategoryEntity(name = "Gifts", type = "INCOME", iconName = "CardGiftcard", colorHex = "#EC4899", isCustom = false),
                CategoryEntity(name = "Other Income", type = "INCOME", iconName = "Category", colorHex = "#64748B", isCustom = false)
            )
            categoryDao.insertCategories(defaults)
        }
    }

    suspend fun seedInitialDataIfEmpty(currentMonthYear: String) {
        // No-op: Do not seed initial dummy data for a fresh installation.
    }
}
