package com.example.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.TrackChanges
import androidx.compose.material.icons.outlined.Analytics
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.ReceiptLong
import androidx.compose.material.icons.outlined.TrackChanges
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.TransactionEntity
import com.example.data.UserPreferencesManager
import com.example.notifications.KharchaNotificationScheduler
import com.example.ui.components.CurrencyFormatter
import com.example.ui.dialogs.AddBudgetDialog
import com.example.ui.dialogs.AddTransactionDialog
import com.example.ui.dialogs.EditTransactionDialog
import com.example.ui.dialogs.TransactionDetailDialog
import com.example.ui.screens.AnalyticsScreen
import com.example.ui.screens.BudgetScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.ProfileSetupScreen
import com.example.ui.screens.SplashScreen
import com.example.ui.screens.TransactionsScreen

enum class AppNavigationState {
    SPLASH,
    SETUP,
    MAIN
}

@Composable
fun MainAppScreen(
    viewModel: KharchaViewModel,
    userPreferencesManager: UserPreferencesManager = UserPreferencesManager(LocalContext.current),
    modifier: Modifier = Modifier
) {
    val isSetupCompleted by userPreferencesManager.profileSetupCompleted.collectAsState()
    val userName by userPreferencesManager.userName.collectAsState()
    val profilePhoto by userPreferencesManager.profilePhoto.collectAsState()
    val selectedCurrency by userPreferencesManager.selectedCurrency.collectAsState()

    // Sync CurrencyFormatter
    LaunchedEffect(selectedCurrency) {
        CurrencyFormatter.activeCurrencySymbol = userPreferencesManager.getCurrencySymbol()
    }

    val context = LocalContext.current
    val hasPromptedPermission by userPreferencesManager.hasPromptedNotificationPermission.collectAsState()
    var showNotificationPromptDialog by remember { mutableStateOf(false) }

    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        userPreferencesManager.setHasPromptedNotificationPermission(true)
        if (isGranted) {
            KharchaNotificationScheduler.scheduleAllReminders(context)
        }
    }

    var appState by remember { mutableStateOf(AppNavigationState.SPLASH) }

    // Check notification permission when splash finishes on first launch
    LaunchedEffect(appState) {
        if (appState != AppNavigationState.SPLASH && !hasPromptedPermission) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                val isGranted = ContextCompat.checkSelfPermission(
                    context,
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED
                if (!isGranted) {
                    showNotificationPromptDialog = true
                } else {
                    userPreferencesManager.setHasPromptedNotificationPermission(true)
                    KharchaNotificationScheduler.scheduleAllReminders(context)
                }
            } else {
                userPreferencesManager.setHasPromptedNotificationPermission(true)
                KharchaNotificationScheduler.scheduleAllReminders(context)
            }
        }
    }

    when (appState) {
        AppNavigationState.SPLASH -> {
            SplashScreen(
                isProfileSetupCompleted = isSetupCompleted,
                onNavigateToSetup = { appState = AppNavigationState.SETUP },
                onNavigateToDashboard = { appState = AppNavigationState.MAIN },
                modifier = modifier
            )
        }

        AppNavigationState.SETUP -> {
            ProfileSetupScreen(
                userPreferencesManager = userPreferencesManager,
                onSetupCompleted = { _, _ ->
                    appState = AppNavigationState.MAIN
                },
                modifier = modifier
            )
        }

        AppNavigationState.MAIN -> {
            MainDashboard(
                viewModel = viewModel,
                userPreferencesManager = userPreferencesManager,
                userName = userName,
                profilePhoto = profilePhoto,
                modifier = modifier
            )
        }
    }

    // Permission Prompt Dialog
    if (showNotificationPromptDialog) {
        AlertDialog(
            onDismissRequest = {
                showNotificationPromptDialog = false
                userPreferencesManager.setHasPromptedNotificationPermission(true)
            },
            icon = {
                Surface(
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.primaryContainer,
                    modifier = Modifier.size(56.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.NotificationsActive,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(30.dp)
                        )
                    }
                }
            },
            title = {
                Text(
                    text = "Turn On Reminders",
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    textAlign = TextAlign.Center
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "Kharcha Notebook reminders keep your daily expenses and monthly budgets on track:",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Row(verticalAlignment = Alignment.Top) {
                                Icon(
                                    imageVector = Icons.Default.Schedule,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "Daily Morning Reminder (7:00 AM)",
                                        style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = "Subah 7 baje kal ke kharche aur din ka budget plan note karne ka reminder.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }

                            Row(verticalAlignment = Alignment.Top) {
                                Icon(
                                    imageVector = Icons.Default.CalendarMonth,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "New Month Reminder (1st Date)",
                                        style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = "Mahina khatam hone par har 1 tarikh ko expense review aur naya budget planning alert.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showNotificationPromptDialog = false
                        userPreferencesManager.setHasPromptedNotificationPermission(true)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                        } else {
                            KharchaNotificationScheduler.scheduleAllReminders(context)
                        }
                    },
                    modifier = Modifier.testTag("allow_notifications_button")
                ) {
                    Text("Allow Notifications")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showNotificationPromptDialog = false
                        userPreferencesManager.setHasPromptedNotificationPermission(true)
                    },
                    modifier = Modifier.testTag("dismiss_notifications_button")
                ) {
                    Text("Maybe Later")
                }
            }
        )
    }
}

