package com.example.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CardGiftcard
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.ContentCut
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.ElectricBolt
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.Flight
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Laptop
import androidx.compose.material.icons.filled.LocalCafe
import androidx.compose.material.icons.filled.LocalGasStation
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.Pets
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.ShoppingBasket
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.Subscriptions
import androidx.compose.material.icons.filled.Theaters
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material.icons.filled.Work
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

data class CuratedIconItem(
    val name: String,
    val label: String,
    val icon: ImageVector
)

data class CuratedColorItem(
    val hex: String,
    val color: Color
)

object CategoryIconHelper {

    val CURATED_ICONS = listOf(
        CuratedIconItem("Shopping", "Shopping", Icons.Default.ShoppingCart),
        CuratedIconItem("ShoppingBag", "Mall", Icons.Default.ShoppingBag),
        CuratedIconItem("FitnessCenter", "Gym / Fitness", Icons.Default.FitnessCenter),
        CuratedIconItem("LocalGasStation", "Fuel / Petrol", Icons.Default.LocalGasStation),
        CuratedIconItem("Pets", "Pets", Icons.Default.Pets),
        CuratedIconItem("LocalHospital", "Medical / Health", Icons.Default.LocalHospital),
        CuratedIconItem("Flight", "Travel", Icons.Default.Flight),
        CuratedIconItem("Subscriptions", "Subscriptions", Icons.Default.Subscriptions),
        CuratedIconItem("Theaters", "Entertainment", Icons.Default.Theaters),
        CuratedIconItem("CardGiftcard", "Gifts", Icons.Default.CardGiftcard),
        CuratedIconItem("Restaurant", "Dining", Icons.Default.Restaurant),
        CuratedIconItem("ShoppingBasket", "Groceries", Icons.Default.ShoppingBasket),
        CuratedIconItem("DirectionsCar", "Transport", Icons.Default.DirectionsCar),
        CuratedIconItem("Home", "Housing / Rent", Icons.Default.Home),
        CuratedIconItem("ReceiptLong", "Bills / Utilities", Icons.Default.ReceiptLong),
        CuratedIconItem("ElectricBolt", "Electricity", Icons.Default.ElectricBolt),
        CuratedIconItem("Wifi", "Internet", Icons.Default.Wifi),
        CuratedIconItem("School", "Education", Icons.Default.School),
        CuratedIconItem("SportsEsports", "Gaming", Icons.Default.SportsEsports),
        CuratedIconItem("Work", "Salary / Work", Icons.Default.Work),
        CuratedIconItem("Laptop", "Freelance / Tech", Icons.Default.Laptop),
        CuratedIconItem("TrendingUp", "Investment", Icons.Default.TrendingUp),
        CuratedIconItem("LocalCafe", "Coffee & Snacks", Icons.Default.LocalCafe),
        CuratedIconItem("ContentCut", "Salon / Care", Icons.Default.ContentCut),
        CuratedIconItem("Build", "Repairs", Icons.Default.Build),
        CuratedIconItem("Category", "General", Icons.Default.Category)
    )

    val PRESET_COLORS = listOf(
        CuratedColorItem("#F97316", Color(0xFFF97316)), // Orange
        CuratedColorItem("#EF4444", Color(0xFFEF4444)), // Red
        CuratedColorItem("#EC4899", Color(0xFFEC4899)), // Pink
        CuratedColorItem("#A855F7", Color(0xFFA855F7)), // Purple
        CuratedColorItem("#8B5CF6", Color(0xFF8B5CF6)), // Violet
        CuratedColorItem("#3B82F6", Color(0xFF3B82F6)), // Blue
        CuratedColorItem("#06B6D4", Color(0xFF06B6D4)), // Cyan
        CuratedColorItem("#14B8A6", Color(0xFF14B8A6)), // Teal
        CuratedColorItem("#10B981", Color(0xFF10B981)), // Emerald
        CuratedColorItem("#EAB308", Color(0xFFEAB308)), // Yellow
        CuratedColorItem("#6366F1", Color(0xFF6366F1)), // Indigo
        CuratedColorItem("#64748B", Color(0xFF64748B))  // Slate
    )

    private val categoryMetaMap = java.util.concurrent.ConcurrentHashMap<String, Pair<String, String>>()

    fun registerCategory(name: String, iconName: String, colorHex: String) {
        if (name.isNotBlank()) {
            categoryMetaMap[name.trim().lowercase(java.util.Locale.getDefault())] = Pair(iconName, colorHex)
        }
    }

    fun registerCategories(categories: List<com.example.data.CategoryEntity>) {
        for (cat in categories) {
            registerCategory(cat.name, cat.iconName, cat.colorHex)
        }
    }

    fun getCustomIconName(name: String): String? {
        return categoryMetaMap[name.trim().lowercase(java.util.Locale.getDefault())]?.first
    }

    fun getCustomColorHex(name: String): String? {
        return categoryMetaMap[name.trim().lowercase(java.util.Locale.getDefault())]?.second
    }

    fun getIconByName(iconName: String): ImageVector {
        val match = CURATED_ICONS.find { it.name.equals(iconName, ignoreCase = true) }
        if (match != null) return match.icon

        val registered = getCustomIconName(iconName)
        if (registered != null && !registered.equals(iconName, ignoreCase = true)) {
            val regMatch = CURATED_ICONS.find { it.name.equals(registered, ignoreCase = true) }
            if (regMatch != null) return regMatch.icon
        }

        return when (iconName.lowercase()) {
            "fastfood", "food" -> Icons.Default.Restaurant
            "groceries" -> Icons.Default.ShoppingBasket
            "shopping" -> Icons.Default.ShoppingCart
            "salary" -> Icons.Default.Work
            "freelance", "business" -> Icons.Default.Laptop
            "rent" -> Icons.Default.Home
            "bills", "bills & utilities" -> Icons.Default.ReceiptLong
            "transport" -> Icons.Default.DirectionsCar
            "health", "medical" -> Icons.Default.LocalHospital
            "gym", "fitness" -> Icons.Default.FitnessCenter
            "fuel", "petrol" -> Icons.Default.LocalGasStation
            "flight", "travel" -> Icons.Default.Flight
            "entertainment", "theaters" -> Icons.Default.Theaters
            "gift", "gifts" -> Icons.Default.CardGiftcard
            else -> Icons.Default.Category
        }
    }

    fun parseColor(hex: String, fallback: Color = Color(0xFF3B82F6)): Color {
        return try {
            val cleanHex = if (hex.startsWith("#")) hex else "#$hex"
            Color(android.graphics.Color.parseColor(cleanHex))
        } catch (_: Exception) {
            fallback
        }
    }
}
