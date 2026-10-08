package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.TransactionEntity
import com.example.ui.BudgetProgress
import com.example.ui.MonthSummary
import com.example.ui.components.MonthSelector
import com.example.ui.components.TransactionRowItem
import com.example.ui.components.UserProfileAvatar
import com.example.ui.components.formatInr
import com.example.ui.theme.CashInGreen
import com.example.ui.theme.CashInGreenBg
import com.example.ui.theme.CashOutRed
import com.example.ui.theme.CashOutRedBg
import com.example.ui.theme.WarningOrange

@Composable
fun HomeScreen(
    currentMonth: String,
    summary: MonthSummary,
    transactions: List<TransactionEntity>,
    budgets: List<BudgetProgress>,
    userName: String = "",
    userPhotoPath: String = "",
    onPreviousMonth: () -> Unit,
    onNextMonth: () -> Unit,
    onAddCashIn: () -> Unit,
    onAddCashOut: () -> Unit,
    onSeeAllTransactions: () -> Unit,
    onTransactionClick: (TransactionEntity) -> Unit,
    onOpenProfile: () -> Unit = {},
    onOpenBudgets: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Spacing & Header
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Kharcha Notebook",
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 24.sp
                        ),
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        text = "Hello, $userName 👋",
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                // Profile Avatar (Clickable to open settings)
                UserProfileAvatar(
                    photoPath = userPhotoPath,
                    name = userName,
                    size = 46.dp,
                    modifier = Modifier
                        .clickable { onOpenProfile() }
                        .testTag("profile_avatar_button")
                )
            }
        }

        // Month Selector
        item {
            MonthSelector(
                currentMonth = currentMonth,
                onPrevious = onPreviousMonth,
                onNext = onNextMonth
            )
        }

        // Hero Total Balance Card
        item {
            HeroBalanceCard(summary = summary)
        }

        // Cash In & Cash Out Summary Cards
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Cash In Card
                SummaryMetricCard(
                    title = "Cash In (Income)",
                    amount = summary.totalIn,
                    isPositive = true,
                    modifier = Modifier.weight(1f)
                )

                // Cash Out Card
                SummaryMetricCard(
                    title = "Cash Out (Spent)",
                    amount = summary.totalOut,
                    isPositive = false,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Quick Action Buttons (Cash In & Cash Out)
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = onAddCashIn,
                    colors = ButtonDefaults.buttonColors(containerColor = CashInGreen),
                    shape = RoundedCornerShape(16.dp),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp, pressedElevation = 4.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp)
                        .testTag("home_add_cash_in_btn")
                ) {
                    Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Cash In", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }

                Button(
                    onClick = onAddCashOut,
                    colors = ButtonDefaults.buttonColors(containerColor = CashOutRed),
                    shape = RoundedCornerShape(16.dp),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp, pressedElevation = 4.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp)
                        .testTag("home_add_cash_out_btn")
                ) {
                    Icon(imageVector = Icons.Default.Remove, contentDescription = null, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Cash Out", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }
        }

        // Budget Alerts (if any)
        val overBudgetItems = budgets.filter { it.isOverBudget }
        if (overBudgetItems.isNotEmpty()) {
            item {
                BudgetExceededAlertBanner(
                    overBudgetItems = overBudgetItems,
                    onClick = onOpenBudgets
                )
            }
        }

        // Recent Activity Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Activity",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    ),
                    color = MaterialTheme.colorScheme.onBackground
                )

                if (transactions.isNotEmpty()) {
                    TextButton(onClick = onSeeAllTransactions) {
                        Text(
                            text = "View All (${transactions.size})",
                            style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
        }

        // Recent Transactions List (first 5)
        if (transactions.isEmpty()) {
            item {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 24.dp),
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "📝", fontSize = 42.sp)
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "No transactions in $currentMonth",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Tap + Cash In or - Cash Out to log your first entry!",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        } else {
            items(transactions.take(5)) { item ->
                TransactionRowItem(
                    transaction = item,
                    onClick = { onTransactionClick(item) }
                )
            }
        }

        // Bottom spacer for navigation bar
        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

@Composable
fun HeroBalanceCard(summary: MonthSummary, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.linearGradient(
                        colors = listOf(
                            Color(0xFF0F766E),
                            Color(0xFF115E59),
                            Color(0xFF134E4A)
                        )
                    )
                )
                .padding(20.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Net Balance (Savings)",
                        style = MaterialTheme.typography.labelLarge.copy(
                            fontWeight = FontWeight.Medium,
                            fontSize = 14.sp
                        ),
                        color = Color(0xFFCCFBF1)
                    )

                    // Savings Rate Badge
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = Color.White.copy(alpha = 0.2f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Savings,
                                contentDescription = null,
                                tint = Color(0xFF5EEAD4),
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${summary.savingsRate}% Saved",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp
                                ),
                                color = Color.White
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = formatInr(summary.balance),
                    style = MaterialTheme.typography.headlineLarge.copy(
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 36.sp,
                        letterSpacing = (-0.5).sp
                    ),
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Mini balance status bar
                val inAmt = summary.totalIn.coerceAtLeast(0.0)
                val outAmt = summary.totalOut.coerceAtLeast(0.0)
                val totalFlow = (inAmt + outAmt).coerceAtLeast(1.0)
                val inFraction = (inAmt / totalFlow).toFloat().coerceIn(0f, 1f)

                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Cash Flow Health",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color(0xFFA7F3D0)
                        )
                        Text(
                            text = if (summary.balance >= 0) "Surplus" else "Deficit",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = if (summary.balance >= 0) Color(0xFF34D399) else Color(0xFFFCA5A5)
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.25f))
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(inFraction)
                                .height(6.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF34D399))
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SummaryMetricCard(
    title: String,
    amount: Double,
    isPositive: Boolean,
    modifier: Modifier = Modifier
) {
    val bgColor = if (isPositive) CashInGreenBg else CashOutRedBg
    val iconColor = if (isPositive) CashInGreen else CashOutRed
    val icon = if (isPositive) Icons.Default.ArrowDownward else Icons.Default.ArrowUpward
    val prefix = if (isPositive) "+" else "-"

    Card(
        modifier = modifier,
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(bgColor),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = title,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = "$prefix${formatInr(amount)}",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                ),
                color = iconColor
            )
        }
    }
}