@Composable
fun MainDashboard(
    viewModel: KharchaViewModel,
    userPreferencesManager: UserPreferencesManager,
    userName: String,
    profilePhoto: String,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(0) }

    // Dialog States
    var showAddDialog by remember { mutableStateOf(false) }
    var addDialogInitialType by remember { mutableStateOf("OUT") }
    var showAddBudgetDialog by remember { mutableStateOf(false) }
    var selectedBudgetCategoryForDialog by remember { mutableStateOf<String?>(null) }
    var detailTransaction by remember { mutableStateOf<TransactionEntity?>(null) }
    var editTransaction by remember { mutableStateOf<TransactionEntity?>(null) }

    // Observed States from ViewModel
    val currentMonth by viewModel.currentMonthYear.collectAsStateWithLifecycle()
    val summary by viewModel.monthSummary.collectAsStateWithLifecycle()
    val monthlyTransactions by viewModel.monthlyTransactions.collectAsStateWithLifecycle()
    val filteredTransactions by viewModel.filteredTransactions.collectAsStateWithLifecycle()
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()
    val selectedFilter by viewModel.selectedFilter.collectAsStateWithLifecycle()
    val categorySpends by viewModel.expenseCategoryBreakdown.collectAsStateWithLifecycle()
    val budgets by viewModel.budgetProgress.collectAsStateWithLifecycle()

    Scaffold(
        modifier = modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar(
                modifier = Modifier
                    .windowInsetsPadding(WindowInsets.navigationBars)
                    .testTag("bottom_nav_bar"),
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = {
                        Icon(
                            imageVector = if (selectedTab == 0) Icons.Filled.Home else Icons.Outlined.Home,
                            contentDescription = "Home"
                        )
                    },
                    label = { Text("Home") },
                    modifier = Modifier.testTag("nav_tab_home")
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = {
                        Icon(
                            imageVector = if (selectedTab == 1) Icons.Filled.ReceiptLong else Icons.Outlined.ReceiptLong,
                            contentDescription = "Activity"
                        )
                    },
                    label = { Text("Activity") },
                    modifier = Modifier.testTag("nav_tab_activity")
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = {
                        Icon(
                            imageVector = if (selectedTab == 2) Icons.Filled.Analytics else Icons.Outlined.Analytics,
                            contentDescription = "Analytics"
                        )
                    },
                    label = { Text("Analytics") },
                    modifier = Modifier.testTag("nav_tab_analytics")
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = {
                        Icon(
                            imageVector = if (selectedTab == 3) Icons.Filled.TrackChanges else Icons.Outlined.TrackChanges,
                            contentDescription = "Budgets"
                        )
                    },
                    label = { Text("Budgets") },
                    modifier = Modifier.testTag("nav_tab_budgets")
                )
                NavigationBarItem(
                    selected = selectedTab == 4,
                    onClick = { selectedTab = 4 },
                    icon = {
                        Icon(
                            imageVector = if (selectedTab == 4) Icons.Filled.Person else Icons.Outlined.Person,
                            contentDescription = "Profile"
                        )
                    },
                    label = { Text("Profile") },
                    modifier = Modifier.testTag("nav_tab_profile")
                )
            }
        },
        floatingActionButton = {
            if (selectedTab != 4) {
                FloatingActionButton(
                    onClick = {
                        addDialogInitialType = "OUT"
                        showAddDialog = true
                    },
                    shape = CircleShape,
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = Color.White,
                    modifier = Modifier.testTag("main_add_fab")
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add Transaction",
                        modifier = Modifier.size(26.dp)
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(top = 8.dp)
        ) {
            when (selectedTab) {
                0 -> HomeScreen(
                    currentMonth = currentMonth,
                    summary = summary,
                    transactions = monthlyTransactions,
                    budgets = budgets,
                    userName = userName,
                    userPhotoPath = profilePhoto,
                    onPreviousMonth = { viewModel.previousMonth() },
                    onNextMonth = { viewModel.nextMonth() },
                    onAddCashIn = {
                        addDialogInitialType = "IN"
                        showAddDialog = true
                    },
                    onAddCashOut = {
                        addDialogInitialType = "OUT"
                        showAddDialog = true
                    },
                    onSeeAllTransactions = { selectedTab = 1 },
                    onTransactionClick = { item -> detailTransaction = item },
                    onOpenProfile = { selectedTab = 4 },
                    onOpenBudgets = { selectedTab = 3 }
                )

                1 -> TransactionsScreen(
                    currentMonth = currentMonth,
                    transactions = filteredTransactions,
                    searchQuery = searchQuery,
                    selectedFilter = selectedFilter,
                    onSearchChange = { viewModel.setSearchQuery(it) },
                    onFilterSelect = { viewModel.setFilter(it) },
                    onPreviousMonth = { viewModel.previousMonth() },
                    onNextMonth = { viewModel.nextMonth() },
                    onTransactionClick = { item -> detailTransaction = item }
                )

                2 -> AnalyticsScreen(
                    currentMonth = currentMonth,
                    summary = summary,
                    categorySpends = categorySpends,
                    transactions = monthlyTransactions,
                    onPreviousMonth = { viewModel.previousMonth() },
                    onNextMonth = { viewModel.nextMonth() }
                )

                3 -> BudgetScreen(
                    currentMonth = currentMonth,
                    budgets = budgets,
                    onPreviousMonth = { viewModel.previousMonth() },
                    onNextMonth = { viewModel.nextMonth() },
                    onAddBudget = {
                        selectedBudgetCategoryForDialog = null
                        showAddBudgetDialog = true
                    },
                    onEditBudget = { cat ->
                        selectedBudgetCategoryForDialog = cat
                        showAddBudgetDialog = true
                    }
                )

                4 -> ProfileScreen(
                    userPreferencesManager = userPreferencesManager,
                    onBack = { selectedTab = 0 },
                    onNavigateToBudget = { selectedTab = 3 }
                )
            }
        }
    }

    // Add Transaction Dialog with Calendar DatePicker
    if (showAddDialog) {
        AddTransactionDialog(
            initialType = addDialogInitialType,
            onDismiss = { showAddDialog = false },
            onSave = { type, amount, category, paymentMode, note, dateMillis ->
                viewModel.addTransaction(
                    type = type,
                    amount = amount,
                    category = category,
                    paymentMode = paymentMode,
                    note = note,
                    dateMillis = dateMillis
                )
            }
        )
    }

    // Edit Transaction Dialog with Calendar DatePicker
    editTransaction?.let { txn ->
        EditTransactionDialog(
            transaction = txn,
            onDismiss = { editTransaction = null },
            onSave = { updated ->
                viewModel.updateTransaction(updated)
            }
        )
    }

    // Set Budget Dialog
    if (showAddBudgetDialog) {
        val existingLimitMap = remember(budgets) {
            budgets.associate { it.category to it.limit }
        }
        AddBudgetDialog(
            onDismiss = {
                showAddBudgetDialog = false
                selectedBudgetCategoryForDialog = null
            },
            onSave = { category, limit ->
                viewModel.setBudget(category, limit)
            },
            initialCategory = selectedBudgetCategoryForDialog,
            existingLimitMap = existingLimitMap
        )
    }

    // Transaction Detail / Edit / Delete Dialog
    detailTransaction?.let { txn ->
        TransactionDetailDialog(
            transaction = txn,
            onDismiss = { detailTransaction = null },
            onEdit = { toEdit ->
                editTransaction = toEdit
            },
            onDelete = { id -> viewModel.deleteTransaction(id) }
        )
    }
}
