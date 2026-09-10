package com.example.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.BudgetEntity
import com.example.data.KharchaRepository
import com.example.data.TransactionEntity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

data class BudgetProgress(
    val category: String,
    val limit: Double,
    val spent: Double,
    val remaining: Double,
    val percentage: Float,
    val isOverBudget: Boolean
)

data class CategorySpend(
    val category: String,
    val amount: Double,
    val percentage: Float
)

data class MonthSummary(
    val totalIn: Double,
    val totalOut: Double,
    val balance: Double,
    val savingsRate: Int
)

class KharchaViewModel(private val repository: KharchaRepository) : ViewModel() {

    private val calendar = Calendar.getInstance()
    private val monthFormat = SimpleDateFormat("MMM yyyy", Locale.getDefault())

    private val _currentMonthYear = MutableStateFlow(monthFormat.format(calendar.time))
    val currentMonthYear: StateFlow<String> = _currentMonthYear.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedFilter = MutableStateFlow("ALL") // "ALL", "IN", "OUT"
    val selectedFilter: StateFlow<String> = _selectedFilter.asStateFlow()

    init {
        viewModelScope.launch {
            repository.cleanupDuplicateBudgets()
            repository.seedInitialDataIfEmpty(_currentMonthYear.value)
            repository.cleanupDuplicateBudgets()
        }
    }

    // All transactions for the current month
    val monthlyTransactions: StateFlow<List<TransactionEntity>> =
        _currentMonthYear.combine(repository.getAllTransactions()) { month, all ->
            all.filter { it.monthYear == month }
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Filtered transactions for the ledger screen
    val filteredTransactions: StateFlow<List<TransactionEntity>> =
        combine(monthlyTransactions, _searchQuery, _selectedFilter) { list, query, filter ->
            list.filter { item ->
                val matchesFilter = when (filter) {
                    "IN" -> item.type == "IN"
                    "OUT" -> item.type == "OUT"
                    else -> true
                }
                val matchesQuery = if (query.isBlank()) true else {
                    item.category.contains(query, ignoreCase = true) ||
                    item.note.contains(query, ignoreCase = true) ||
                    item.paymentMode.contains(query, ignoreCase = true) ||
                    item.amount.toString().contains(query)
                }
                matchesFilter && matchesQuery
            }
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Month financial summary
    val monthSummary: StateFlow<MonthSummary> =
        monthlyTransactions.combine(MutableStateFlow(Unit)) { list, _ ->
            val totalIn = list.filter { it.type == "IN" }.sumOf { it.amount }
            val totalOut = list.filter { it.type == "OUT" }.sumOf { it.amount }
            val balance = totalIn - totalOut
            val savingsRate = if (totalIn > 0) {
                (((totalIn - totalOut) / totalIn) * 100).toInt().coerceIn(0, 100)
            } else 0
            MonthSummary(totalIn, totalOut, balance, savingsRate)
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), MonthSummary(0.0, 0.0, 0.0, 0))

    // Monthly category breakdown for expenses
    val expenseCategoryBreakdown: StateFlow<List<CategorySpend>> =
        monthlyTransactions.combine(MutableStateFlow(Unit)) { list, _ ->
            val expenses = list.filter { it.type == "OUT" }
            val totalOut = expenses.sumOf { it.amount }
            if (totalOut <= 0.0) emptyList()
            else {
                expenses.groupBy { it.category }
                    .map { (cat, items) ->
                        val sum = items.sumOf { it.amount }
                        val pct = ((sum / totalOut) * 100).toFloat()
                        CategorySpend(cat, sum, pct)
                    }
                    .sortedByDescending { it.amount }
            }
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    @OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
    val budgetsForMonth: StateFlow<List<BudgetEntity>> =
        _currentMonthYear.flatMapLatest { month ->
            repository.getBudgetsForMonth(month)
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val budgetProgress: StateFlow<List<BudgetProgress>> =
        combine(budgetsForMonth, monthlyTransactions) { budgets, transactions ->
            val expenseMap = transactions.filter { it.type == "OUT" }
                .groupBy { it.category }
                .mapValues { entry -> entry.value.sumOf { it.amount } }

            // Deduplicate categories so that multiple entries (e.g. Groceries, Rent) are merged into one
            val uniqueBudgets = budgets
                .groupBy { it.category.trim().lowercase(Locale.getDefault()) }
                .map { (_, group) -> group.maxByOrNull { it.id } ?: group.first() }

            uniqueBudgets.map { b ->
                val spent = expenseMap[b.category] ?: 0.0
                val remaining = b.monthlyLimit - spent
                val pct = if (b.monthlyLimit > 0) (spent / b.monthlyLimit).toFloat() else 0f
                BudgetProgress(
                    category = b.category,
                    limit = b.monthlyLimit,
                    spent = spent,
                    remaining = remaining,
                    percentage = pct,
                    isOverBudget = spent > b.monthlyLimit
                )
            }.sortedByDescending { it.spent }
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun nextMonth() {
        calendar.add(Calendar.MONTH, 1)
        _currentMonthYear.value = monthFormat.format(calendar.time)
    }

    fun previousMonth() {
        calendar.add(Calendar.MONTH, -1)
        _currentMonthYear.value = monthFormat.format(calendar.time)
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun setFilter(filter: String) {
        _selectedFilter.value = filter
    }

    fun addTransaction(
        type: String,
        amount: Double,
        category: String,
        paymentMode: String,
        note: String,
        dateMillis: Long = System.currentTimeMillis()
    ) {
        viewModelScope.launch {
            val itemMonthYear = monthFormat.format(Date(dateMillis))
            val transaction = TransactionEntity(
                type = type,
                amount = amount,
                category = category,
                paymentMode = paymentMode,
                note = note,
                dateMillis = dateMillis,
                monthYear = itemMonthYear
            )
            repository.insertTransaction(transaction)
        }
    }

    fun updateTransaction(transaction: TransactionEntity) {
        viewModelScope.launch {
            val updatedMonthYear = monthFormat.format(Date(transaction.dateMillis))
            repository.updateTransaction(transaction.copy(monthYear = updatedMonthYear))
        }
    }

    fun deleteTransaction(id: Long) {
        viewModelScope.launch {
            repository.deleteTransactionById(id)
        }
    }

    fun setBudget(category: String, limit: Double) {
        viewModelScope.launch {
            val currentMonth = _currentMonthYear.value
            val existing = repository.getBudgetByCategoryAndMonth(category, currentMonth)
            if (existing != null) {
                repository.insertBudget(
                    existing.copy(monthlyLimit = limit)
                )
            } else {
                repository.insertBudget(
                    BudgetEntity(
                        category = category,
                        monthlyLimit = limit,
                        monthYear = currentMonth
                    )
                )
            }
        }
    }

    fun deleteBudget(id: Long) {
        viewModelScope.launch {
            repository.deleteBudgetById(id)
        }
    }
}

class KharchaViewModelFactory(private val repository: KharchaRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(KharchaViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return KharchaViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
