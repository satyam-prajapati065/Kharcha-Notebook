package com.example

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.core.content.ContextCompat
import com.example.data.KharchaDatabase
import com.example.data.KharchaRepository
import com.example.data.UserPreferencesManager
import com.example.notifications.KharchaNotificationHelper
import com.example.notifications.KharchaNotificationScheduler
import com.example.ui.KharchaViewModel
import com.example.ui.KharchaViewModelFactory
import com.example.ui.MainAppScreen
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

  private val viewModel: KharchaViewModel by viewModels {
    val database = KharchaDatabase.getDatabase(applicationContext)
    val repository = KharchaRepository(database.transactionDao(), database.budgetDao())
    KharchaViewModelFactory(repository)
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Initialize notification channel and schedule reminders if permission is available
    KharchaNotificationHelper.createNotificationChannel(applicationContext)
    val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
    } else {
      true
    }
    if (hasPermission) {
      KharchaNotificationScheduler.scheduleAllReminders(applicationContext)
    }

    setContent {
      val userPreferencesManager = remember { UserPreferencesManager(applicationContext) }
      val selectedTheme by userPreferencesManager.selectedTheme.collectAsState()
      val systemInDark = isSystemInDarkTheme()

      val isDark = when (selectedTheme) {
        "DARK" -> true
        "LIGHT" -> false
        else -> systemInDark
      }

      MyApplicationTheme(darkTheme = isDark) {
        MainAppScreen(viewModel = viewModel, userPreferencesManager = userPreferencesManager)
      }
    }
  }
}
