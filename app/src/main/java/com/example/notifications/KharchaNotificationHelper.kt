package com.example.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.example.MainActivity
import com.example.R

object KharchaNotificationHelper {

    const val CHANNEL_ID = "kharcha_reminders_channel"
    private const val CHANNEL_NAME = "Kharcha Reminders & Alerts"
    private const val CHANNEL_DESC = "Daily 7:00 AM expense logging reminders and 1st of month budget reviews"

    const val NOTIFICATION_ID_DAILY = 1001
    const val NOTIFICATION_ID_MONTHLY = 1002
    const val NOTIFICATION_ID_TEST = 1003

    fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance).apply {
                description = CHANNEL_DESC
                enableVibration(true)
                setShowBadge(true)
            }
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun sendDailyReminder(context: Context) {
        createNotificationChannel(context)

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_NAVIGATE_TO", "HOME")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            100,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("🌅 Good Morning! Daily Kharcha Reminder")
            .setContentText("Kal ke kharche aur aaj ka budget plan note karein.")
            .setStyle(
                NotificationCompat.BigTextStyle().bigText(
                    "Good morning! 🌅 Apne kal ke kharchon ko note karna na bhoolein. Track your daily expenses and stay on budget with Kharcha Notebook!"
                )
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setColor(0xFF0D3B2E.toInt())
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        try {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID_DAILY, notification)
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    fun sendMonthlyReminder(context: Context) {
        createNotificationChannel(context)

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_NAVIGATE_TO", "BUDGETS")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            200,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("📅 Naya Mahina, Nayi Shuruaat!")
            .setContentText("1st tarikh hai! Pichhle mahine ka expense review karein aur naya budget banayein.")
            .setStyle(
                NotificationCompat.BigTextStyle().bigText(
                    "Naye mahine ki 1st tarikh hai! 📅 Pichhle mahine ke kharchon ka review karein aur is mahine ke liye apna naya monthly budget set karein."
                )
            )
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setColor(0xFF0D3B2E.toInt())
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        try {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID_MONTHLY, notification)
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    fun sendTestReminder(context: Context, isMonthly: Boolean = false) {
        createNotificationChannel(context)
        if (isMonthly) {
            sendMonthlyReminder(context)
        } else {
            sendDailyReminder(context)
        }
    }
}
