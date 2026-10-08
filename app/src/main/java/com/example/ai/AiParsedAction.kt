package com.example.ai

data class AiParsedAction(
    val action: String = "TRANSACTION", // "TRANSACTION" or "SET_BUDGET"
    val type: String = "OUT",          // "IN" (Cash In) or "OUT" (Cash Out)
    val amount: Double = 0.0,
    val category: String = "Other Expense",
    val paymentMode: String = "UPI",
    val note: String = "",
    val spokenFeedback: String = ""
)
