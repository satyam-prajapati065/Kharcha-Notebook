package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val type: String, // "IN" for Cash In / Income, "OUT" for Cash Out / Expense
    val amount: Double,
    val category: String,
    val paymentMode: String, // "UPI", "Cash", "Bank", "Card"
    val note: String,
    val dateMillis: Long,
    val monthYear: String // e.g. "Sep 2026"
)