@Composable
fun BudgetExceededAlertBanner(
    overBudgetItems: List<BudgetProgress>,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (overBudgetItems.isEmpty()) return
    val firstItem = overBudgetItems.first()
    val isDark = isSystemInDarkTheme()
    val overAmount = (firstItem.spent - firstItem.limit).coerceAtLeast(0.0)

    val containerBg = if (isDark) Color(0xFF2C1316) else Color(0xFFFFF1F2)
    val borderColor = if (isDark) Color(0xFF4C1D24) else Color(0xFFFECDD3)
    val titleColor = if (isDark) Color(0xFFFECDD3) else Color(0xFF9F1239)
    val subtitleColor = if (isDark) Color(0xFFFDA4AF) else Color(0xFFBE123C)
    val badgeBg = if (isDark) Color(0xFF451A1D) else Color(0xFFFEE2E2)
    val badgeTextColor = if (isDark) Color(0xFFFCA5A5) else Color(0xFFB91C1C)

    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = containerBg),
        border = BorderStroke(1.dp, borderColor),
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .testTag("home_budget_exceeded_alert")
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(CircleShape)
                        .background(badgeBg),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = "Alert",
                        tint = CashOutRed,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "Budget Exceeded in ${firstItem.category}!",
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            ),
                            color = titleColor,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f, fill = false)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = badgeBg
                        ) {
                            Text(
                                text = "EXCEEDED",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    fontSize = 9.sp,
                                    letterSpacing = 0.5.sp
                                ),
                                color = badgeTextColor,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = "Spent ${formatInr(firstItem.spent)} vs limit of ${formatInr(firstItem.limit)} (+${formatInr(overAmount)} over)",
                        style = MaterialTheme.typography.bodySmall.copy(fontSize = 12.sp),
                        color = subtitleColor
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = "Manage Budget",
                    tint = subtitleColor,
                    modifier = Modifier.size(16.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Progress bar showing overflow
            LinearProgressIndicator(
                progress = { 1f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .clip(CircleShape),
                color = CashOutRed,
                trackColor = borderColor,
                strokeCap = StrokeCap.Round
            )
        }
    }
}
