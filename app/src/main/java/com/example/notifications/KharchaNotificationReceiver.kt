package com.example.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class KharchaNotificationReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent == null) return
        val action = intent.action
        Log.d("KharchaReceiver", "Received action: $action")

        when (action) {
            KharchaNotificationScheduler.ACTION_DAILY_REMINDER -> {
                KharchaNotificationHelper.sendDailyReminder(context)
            }

            KharchaNotificationScheduler.ACTION_MONTHLY_REMINDER -> {
                KharchaNotificationHelper.sendMonthlyReminder(context)
                // Schedule for the next month's 1st date
                KharchaNotificationScheduler.scheduleMonthlyReminder(context)
            }

            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED -> {
                // Device rebooted or app updated; reschedule active reminders
                KharchaNotificationScheduler.scheduleAllReminders(context)
            }
        }
    }
}
