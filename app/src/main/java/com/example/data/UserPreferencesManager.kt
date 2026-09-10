package com.example.data

import android.content.Context
import android.content.SharedPreferences
import android.net.Uri
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File
import java.io.FileOutputStream

data class CurrencyItem(
    val code: String,
    val symbol: String,
    val name: String,
    val flagEmoji: String
)

val CURRENCY_OPTIONS = listOf(
    CurrencyItem("INR", "₹", "Indian Rupee", "🇮🇳"),
    CurrencyItem("USD", "$", "US Dollar", "🇺🇸"),
    CurrencyItem("EUR", "€", "Euro", "🇪🇺"),
    CurrencyItem("GBP", "£", "British Pound", "🇬🇧"),
    CurrencyItem("AED", "د.إ", "UAE Dirham", "🇦🇪"),
    CurrencyItem("CAD", "$", "Canadian Dollar", "🇨🇦"),
    CurrencyItem("AUD", "$", "Australian Dollar", "🇦🇺"),
    CurrencyItem("SGD", "$", "Singapore Dollar", "🇸🇬"),
    CurrencyItem("JPY", "¥", "Japanese Yen", "🇯🇵")
)

class UserPreferencesManager(private val context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("kharcha_user_preferences_v3", Context.MODE_PRIVATE)

    companion object {
        const val KEY_USER_NAME = "userName"
        const val KEY_PROFILE_PHOTO = "profilePhoto"
        const val KEY_PROFILE_SETUP_COMPLETED = "profileSetupCompleted"
        const val KEY_SELECTED_CURRENCY = "selectedCurrency"
        const val KEY_SELECTED_THEME = "selectedTheme"
        const val KEY_NOTIFICATIONS_ENABLED = "notificationsEnabled"
        const val KEY_DAILY_REMINDER = "dailyExpenseReminder"
        const val KEY_MONTHLY_SUMMARY = "monthlyFinancialSummary"
        const val KEY_HAS_PROMPTED_NOTIFICATION_PERMISSION = "hasPromptedNotificationPermission"
    }

    private val _userName = MutableStateFlow(prefs.getString(KEY_USER_NAME, "") ?: "")
    val userName: StateFlow<String> = _userName.asStateFlow()

    private val _profilePhoto = MutableStateFlow(prefs.getString(KEY_PROFILE_PHOTO, "") ?: "")
    val profilePhoto: StateFlow<String> = _profilePhoto.asStateFlow()

    private val _profileSetupCompleted = MutableStateFlow(prefs.getBoolean(KEY_PROFILE_SETUP_COMPLETED, false))
    val profileSetupCompleted: StateFlow<Boolean> = _profileSetupCompleted.asStateFlow()

    private val _selectedCurrency = MutableStateFlow(prefs.getString(KEY_SELECTED_CURRENCY, "INR ₹") ?: "INR ₹")
    val selectedCurrency: StateFlow<String> = _selectedCurrency.asStateFlow()

    private val _selectedTheme = MutableStateFlow(prefs.getString(KEY_SELECTED_THEME, "SYSTEM") ?: "SYSTEM")
    val selectedTheme: StateFlow<String> = _selectedTheme.asStateFlow()

    private val _notificationsEnabled = MutableStateFlow(prefs.getBoolean(KEY_NOTIFICATIONS_ENABLED, true))
    val notificationsEnabled: StateFlow<Boolean> = _notificationsEnabled.asStateFlow()

    private val _dailyReminder = MutableStateFlow(prefs.getBoolean(KEY_DAILY_REMINDER, true))
    val dailyReminder: StateFlow<Boolean> = _dailyReminder.asStateFlow()

    private val _monthlySummary = MutableStateFlow(prefs.getBoolean(KEY_MONTHLY_SUMMARY, true))
    val monthlySummary: StateFlow<Boolean> = _monthlySummary.asStateFlow()

    private val _hasPromptedNotificationPermission = MutableStateFlow(prefs.getBoolean(KEY_HAS_PROMPTED_NOTIFICATION_PERMISSION, false))
    val hasPromptedNotificationPermission: StateFlow<Boolean> = _hasPromptedNotificationPermission.asStateFlow()

    fun getCurrencySymbol(): String {
        val curr = _selectedCurrency.value
        return when {
            curr.contains("₹") -> "₹"
            curr.contains("$") -> "$"
            curr.contains("€") -> "€"
            curr.contains("£") -> "£"
            curr.contains("د.إ") -> "د.إ"
            curr.contains("¥") -> "¥"
            else -> "₹"
        }
    }

    fun completeProfileSetup(name: String, photoPath: String) {
        prefs.edit()
            .putString(KEY_USER_NAME, name)
            .putString(KEY_PROFILE_PHOTO, photoPath)
            .putBoolean(KEY_PROFILE_SETUP_COMPLETED, true)
            .apply()
        _userName.value = name
        _profilePhoto.value = photoPath
        _profileSetupCompleted.value = true
    }

    fun updateProfile(name: String, photoPath: String) {
        prefs.edit()
            .putString(KEY_USER_NAME, name)
            .putString(KEY_PROFILE_PHOTO, photoPath)
            .apply()
        _userName.value = name
        _profilePhoto.value = photoPath
    }

    fun setCurrency(currencyString: String) {
        prefs.edit().putString(KEY_SELECTED_CURRENCY, currencyString).apply()
        _selectedCurrency.value = currencyString
    }

    fun setTheme(theme: String) {
        prefs.edit().putString(KEY_SELECTED_THEME, theme).apply()
        _selectedTheme.value = theme
    }

    fun setNotificationsEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_NOTIFICATIONS_ENABLED, enabled).apply()
        _notificationsEnabled.value = enabled
        com.example.notifications.KharchaNotificationScheduler.scheduleAllReminders(context)
    }

    fun setDailyReminder(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_DAILY_REMINDER, enabled).apply()
        _dailyReminder.value = enabled
        com.example.notifications.KharchaNotificationScheduler.scheduleAllReminders(context)
    }

    fun setMonthlySummary(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_MONTHLY_SUMMARY, enabled).apply()
        _monthlySummary.value = enabled
        com.example.notifications.KharchaNotificationScheduler.scheduleAllReminders(context)
    }

    fun setHasPromptedNotificationPermission(prompted: Boolean) {
        prefs.edit().putBoolean(KEY_HAS_PROMPTED_NOTIFICATION_PERMISSION, prompted).apply()
        _hasPromptedNotificationPermission.value = prompted
    }

    fun clearLocalData() {
        prefs.edit().clear().apply()
        _userName.value = ""
        _profilePhoto.value = ""
        _profileSetupCompleted.value = false
        _selectedCurrency.value = "INR ₹"
        _selectedTheme.value = "SYSTEM"
    }

    fun savePhotoLocally(sourceUri: Uri): String? {
        return try {
            val fileName = "profile_dp_${System.currentTimeMillis()}.jpg"
            val file = File(context.filesDir, fileName)
            context.contentResolver.openInputStream(sourceUri)?.use { input ->
                FileOutputStream(file).use { output ->
                    input.copyTo(output)
                }
            }
            file.absolutePath
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
