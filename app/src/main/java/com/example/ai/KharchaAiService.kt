package com.example.ai

import android.util.Log
import com.example.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit
import java.util.regex.Pattern

object KharchaAiService {

    private const val TAG = "KharchaAiService"
    private const val MODEL_NAME = "gemini-3.5-flash"
    private const val BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/$MODEL_NAME:generateContent"

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    suspend fun parseUserVoiceOrText(
        input: String,
        expenseCategories: List<String>,
        incomeCategories: List<String>
    ): AiParsedAction = withContext(Dispatchers.IO) {
        val trimmed = input.trim()
        if (trimmed.isBlank()) {
            return@withContext AiParsedAction(
                action = "TRANSACTION",
                type = "OUT",
                amount = 0.0,
                category = expenseCategories.firstOrNull() ?: "Other Expense",
                paymentMode = "UPI",
                note = "",
                spokenFeedback = "Kripya bolen ya likhen kya kharcha ya income hua."
            )
        }

        // Try Gemini AI API if API key is configured
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (!apiKey.isNullOrBlank() && !apiKey.equals("MY_GEMINI_API_KEY", ignoreCase = true)) {
            try {
                val aiResult = callGeminiApi(trimmed, apiKey, expenseCategories, incomeCategories)
                if (aiResult != null && aiResult.amount > 0) {
                    return@withContext aiResult
                }
            } catch (e: Exception) {
                Log.e(TAG, "Gemini API error, falling back to local NLP parser", e)
            }
        }

        // Fallback to offline local NLP parser
        parseWithLocalNlp(trimmed, expenseCategories, incomeCategories)
    }

    private fun callGeminiApi(
        input: String,
        apiKey: String,
        expenseCategories: List<String>,
        incomeCategories: List<String>
    ): AiParsedAction? {
        val expList = expenseCategories.joinToString(", ")
        val incList = incomeCategories.joinToString(", ")

        val systemPrompt = """
            You are Kharcha AI, an intelligent voice expense manager for Indian users.
            The user will give an input in Hindi, Hinglish, or English describing an expense, income, or budget.
            
            Available Expense Categories: [$expList]
            Available Income Categories: [$incList]
            Available Payment Modes: ["UPI", "Cash", "Bank", "Card"]
            
            Determine:
            1. "action": "TRANSACTION" or "SET_BUDGET"
            2. "type": "IN" (Cash In / Income) or "OUT" (Cash Out / Expense)
            3. "amount": numerical number (e.g. 500, 12000). If user says "50 hazar" or "50k", convert to 50000.
            4. "category": Select the most appropriate category strictly from the respective category list.
            5. "paymentMode": "UPI", "Cash", "Bank", or "Card". Default to "UPI" for digital/online/Google Pay/PhonePe, or "Cash" if cash mentioned.
            6. "note": Brief clear note describing the item/reason.
            7. "spokenFeedback": A short natural confirmation sentence in Hindi/Hinglish (e.g. "₹500 petrol kharcha Cash Out save ho gaya").
            
            Return ONLY a valid JSON object without markdown formatting:
            {
              "action": "TRANSACTION",
              "type": "OUT",
              "amount": 500.0,
              "category": "Transport",
              "paymentMode": "UPI",
              "note": "Petrol",
              "spokenFeedback": "₹500 petrol ka Cash Out record ho gaya."
            }
        """.trimIndent()

        val requestJson = JSONObject().apply {
            val contentsArr = org.json.JSONArray().apply {
                val turnObj = JSONObject().apply {
                    val partsArr = org.json.JSONArray().apply {
                        put(JSONObject().put("text", "System instruction:\n$systemPrompt\n\nUser input: \"$input\""))
                    }
                    put("parts", partsArr)
                }
                put(turnObj)
            }
            put("contents", contentsArr)

            val genConfig = JSONObject().apply {
                put("temperature", 0.1)
                put("responseMimeType", "application/json")
            }
            put("generationConfig", genConfig)
        }

        val requestBody = requestJson.toString().toRequestBody("application/json".toMediaType())
        val url = "$BASE_URL?key=$apiKey"

        val request = Request.Builder()
            .url(url)
            .post(requestBody)
            .build()

        val response = okHttpClient.newCall(request).execute()
        if (!response.isSuccessful) {
            Log.w(TAG, "Gemini API HTTP ${response.code}: ${response.message}")
            return null
        }

        val responseBody = response.body?.string() ?: return null
        val rootJson = JSONObject(responseBody)
        val candidates = rootJson.optJSONArray("candidates") ?: return null
        val firstCandidate = candidates.optJSONObject(0) ?: return null
        val content = firstCandidate.optJSONObject("content") ?: return null
        val parts = content.optJSONArray("parts") ?: return null
        val text = parts.optJSONObject(0)?.optString("text") ?: return null

        val cleanJson = text.trim()
            .removePrefix("```json")
            .removePrefix("```")
            .removeSuffix("```")
            .trim()

        val parsed = JSONObject(cleanJson)
        val action = parsed.optString("action", "TRANSACTION")
        val type = parsed.optString("type", "OUT").uppercase()
        val amount = parsed.optDouble("amount", 0.0)
        val rawCategory = parsed.optString("category", if (type == "IN") "Salary" else "Other Expense")
        val paymentMode = parsed.optString("paymentMode", "UPI")
        val note = parsed.optString("note", input)
        val feedback = parsed.optString("spokenFeedback", "₹${amount.toInt()} record kar liya gaya.")

        return AiParsedAction(
            action = action,
            type = if (type == "IN") "IN" else "OUT",
            amount = amount,
            category = rawCategory,
            paymentMode = if (paymentMode in listOf("UPI", "Cash", "Bank", "Card")) paymentMode else "UPI",
            note = note,
            spokenFeedback = feedback
        )
    }

