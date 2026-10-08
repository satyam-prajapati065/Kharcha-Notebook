package com.example.ui.dialogs

import android.app.Activity
import android.content.Intent
import android.speech.RecognizerIntent
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.ai.AiParsedAction
import com.example.ai.KharchaAiService
import com.example.ai.KharchaTtsHelper
import com.example.ui.components.CategoryIconHelper
import com.example.ui.components.getCategoryColor
import com.example.ui.components.getCategoryIcon
import com.example.ui.theme.CashInGreen
import com.example.ui.theme.CashInGreenBg
import com.example.ui.theme.CashOutRed
import com.example.ui.theme.CashOutRedBg
import kotlinx.coroutines.launch
import java.util.Locale

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AiVoiceAssistantDialog(
    expenseCategories: List<String>,
    incomeCategories: List<String>,
    onDismiss: () -> Unit,
    onSaveTransaction: (type: String, amount: Double, category: String, paymentMode: String, note: String) -> Unit,
    onSetBudget: (category: String, limit: Double) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var userSpeechInput by remember { mutableStateOf("") }
    var isProcessing by remember { mutableStateOf(false) }
    var parsedAction by remember { mutableStateOf<AiParsedAction?>(null) }
    var speechFeedbackMessage by remember { mutableStateOf<String?>(null) }
    var voiceResponseEnabled by remember { mutableStateOf(true) }

    val ttsHelper = remember { KharchaTtsHelper(context) }
    DisposableEffect(Unit) {
        onDispose {
            ttsHelper.shutdown()
        }
    }

    fun parseAndProcess(text: String) {
        if (text.isBlank()) return
        userSpeechInput = text
        isProcessing = true
        speechFeedbackMessage = null
        coroutineScope.launch {
            try {
                val result = KharchaAiService.parseUserVoiceOrText(
                    input = text,
                    expenseCategories = expenseCategories,
                    incomeCategories = incomeCategories
                )
                parsedAction = result
                isProcessing = false

                if (result.amount > 0) {
                    val feedback = result.spokenFeedback.ifBlank {
                        if (result.action == "SET_BUDGET") {
                            "${result.category} ka budget ₹${result.amount.toInt()} set ho gaya."
                        } else if (result.type == "IN") {
                            "₹${result.amount.toInt()} ${result.category} ka Cash In mila."
                        } else {
                            "₹${result.amount.toInt()} ${result.category} Cash Out record ho gaya."
                        }
                    }
                    speechFeedbackMessage = feedback
                    if (voiceResponseEnabled) {
                        ttsHelper.speak(feedback)
                    }
                } else {
                    speechFeedbackMessage = "Amount samajh nahi aaya. Kripya dobara bolein ya amount likhein."
                    if (voiceResponseEnabled) {
                        ttsHelper.speak("Amount samajh nahi aaya. Dobara bolein.")
                    }
                }
            } catch (e: Exception) {
                isProcessing = false
                Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // Android Speech Recognizer Intent Launcher
    val speechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            val matches = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            val spokenText = matches?.firstOrNull() ?: ""
            if (spokenText.isNotBlank()) {
                parseAndProcess(spokenText)
            }
        }
    }

    fun startListening() {
        try {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "hi-IN")
                putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, "hi-IN")
                putExtra(RecognizerIntent.EXTRA_PROMPT, "Boliye (e.g. '₹500 petrol UPI' ya 'Salary aayi 45000')")
            }
            speechLauncher.launch(intent)
        } catch (_: Exception) {
            try {
                val genericIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak expense or income entry...")
                }
                speechLauncher.launch(genericIntent)
            } catch (e: Exception) {
                Toast.makeText(context, "Speech recognition not available on this device", Toast.LENGTH_LONG).show()
            }
        }
    }

    // Pulse animation for the mic button
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1.0f,
        targetValue = 1.12f,
        animationSpec = infiniteRepeatable(
            animation = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(26.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header with AI gradient
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.linearGradient(
                                        listOf(Color(0xFF6366F1), Color(0xFFEC4899), Color(0xFFF59E0B))
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "Kharcha AI Assistant",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "बोलकर या लिखकर एंट्री करें",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }

                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Big Animated Mic Button
                Box(
                    modifier = Modifier
                        .size(90.dp)
                        .scale(pulseScale)
                        .clip(CircleShape)
                        .background(
                            Brush.sweepGradient(
                                listOf(
                                    Color(0xFF3B82F6),
                                    Color(0xFF8B5CF6),
                                    Color(0xFFEC4899),
                                    Color(0xFF10B981),
                                    Color(0xFF3B82F6)
                                )
                            )
                        )
                        .clickable { startListening() }
                        .testTag("ai_mic_listen_button"),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(76.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.surface),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Mic,
                            contentDescription = "Tap to speak",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(38.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Tap to Speak / माइक दबाएं",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Text Field for manual entry or editing transcribed text
                OutlinedTextField(
                    value = userSpeechInput,
                    onValueChange = { userSpeechInput = it },
                    placeholder = { Text("या यहाँ लिखें: '500 petrol UPI' / 'Salary 50000'") },
                    trailingIcon = {
                        IconButton(
                            onClick = { parseAndProcess(userSpeechInput) },
                            enabled = userSpeechInput.isNotBlank() && !isProcessing
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Send,
                                contentDescription = "Parse",
                                tint = if (userSpeechInput.isNotBlank()) MaterialTheme.colorScheme.primary else Color.Gray
                            )
                        }
                    },
                    shape = RoundedCornerShape(14.dp),
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("ai_text_input")
                )

                // Quick Example Chips
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "Try sample phrases / उदाहरण टैप करें:",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.align(Alignment.Start)
                )
                Spacer(modifier = Modifier.height(6.dp))

                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    val samplePhrases = listOf(
                        "₹500 petrol UPI",
                        "Salary aayi ₹45000 bank me",
                        "Kirana samaan ₹1200 cash",
                        "Shopping ₹2500 card",
                        "Rent budget ₹15000"
                    )
                    samplePhrases.forEach { phrase ->
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                            modifier = Modifier.clickable {
                                userSpeechInput = phrase
                                parseAndProcess(phrase)
                            }
                        ) {
                            Text(
                                text = phrase,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Loading Shimmer/Spinner
                AnimatedVisibility(
                    visible = isProcessing,
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 12.dp)
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.5.dp,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "AI samajh raha hai...",
                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }

                // Parsed Result Card
                parsedAction?.let { action ->
                    if (action.amount > 0) {
                        val isIncome = action.type == "IN" && action.action != "SET_BUDGET"
                        val isBudget = action.action == "SET_BUDGET"

                        val cardBg = when {
                            isBudget -> Color(0xFF6366F1).copy(alpha = 0.1f)
                            isIncome -> CashInGreenBg
                            else -> CashOutRedBg
                        }
                        val cardBorder = when {
                            isBudget -> Color(0xFF6366F1)
                            isIncome -> CashInGreen
                            else -> CashOutRed
                        }

                        Card(
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = cardBg),
                            border = BorderStroke(1.5.dp, cardBorder),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("ai_result_card")
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = cardBorder
                                    ) {
                                        Text(
                                            text = when {
                                                isBudget -> "🎯 Set Budget"
                                                isIncome -> "🟢 Cash In"
                                                else -> "🔴 Cash Out"
                                            },
                                            color = Color.White,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                        )
                                    }

                                    Text(
                                        text = "₹${action.amount.toInt()}",
                                        style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                                        color = cardBorder
                                    )
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    val icon = getCategoryIcon(action.category)
                                    val catColor = getCategoryColor(action.category)

                                    Surface(
                                        shape = CircleShape,
                                        color = catColor.copy(alpha = 0.2f),
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Box(contentAlignment = Alignment.Center) {
                                            Icon(
                                                imageVector = icon,
                                                contentDescription = null,
                                                tint = catColor,
                                                modifier = Modifier.size(18.dp)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.width(8.dp))
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = action.category,
                                            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                        if (!isBudget) {
                                            Text(
                                                text = "Mode: ${action.paymentMode} • ${action.note.ifBlank { "No note" }}",
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }
                                }

                                speechFeedbackMessage?.let { feedback ->
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "🤖 \"$feedback\"",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Confirm & Save Button
                        Button(
                            onClick = {
                                if (isBudget) {
                                    onSetBudget(action.category, action.amount)
                                    Toast.makeText(context, "${action.category} budget ₹${action.amount.toInt()} saved!", Toast.LENGTH_SHORT).show()
                                } else {
                                    onSaveTransaction(
                                        action.type,
                                        action.amount,
                                        action.category,
                                        action.paymentMode,
                                        action.note.ifBlank { action.category }
                                    )
                                    Toast.makeText(context, "Saved ₹${action.amount.toInt()} (${action.type})", Toast.LENGTH_SHORT).show()
                                }
                                onDismiss()
                            },
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = cardBorder),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .testTag("confirm_ai_entry_button")
                        ) {
                            Icon(imageVector = Icons.Default.Check, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = if (isBudget) "Confirm & Set Budget" else "Confirm & Save Entry",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Voice Response Toggle Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "AI bolkar bataye (Voice Feedback)",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Switch(
                        checked = voiceResponseEnabled,
                        onCheckedChange = { voiceResponseEnabled = it },
                        modifier = Modifier.scale(0.85f),
                        colors = SwitchDefaults.colors(checkedThumbColor = MaterialTheme.colorScheme.primary)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Cancel button
                OutlinedButton(
                    onClick = onDismiss,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Close")
                }
            }
        }
    }
}
