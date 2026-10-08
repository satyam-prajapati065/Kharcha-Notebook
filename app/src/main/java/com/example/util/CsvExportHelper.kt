package com.example.util

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.widget.Toast
import androidx.core.content.FileProvider
import com.example.data.TransactionEntity
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

sealed class ExportResult {
    data class Success(
        val mediaUri: Uri,
        val shareableUri: Uri?,
        val fileName: String,
        val filePathDisplay: String,
        val transactionCount: Int
    ) : ExportResult()

    data class Error(val errorMessage: String) : ExportResult()
}

object CsvExportHelper {
    const val CSV_MIME_TYPE = "text/csv"

    /**
     * Generates a descriptive file name with timestamp.
     */
    fun generateFileName(): String {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        return "Kharcha_Transactions_$timeStamp.csv"
    }

    /**
     * Converts a list of TransactionEntity into a standardized RFC 4180 CSV string.
     */
    fun generateCsv(transactions: List<TransactionEntity>): String {
        val sb = StringBuilder()
        // CSV Header
        sb.append("ID,Date,Time,Type,Category,Amount,Payment Mode,Note,Month\n")

        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val timeFormat = SimpleDateFormat("hh:mm a", Locale.getDefault())

        for (t in transactions) {
            val date = Date(t.dateMillis)
            val id = t.id.toString()
            val dateStr = dateFormat.format(date)
            val timeStr = timeFormat.format(date)
            val typeStr = if (t.type.equals("IN", ignoreCase = true)) "Cash In" else "Cash Out"
            val categoryStr = escapeCsv(t.category)
            val amountStr = String.format(Locale.US, "%.2f", t.amount)
            val paymentModeStr = escapeCsv(t.paymentMode)
            val noteStr = escapeCsv(t.note)
            val monthStr = escapeCsv(t.monthYear)

            sb.append("$id,$dateStr,$timeStr,$typeStr,$categoryStr,$amountStr,$paymentModeStr,$noteStr,$monthStr\n")
        }
        return sb.toString()
    }

    /**
     * Proper RFC 4180 field escaping for CSV.
     */
    private fun escapeCsv(text: String): String {
        var str = text
        if (str.contains(",") || str.contains("\"") || str.contains("\n") || str.contains("\r")) {
            str = str.replace("\"", "\"\"")
            return "\"$str\""
        }
        return str
    }

    /**
     * Exports CSV data directly to the public Downloads folder using Android Scoped Storage best practices.
     * Uses MediaStore.Downloads on Android 10+ (API 29+) with IS_PENDING flags,
     * and falls back to Environment.getExternalStoragePublicDirectory on Android 9 (API 28) and below.
     */
    fun exportToPublicDownloads(
        context: Context,
        fileName: String,
        csvContent: String,
        transactionCount: Int
    ): ExportResult {
        return try {
            val bytes = csvContent.toByteArray(Charsets.UTF_8)
            var resultUri: Uri? = null
            var displayPath = "Downloads/$fileName"

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val resolver = context.contentResolver
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                    put(MediaStore.MediaColumns.MIME_TYPE, CSV_MIME_TYPE)
                    put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                    put(MediaStore.MediaColumns.IS_PENDING, 1)
                }

                val collectionUri = MediaStore.Downloads.EXTERNAL_CONTENT_URI
                val uri = resolver.insert(collectionUri, contentValues)
                    ?: return ExportResult.Error("Unable to create file entry in MediaStore Downloads.")

                resultUri = uri
                resolver.openOutputStream(uri)?.use { outputStream ->
                    outputStream.write(bytes)
                    outputStream.flush()
                } ?: run {
                    resolver.delete(uri, null, null)
                    return ExportResult.Error("Failed to open output stream to MediaStore.")
                }

                // Finalize file creation by setting IS_PENDING to 0
                contentValues.clear()
                contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
                resolver.update(uri, contentValues, null, null)
            } else {
                // Android 9 (API 28) and below fallback
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                if (!downloadsDir.exists()) {
                    downloadsDir.mkdirs()
                }
                val targetFile = File(downloadsDir, fileName)
                targetFile.writeBytes(bytes)
                displayPath = targetFile.absolutePath

                // Trigger MediaScanner so the file immediately appears in the phone's File Manager / Downloads
                MediaScannerConnection.scanFile(
                    context,
                    arrayOf(targetFile.absolutePath),
                    arrayOf(CSV_MIME_TYPE),
                    null
                )
                resultUri = Uri.fromFile(targetFile)
            }

            // Create a cached copy via FileProvider for universal sharing compatibility
            val shareableUri = createShareableFileUri(context, fileName, bytes)

            ExportResult.Success(
                mediaUri = resultUri,
                shareableUri = shareableUri ?: resultUri,
                fileName = fileName,
                filePathDisplay = displayPath,
                transactionCount = transactionCount
            )
        } catch (e: Exception) {
            e.printStackTrace()
            ExportResult.Error(e.localizedMessage ?: "Failed to export CSV file.")
        }
    }

    /**
     * Writes CSV content directly to a user-selected SAF Uri (Intent.ACTION_CREATE_DOCUMENT).
     */
    fun writeToSafUri(context: Context, destinationUri: Uri, csvContent: String): Boolean {
        return try {
            val bytes = csvContent.toByteArray(Charsets.UTF_8)
            context.contentResolver.openOutputStream(destinationUri, "wt")?.use { out ->
                out.write(bytes)
                out.flush()
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * Creates a cache copy exposed via FileProvider for flawless sharing with external apps.
     */
    private fun createShareableFileUri(context: Context, fileName: String, bytes: ByteArray): Uri? {
        return try {
            val exportDir = File(context.cacheDir, "exports").apply { mkdirs() }
            val cacheFile = File(exportDir, fileName)
            cacheFile.writeBytes(bytes)
            FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", cacheFile)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Opens system share sheet for the exported CSV file.
     */
    fun shareCsv(context: Context, fileUri: Uri, fileName: String) {
        try {
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = CSV_MIME_TYPE
                putExtra(Intent.EXTRA_STREAM, fileUri)
                putExtra(Intent.EXTRA_SUBJECT, "Exported Transactions - $fileName")
                putExtra(Intent.EXTRA_TEXT, "Here is the exported transactions report from Kharcha Notebook ($fileName).")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            val chooser = Intent.createChooser(intent, "Share Transactions CSV")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(chooser)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(context, "No app available to share file", Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Opens the CSV file in an external spreadsheet viewer (Excel, Google Sheets, etc.).
     */
    fun openCsv(context: Context, fileUri: Uri) {
        try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(fileUri, CSV_MIME_TYPE)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(
                context,
                "No app found to open CSV. The file is saved in your Downloads folder.",
                Toast.LENGTH_LONG
            ).show()
        }
    }
}