    /**
     * Highly capable local NLP parser for Hindi, Hinglish, and English financial phrases.
     */
    fun parseWithLocalNlp(
        text: String,
        expenseCategories: List<String>,
        incomeCategories: List<String>
    ): AiParsedAction {
        val lower = text.lowercase().trim()

        // 1. Detect if it's a Budget setting command
        val isBudget = lower.contains("budget")

        // 2. Detect Amount
        var amount = 0.0
        // Match numbers like 50k, 50 hazar, 50 thousand
        val hazarPattern = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(?:k\\b|hazar\\b|hazaar\\b|thousand\\b)", Pattern.CASE_INSENSITIVE)
        val hazarMatcher = hazarPattern.matcher(lower)
        if (hazarMatcher.find()) {
            val num = hazarMatcher.group(1)?.toDoubleOrNull() ?: 0.0
            amount = num * 1000.0
        } else {
            val amountPattern = Pattern.compile("(?:rs\\.?|inr|₹)?\\s*(\\d+(?:,\\d+)*(?:\\.\\d+)?)\\s*(?:rs\\.?|rupay|rupaye|rupees)?", Pattern.CASE_INSENSITIVE)
            val matcher = amountPattern.matcher(lower)
            var bestCandidate = 0.0
            while (matcher.find()) {
                val candidateStr = matcher.group(1)?.replace(",", "")
                val candidateVal = candidateStr?.toDoubleOrNull() ?: 0.0
                if (candidateVal > bestCandidate) {
                    bestCandidate = candidateVal
                }
            }
            amount = bestCandidate
        }

        // 3. Detect Type (IN vs OUT)
        val incomeKeywords = listOf(
            "salary", "income", "credited", "credit", "mila", "mile", "aaya", "aaye",
            "jama", "recieved", "received", "kamaya", "cash in", "profit", "gift"
        )
        val isIncome = incomeKeywords.any { lower.contains(it) }
        val type = if (isIncome && !isBudget) "IN" else "OUT"

        // 4. Detect Payment Mode
        val paymentMode = when {
            lower.contains("cash") || lower.contains("nakad") || lower.contains("rokda") -> "Cash"
            lower.contains("bank") || lower.contains("neft") || lower.contains("imps") || lower.contains("account") || lower.contains("cheque") -> "Bank"
            lower.contains("card") || lower.contains("credit") || lower.contains("debit") || lower.contains("visa") -> "Card"
            else -> "UPI" // Default for digital India (Google Pay, PhonePe, Paytm, UPI)
        }

        // 5. Detect Category
        val categories = if (type == "IN") incomeCategories else expenseCategories
        var matchedCategory = categories.firstOrNull() ?: if (type == "IN") "Salary" else "Other Expense"

        // Match against known keywords
        val catKeywords = mapOf(
            "Food & Dining" to listOf("food", "khana", "lunch", "dinner", "breakfast", "nashta", "restaurant", "hotel", "swiggy", "zomato", "cafe", "chai", "coffee", "pizza", "burger", "biryani"),
            "Groceries" to listOf("grocery", "groceries", "ration", "rashan", "sabzi", "sabji", "fruit", "milk", "doodh", "kirana", "market", "blinkit", "zepto", "instamart", "vegetables"),
            "Transport" to listOf("petrol", "diesel", "fuel", "auto", "taxi", "cab", "uber", "ola", "metro", "bus", "train", "flight", "toll", "parking", "rapido"),
            "Rent" to listOf("rent", "kiraya", "room", "flat", "pg"),
            "Bills & Utilities" to listOf("bill", "electricity", "bijli", "water", "pani", "wifi", "internet", "recharge", "mobile", "gas", "cylinder"),
            "Shopping" to listOf("shopping", "clothes", "kapde", "shoes", "amazon", "flipkart", "myntra", "mall"),
            "Health" to listOf("doctor", "medicine", "dawa", "dawakhana", "medical", "hospital", "clinic", "test", "checkup", "gym"),
            "Entertainment" to listOf("movie", "cinema", "netflix", "hotstar", "outing", "game", "party"),
            "Education" to listOf("fee", "fees", "school", "college", "tuition", "coaching", "book", "kitab", "course"),
            "Salary" to listOf("salary", "tankhwah", "stipend", "pay", "bonus"),
            "Freelance" to listOf("freelance", "client", "project", "gig"),
            "Business" to listOf("business", "dukaan", "shop", "sales", "bikri"),
            "Investments" to listOf("interest", "dividend", "shares", "stocks", "mutual fund", "crypto")
        )

        for ((catName, keywords) in catKeywords) {
            if (keywords.any { lower.contains(it) }) {
                // Find matching category in available list
                val found = categories.find { it.equals(catName, ignoreCase = true) }
                if (found != null) {
                    matchedCategory = found
                    break
                }
            }
        }

        // 6. Generate Clean Note
        val cleanNote = text.trim()

        val spokenFeedback = if (isBudget) {
            "$matchedCategory ka budget ₹${amount.toInt()} set kar rahe hain."
        } else if (type == "IN") {
            "₹${amount.toInt()} $matchedCategory ka Cash In mila."
        } else {
            "₹${amount.toInt()} $matchedCategory kharcha Cash Out save ho raha hai."
        }

        return AiParsedAction(
            action = if (isBudget) "SET_BUDGET" else "TRANSACTION",
            type = type,
            amount = amount,
            category = matchedCategory,
            paymentMode = paymentMode,
            note = cleanNote,
            spokenFeedback = spokenFeedback
        )
    }
}
