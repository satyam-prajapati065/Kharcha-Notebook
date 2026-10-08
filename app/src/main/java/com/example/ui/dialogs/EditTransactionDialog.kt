package com.example.ui.dialogs

import android.app.DatePickerDialog
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.CategoryEntity
import com.example.data.TransactionEntity
import com.example.ui.components.CategoryIconHelper
import com.example.ui.components.getCategoryColor
import com.example.ui.components.getCategoryIcon
import com.example.ui.theme.CashInGreen
import com.example.ui.theme.CashInGreenBg
import com.example.ui.theme.CashOutRed
import com.example.ui.theme.CashOutRedBg
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun EditTransactionDialog(
    transaction: TransactionEntity,
    availableExpenseCategories: List<String> = emptyList(),
    availableIncomeCategories: List<String> = emptyList(),
    availableExpenseCategoryEntities: List<CategoryEntity> = emptyList(),
    availableIncomeCategoryEntities: List<CategoryEntity> = emptyList(),
    onAddCustomCategory: ((name: String, type: String, iconName: String, colorHex: String, onResult: (Boolean, String?) -> Unit) -> Unit)? = null,
    onDismiss: () -> Unit,
    onSave: (TransactionEntity) -> Unit
) {
    val context = LocalContext.current
    var type by remember { mutableStateOf(transaction.type) }
    var amountText by remember { mutableStateOf(transaction.amount.toString()) }
    var noteText by remember { mutableStateOf(transaction.note) }
    var selectedDateMillis by remember { mutableLongStateOf(transaction.dateMillis) }
    var showAddCategoryModal by remember { mutableStateOf(false) }

    val defaultInCategories = remember {
        listOf(
            TransactionCategoryUiItem("Salary", "Work", "#10B981", false),
            TransactionCategoryUiItem("Freelance", "Laptop", "#06B6D4", false),
            TransactionCategoryUiItem("Business", "ShoppingBag", "#3B82F6", false),
            TransactionCategoryUiItem("Investments", "TrendingUp", "#059669", false),
            TransactionCategoryUiItem("Gifts", "CardGiftcard", "#EC4899", false),
            TransactionCategoryUiItem("Other Income", "Category", "#64748B", false)
        )
    }

    val defaultOutCategories = remember {
        listOf(
            TransactionCategoryUiItem("Food & Dining", "Restaurant", "#F97316", false),
            TransactionCategoryUiItem("Groceries", "ShoppingBasket", "#14B8A6", false),
            TransactionCategoryUiItem("Rent", "Home", "#8B5CF6", false),
            TransactionCategoryUiItem("Bills & Utilities", "ReceiptLong", "#EAB308", false),
            TransactionCategoryUiItem("Shopping", "ShoppingCart", "#EC4899", false),
            TransactionCategoryUiItem("Transport", "DirectionsCar", "#3B82F6", false),
            TransactionCategoryUiItem("Health", "LocalHospital", "#EF4444", false),
            TransactionCategoryUiItem("Entertainment", "Theaters", "#A855F7", false),
            TransactionCategoryUiItem("Education", "School", "#6366F1", false),
            TransactionCategoryUiItem("Other Expense", "Category", "#64748B", false)
        )
    }

    val inCategories = remember(availableIncomeCategoryEntities, availableIncomeCategories) {
        if (availableIncomeCategoryEntities.isNotEmpty()) {
            availableIncomeCategoryEntities.map {
                TransactionCategoryUiItem(it.name, it.iconName, it.colorHex, it.isCustom)
            }
        } else if (availableIncomeCategories.isNotEmpty()) {
            availableIncomeCategories.map {
                TransactionCategoryUiItem(it, null, null, false)
            }
        } else {
            defaultInCategories
        }
    }

    val outCategories = remember(availableExpenseCategoryEntities, availableExpenseCategories) {
        if (availableExpenseCategoryEntities.isNotEmpty()) {
            availableExpenseCategoryEntities.map {
                TransactionCategoryUiItem(it.name, it.iconName, it.colorHex, it.isCustom)
            }
        } else if (availableExpenseCategories.isNotEmpty()) {
            availableExpenseCategories.map {
                TransactionCategoryUiItem(it, null, null, false)
            }
        } else {
            defaultOutCategories
        }
    }

    val currentCategories = if (type == "IN") inCategories else outCategories
    var selectedCategory by remember(type, currentCategories) {
        val initial = if (transaction.type == type) transaction.category else currentCategories.firstOrNull()?.name ?: "Other Expense"
        mutableStateOf(if (currentCategories.any { it.name == initial }) initial else (currentCategories.firstOrNull()?.name ?: "Other Expense"))
    }
    val paymentModes = listOf("UPI", "Cash", "Bank", "Card")
    var selectedPaymentMode by remember { mutableStateOf(transaction.paymentMode) }

    val dateFormatter = remember { SimpleDateFormat("EEE, dd MMM yyyy", Locale.getDefault()) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Edit Transaction",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        ),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Type Toggle (Cash In vs Cash Out)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (type == "IN") CashInGreen else Color.Transparent)
                            .clickable {
                                type = "IN"
                                selectedCategory = inCategories.firstOrNull()?.name ?: "Salary"
                            }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = null,
                                tint = if (type == "IN") Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Cash In (+)",
                                fontWeight = FontWeight.Bold,
                                color = if (type == "IN") Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 14.sp
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (type == "OUT") CashOutRed else Color.Transparent)
                            .clickable {
                                type = "OUT"
                                selectedCategory = outCategories.firstOrNull()?.name ?: "Food & Dining"
                            }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Remove,
                                contentDescription = null,
                                tint = if (type == "OUT") Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Cash Out (-)",
                                fontWeight = FontWeight.Bold,
                                color = if (type == "OUT") Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 14.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Amount Field
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it },
                    label = { Text("Amount (₹)") },
                    placeholder = { Text("0.00") },
                    leadingIcon = {
                        Text(
                            text = "₹",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = if (type == "IN") CashInGreen else CashOutRed,
                            modifier = Modifier.padding(start = 12.dp)
                        )
                    },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("edit_amount_input")
                )

                // Quick Amount Chips
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("100", "500", "1000", "2000").forEach { quickAmount ->
                        val isSelected = amountText.trim() == quickAmount
                        val activeBorder = if (type == "IN") CashInGreen else CashOutRed
                        val activeBg = if (type == "IN") CashInGreenBg else CashOutRedBg

                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isSelected) activeBg else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            border = if (isSelected) BorderStroke(1.5.dp, activeBorder) else BorderStroke(1.dp, Color.Transparent),
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .clickable {
                                    amountText = if (amountText.trim() == quickAmount) "" else quickAmount
                                }
                                .testTag("edit_quick_amount_$quickAmount")
                        ) {
                            Text(
                                text = "₹$quickAmount",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold
                                ),
                                modifier = Modifier.padding(vertical = 8.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                color = if (isSelected) activeBorder else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Category Selection Header
                Text(
                    text = if (type == "IN") "Select Income Category" else "Select Expense Category",
                    style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(8.dp))

                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    currentCategories.forEach { catItem ->
                        val isSelected = selectedCategory == catItem.name
                        val activeBg = if (type == "IN") CashInGreenBg else CashOutRedBg
                        val activeBorder = if (type == "IN") CashInGreen else CashOutRed
                        val icon = getCategoryIcon(catItem.name, catItem.iconName)
                        val customColor = catItem.colorHex?.let { CategoryIconHelper.parseColor(it) } ?: getCategoryColor(catItem.name)

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) activeBg else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                            border = if (isSelected) BorderStroke(1.5.dp, activeBorder) else if (catItem.isCustom) BorderStroke(1.dp, customColor.copy(alpha = 0.5f)) else null,
                            modifier = Modifier.clickable { selectedCategory = catItem.name }
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .clip(CircleShape)
                                        .background(if (catItem.isCustom) customColor.copy(alpha = 0.15f) else Color.Transparent),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = icon,
                                        contentDescription = null,
                                        tint = if (isSelected) activeBorder else if (catItem.isCustom) customColor else MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = catItem.name,
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                    ),
                                    color = if (isSelected) activeBorder else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }

                    // Direct Inline "+ Add Category" Chip
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = (if (type == "IN") CashInGreen else CashOutRed).copy(alpha = 0.08f),
                        border = BorderStroke(1.dp, (if (type == "IN") CashInGreen else CashOutRed).copy(alpha = 0.4f)),
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .clickable { showAddCategoryModal = true }
                            .testTag("edit_add_category_flow_chip")
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AddCircle,
                                contentDescription = "Add Category",
                                tint = if (type == "IN") CashInGreen else CashOutRed,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "+ Add Category",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontWeight = FontWeight.Bold
                                ),
                                color = if (type == "IN") CashInGreen else CashOutRed
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Payment Mode Selection
                Text(
                    text = "Payment Mode",
                    style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    paymentModes.forEach { mode ->
                        val isSelected = selectedPaymentMode == mode
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { selectedPaymentMode = mode }
                        ) {
                            Text(
                                text = mode,
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(vertical = 8.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Calendar Date Picker Field
                Text(
                    text = "Transaction Date",
                    style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(8.dp))

                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            val cal = Calendar.getInstance().apply { timeInMillis = selectedDateMillis }
                            DatePickerDialog(
                                context,
                                { _, year, month, dayOfMonth ->
                                    val newCal = Calendar.getInstance().apply {
                                        set(Calendar.YEAR, year)
                                        set(Calendar.MONTH, month)
                                        set(Calendar.DAY_OF_MONTH, dayOfMonth)
                                    }
                                    selectedDateMillis = newCal.timeInMillis
                                },
                                cal.get(Calendar.YEAR),
                                cal.get(Calendar.MONTH),
                                cal.get(Calendar.DAY_OF_MONTH)
                            ).show()
                        }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.CalendarToday,
                                contentDescription = "Pick Date",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = dateFormatter.format(Date(selectedDateMillis)),
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                        Text(
                            text = "Change",
                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Note / Description Field
                OutlinedTextField(
                    value = noteText,
                    onValueChange = { noteText = it },
                    label = { Text("Note / Description") },
                    placeholder = { Text("e.g. Dinner, Client Payment, Recharge...") },
                    shape = RoundedCornerShape(14.dp),
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("edit_note_input")
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Save Changes Button
                val isValid = (amountText.toDoubleOrNull() ?: 0.0) > 0.0
                Button(
                    onClick = {
                        val amount = amountText.toDoubleOrNull() ?: 0.0
                        if (amount > 0) {
                            val categoryToSave = if (selectedCategory.isNotBlank()) selectedCategory else (currentCategories.firstOrNull()?.name ?: "Other Expense")
                            val updated = transaction.copy(
                                type = type,
                                amount = amount,
                                category = categoryToSave,
                                paymentMode = selectedPaymentMode,
                                note = noteText.trim(),
                                dateMillis = selectedDateMillis
                            )
                            onSave(updated)
                            onDismiss()
                        }
                    },
                    enabled = isValid,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (type == "IN") CashInGreen else CashOutRed
                    ),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                        .testTag("save_edit_transaction_button")
                ) {
                    Text(
                        text = "Save Changes",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                }
            }
        }
    }

    if (showAddCategoryModal) {
        AddCategoryDialog(
            initialType = if (type == "IN") "INCOME" else "EXPENSE",
            onDismiss = { showAddCategoryModal = false },
            onSave = { catName, catType, iconName, colorHex ->
                if (onAddCustomCategory != null) {
                    onAddCustomCategory(catName, catType, iconName, colorHex) { success, errorMsg ->
                        if (success) {
                            selectedCategory = catName
                            showAddCategoryModal = false
                            Toast.makeText(context, "Added '$catName' to ${if (catType == "INCOME") "Income" else "Expense"} categories!", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(context, errorMsg ?: "Could not add category", Toast.LENGTH_LONG).show()
                        }
                    }
                } else {
                    selectedCategory = catName
                    showAddCategoryModal = false
                }
            }
        )
    }
}
