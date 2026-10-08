package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("Kharcha Notebook", appName)
  }

  @Test
  fun `test custom category registration and lookup`() {
    com.example.ui.components.CategoryIconHelper.registerCategory("Cricket Gym", "FitnessCenter", "#EF4444")
    assertEquals("FitnessCenter", com.example.ui.components.CategoryIconHelper.getCustomIconName("Cricket Gym"))
    assertEquals("#EF4444", com.example.ui.components.CategoryIconHelper.getCustomColorHex("Cricket Gym"))

    val color = com.example.ui.components.getCategoryColor("Cricket Gym")
    assertEquals(androidx.compose.ui.graphics.Color(0xFFEF4444), color)
  }

  @Test
  fun `test KharchaViewModel instantiation without NPE`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val db = androidx.room.Room.inMemoryDatabaseBuilder(context, com.example.data.KharchaDatabase::class.java)
        .allowMainThreadQueries()
        .build()
    val repo = com.example.data.KharchaRepository(
        db.transactionDao(),
        db.budgetDao(),
        db.categoryDao()
    )
    val vm = com.example.ui.KharchaViewModel(repo)
    org.junit.Assert.assertNotNull(vm)
    org.junit.Assert.assertNotNull(vm.allCategories)
    db.close()
  }

  @Test
  fun `test quick amount preset direct replacement and toggle behavior`() {
    var amountText = ""
    val selectQuickAmount: (String) -> Unit = { quickAmount ->
      amountText = if (amountText.trim() == quickAmount) "" else quickAmount
    }

    // Selecting 500 should set to 500
    selectQuickAmount("500")
    assertEquals("500", amountText)

    // Selecting 1000 should replace (not accumulate to 1500)
    selectQuickAmount("1000")
    assertEquals("1000", amountText)

    // Re-clicking 1000 should toggle to empty
    selectQuickAmount("1000")
    assertEquals("", amountText)

    // Selecting 2000 from empty
    selectQuickAmount("2000")
    assertEquals("2000", amountText)
  }

  @Test
  fun `test KharchaAiService local NLP parser for Hindi and English voice phrases`() {
    val expenseCategories = listOf("Food & Dining", "Groceries", "Rent", "Bills & Utilities", "Shopping", "Transport", "Health", "Other Expense")
    val incomeCategories = listOf("Salary", "Freelance", "Business", "Investments", "Other Income")

    // Test 1: Petrol expense via UPI
    val action1 = com.example.ai.KharchaAiService.parseWithLocalNlp(
      "₹500 petrol Google Pay se",
      expenseCategories,
      incomeCategories
    )
    assertEquals("OUT", action1.type)
    assertEquals(500.0, action1.amount, 0.01)
    assertEquals("Transport", action1.category)
    assertEquals("UPI", action1.paymentMode)

    // Test 2: Salary credit via Bank
    val action2 = com.example.ai.KharchaAiService.parseWithLocalNlp(
      "Salary aayi 45000 bank account me",
      expenseCategories,
      incomeCategories
    )
    assertEquals("IN", action2.type)
    assertEquals(45000.0, action2.amount, 0.01)
    assertEquals("Salary", action2.category)
    assertEquals("Bank", action2.paymentMode)

    // Test 3: Groceries in Cash
    val action3 = com.example.ai.KharchaAiService.parseWithLocalNlp(
      "Dukan se 1200 ka rashan liya cash me",
      expenseCategories,
      incomeCategories
    )
    assertEquals("OUT", action3.type)
    assertEquals(1200.0, action3.amount, 0.01)
    assertEquals("Groceries", action3.category)
    assertEquals("Cash", action3.paymentMode)

    // Test 4: Set Budget
    val action4 = com.example.ai.KharchaAiService.parseWithLocalNlp(
      "Rent ka budget 15000 set kardo",
      expenseCategories,
      incomeCategories
    )
    assertEquals("SET_BUDGET", action4.action)
    assertEquals(15000.0, action4.amount, 0.01)
    assertEquals("Rent", action4.category)
  }
}
