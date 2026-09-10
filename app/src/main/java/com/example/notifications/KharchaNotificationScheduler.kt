package com.example.notifications

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import com.example.data.UserPreferencesManager
import java.util.Calendar

object KharchaNotificationScheduler {

    private const val TAG = "KharchaScheduler"

    const val ACTION_DAILY_REMINDER = "com.example.notifications.ACTION_DAILY_REMINDER"
    const val ACTION_MONTHLY_REMINDER = "com.example.notifications.ACTION_MONTHLY_REMINDER"

    const val REQUEST_CODE_DAILY = 3001
    const val REQUEST_CODE_MONTHLY = 3002

    fun scheduleDailyReminder(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return

        val intent = Intent(context, KharchaNotificationReceiver::class.java).apply {
            action = ACTION_DAILY_REMINDER
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_DAILY,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Set calendar to 7:00 AM today
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 7)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            // If 7:00 AM has already passed today, advance to tomorrow 7:00 AM
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.DAY_OF_YEAR, 1)
            }
        }

        try {
            // Daily repeating alarm at ~7:00 AM
            alarmManager.setInexactRepeating(
                AlarmManager.RTC_WAKEUP,
                calendar.timeInMillis,
                AlarmManager.INTERVAL_DAY,
                pendingIntent
            )
            Log.d(TAG, "Scheduled daily 7:00 AM reminder for: ${calendar.time}")
        } catch (e: Exception) {
            Log.e(TAG, "Error scheduling daily reminder", e)
        }
    }

    fun cancelDailyReminder(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(context, KharchaNotificationReceiver::class.java).apply {
            action = ACTION_DAILY_REMINDER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_DAILY,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
        Log.d(TAG, "Cancelled daily reminder")
    }

    fun scheduleMonthlyReminder(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return

        val intent = Intent(context, KharchaNotificationReceiver::class.java).apply {
            action = ACTION_MONTHLY_REMINDER
        }

        val pendingIntent = PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_MONTHLY,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Target: 1st date of next month at 7:00 AM
        val calendar = Calendar.getInstance().apply {
            set(Calendar.DAY_OF_MONTH, 1)
            set(Calendar.HOUR_OF_DAY, 7)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            // If current time is past 1st of this month 7:00 AM, move to 1st of next month
            if (timeInMillis <= System.currentTimeMillis()) {
                add(Calendar.MONTH, 1)
                set(Calendar.DAY_OF_MONTH, 1)
            }
        }

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            } else {
                alarmManager.set(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            }
            Log.d(TAG, "Scheduled monthly 1st date reminder for: ${calendar.time}")
        } catch (e: Exception) {
            Log.e(TAG, "Error scheduling monthly reminder", e)
        }
    }

    fun cancelMonthlyReminder(context: Context) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val intent = Intent(context, KharchaNotificationReceiver::class.java).apply {
            action = ACTION_MONTHLY_REMINDER
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            REQUEST_CODE_MONTHLY,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager.cancel(pendingIntent)
        Log.d(TAG, "Cancelled monthly reminder")
    }

    fun scheduleAllReminders(context: Context) {
        KharchaNotificationHelper.createNotificationChannel(context)
        val prefs = UserPreferencesManager(context)

        val notificationsEnabled = prefs.notificationsEnabled.value
        val dailyEnabled = prefs.dailyReminder.value
        val monthlyEnabled = prefs.monthlySummary.value

        if (notificationsEnabled) {
            if (dailyEnabled) {
                scheduleDailyReminder(context)
            } else {
                cancelDailyReminder(context)
            }

            if (monthlyEnabled) {
                scheduleMonthlyReminder(context)
            } else {
                cancelMonthlyReminder(context)
            }
        } else {
            cancelDailyReminder(context)
            cancelMonthlyReminder(context)
        }
    }
}
